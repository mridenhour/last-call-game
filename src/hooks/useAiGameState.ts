import { useState, useCallback, useRef, useEffect } from 'react';
import { AiGamePhase, AiGameState, BouncerPersonality } from '../game/aiTypes';
import { BarLocation } from '../game/types';
import { BAR_CONFIGS } from '../game/locations';
import { usePatronGeneration } from './usePatronGeneration';
import { useConversation } from './useConversation';
import { useBouncerPersonality } from './useBouncerPersonality';
import { useFight } from './useFight';
import { useVoice } from './useVoice';

const POLICE_INCREASE_BAD_CALL = 18;
const POLICE_INCREASE_BRIBE_ACCEPT_SMALL = 15;
const POLICE_INCREASE_BRIBE_ACCEPT_LARGE = 30;
const POLICE_BUST_THRESHOLD = 100;

export function useAiGameState(location: BarLocation) {
  const locationConfig = BAR_CONFIGS[location];
  const voice = useVoice();
  const { personality, addBouncerMessage, reset: resetPersonality } = useBouncerPersonality();
  const generation = usePatronGeneration();
  const conversation = useConversation(generation.patron, personality, voice);
  const fight = useFight();

  const [phase, setPhase] = useState<AiGamePhase>('generating');
  const [balance, setBalance] = useState(0);
  const [score, setScore] = useState(0);
  const [patronsProcessed, setPatronsProcessed] = useState(0);
  const [policeMeter, setPoliceMeter] = useState(0);
  const [night, setNight] = useState(1);
  const [playerDecision, setPlayerDecision] = useState<'letIn' | 'reject' | null>(null);
  const [gameOverReason, setGameOverReason] = useState('');

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start generating when first mounted
  useEffect(() => {
    startRound();
  }, []);

  // When patron is generated, move to intro
  useEffect(() => {
    if (generation.generation.status === 'success' && generation.patron && phase === 'generating') {
      setPhase('patron_intro');
    }
  }, [generation.generation.status, generation.patron]);

  // When patron_intro is ready, get opening line
  useEffect(() => {
    if (phase === 'patron_intro' && generation.patron) {
      conversation.getOpeningLine().then(() => {
        setPhase('conversation');
      });
    }
  }, [phase]);

  // Silence timer: if no bouncer message for 8s during conversation, patron fills silence
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (phase === 'conversation') {
        conversation.triggerSilenceResponse();
      }
    }, 8000);
  }, [phase, conversation]);

  // Reset silence timer when conversation messages change
  useEffect(() => {
    if (phase === 'conversation') resetSilenceTimer();
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [conversation.messages.length, phase]);

  const startRound = useCallback(async () => {
    voice.stopSpeech();
    resetPersonality();
    conversation.reset();
    generation.reset();
    setPlayerDecision(null);
    setPhase('generating');
    generation.generate(location);
  }, [location, voice, resetPersonality, conversation, generation]);

  const sendBouncerMessage = useCallback(async (text: string) => {
    addBouncerMessage(text);
    resetSilenceTimer();
    await conversation.sendBouncerMessage(text);
  }, [addBouncerMessage, conversation, resetSilenceTimer]);

  const makeDecision = useCallback((decision: 'letIn' | 'reject') => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    voice.stopSpeech();
    setPlayerDecision(decision);

    const patron = generation.patron!;
    const correct = decision === patron.correctDecision;
    const scoreChange = correct ? patron.scoringCorrect : patron.scoringWrong;
    const revenue = decision === 'letIn' ? locationConfig.entryFee + (patron.sobriety > 50 ? 20 : 5) : 0;

    setScore(s => s + scoreChange);
    setBalance(b => b + revenue);
    setPatronsProcessed(p => p + 1);

    if (!correct) {
      setPoliceMeter(m => {
        const next = Math.min(POLICE_BUST_THRESHOLD, m + POLICE_INCREASE_BAD_CALL);
        return next;
      });
    }

    setPhase('dossier');
  }, [generation.patron, locationConfig, voice]);

  const respondToBribe = useCallback((response: 'accept' | 'reject' | 'counter') => {
    const bribe = conversation.pendingBribe;
    if (!bribe) return;

    if (response === 'accept') {
      const amount = bribe.amount;
      setBalance(b => b + amount);
      const heatIncrease = amount >= 50 ? POLICE_INCREASE_BRIBE_ACCEPT_LARGE : POLICE_INCREASE_BRIBE_ACCEPT_SMALL;
      setPoliceMeter(m => Math.min(POLICE_BUST_THRESHOLD, m + heatIncrease));
      conversation.clearBribe();
      // Check if bribe triggers bust
      setPoliceMeter(m => {
        if (m >= POLICE_BUST_THRESHOLD) {
          setGameOverReason('🚨 Caught taking bribes. The police raided the bar.');
          setPhase('game_over');
        }
        return m;
      });
    } else if (response === 'reject') {
      conversation.clearBribe();
      // Bouncer message that they declined
      sendBouncerMessage('Keep your money. That\'s not how I work.');
    } else {
      // Counter — send a counter message and let conversation play out
      conversation.clearBribe();
      sendBouncerMessage(`${bribe.amount} isn't enough. Double it, or we're done here.`);
    }
  }, [conversation, sendBouncerMessage]);

  const proceedToFight = useCallback(() => {
    if (!generation.patron) return;
    fight.startFight(generation.patron, personality);
    setPhase('fight');
  }, [generation.patron, fight, personality]);

  const onFightEnd = useCallback((won: boolean) => {
    if (won) {
      setScore(s => s + 50);
      setPhase('generating');
      startRound();
    } else {
      setGameOverReason(`🥊 ${generation.patron?.name ?? 'The patron'} put you down. Night over.`);
      setPhase('game_over');
    }
  }, [generation.patron, startRound]);

  const nextPatron = useCallback(() => {
    // Check game-ending conditions
    if (policeMeter >= POLICE_BUST_THRESHOLD) {
      setGameOverReason('🚨 Police busted the bar. You\'re done.');
      setPhase('game_over');
      return;
    }
    if (balance < 0 && patronsProcessed >= 5) {
      setGameOverReason(`💸 You're ${balance < 0 ? Math.abs(balance) : 0} in the hole. Night over.`);
      setPhase('game_over');
      return;
    }
    startRound();
  }, [policeMeter, balance, patronsProcessed, startRound]);

  const retry = useCallback(() => {
    generation.generate(location);
    setPhase('generating');
  }, [generation, location]);

  return {
    // State
    phase,
    patron: generation.patron,
    conversation: conversation.messages,
    isPatronTyping: conversation.isPatronTyping,
    pendingBribe: conversation.pendingBribe,
    personality,
    playerDecision,
    generation: generation.generation,
    fight,
    balance,
    score,
    patronsProcessed,
    policeMeter,
    night,
    isMuted: voice.isMuted,
    gameOverReason,
    locationConfig,
    location,

    // Actions
    sendBouncerMessage,
    makeDecision,
    respondToBribe,
    toggleMute: voice.toggleMute,
    proceedToFight,
    onFightEnd,
    nextPatron,
    retry,
  };
}
