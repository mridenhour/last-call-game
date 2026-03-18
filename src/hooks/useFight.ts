import { useState, useCallback, useRef, useEffect } from 'react';
import { AIPatron, FightState, FightPhase, FightMoveChoice } from '../game/aiTypes';
import {
  generatePhase1Tell,
  generatePhase3Options,
  PLAYER_FIGHT_HP,
  getEnemyFightHP,
  getHitDamage,
  getMissPenalty,
} from '../game/fightPhases';
import { BouncerPersonality } from '../game/aiTypes';

export type Zone = 'left' | 'center' | 'right';
export type PromptType = 'attack' | 'defend';

export interface ActivePrompt {
  id: string;
  type: PromptType;
  zone: Zone;
  expiresAt: number;
  windowMs: number;
}

export interface FightHook {
  fightState: FightState;
  activePrompt: ActivePrompt | null;
  handlePhase1Choice: (choice: FightMoveChoice) => void;
  handleZoneTap: (zone: Zone) => void;
  handlePhase3Choice: (index: number) => void;
  startFight: (patron: AIPatron, personality: BouncerPersonality) => void;
}

const ZONES: Zone[] = ['left', 'center', 'right'];

function makePromptId() {
  return `prompt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function useFight(): FightHook {
  const [fightState, setFightState] = useState<FightState>({
    phase: 'standoff',
    playerHP: PLAYER_FIGHT_HP,
    enemyHP: 60,
    playerMaxHP: PLAYER_FIGHT_HP,
    enemyMaxHP: 60,
    speedMultiplier: 1.0,
    phase1Tell: null,
    phase1Result: null,
    phase3Options: [],
    phase3Line: '',
    winner: null,
    log: [],
  });
  const [activePrompt, setActivePrompt] = useState<ActivePrompt | null>(null);

  const patronRef = useRef<AIPatron | null>(null);
  const fightStateRef = useRef(fightState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(1.0);
  const phaseRef = useRef<FightPhase>('standoff');

  fightStateRef.current = fightState;

  const stopExchange = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (promptTimeoutRef.current) { clearTimeout(promptTimeoutRef.current); promptTimeoutRef.current = null; }
    setActivePrompt(null);
  }, []);

  // Spawn next prompt
  const spawnPrompt = useCallback(() => {
    if (phaseRef.current !== 'exchange') return;
    const type: PromptType = Math.random() < 0.55 ? 'attack' : 'defend';
    const zone = ZONES[Math.floor(Math.random() * 3)];
    const baseWindow = 1400 / speedRef.current;
    const windowMs = Math.max(600, baseWindow);
    const prompt: ActivePrompt = {
      id: makePromptId(),
      type,
      zone,
      expiresAt: Date.now() + windowMs,
      windowMs,
    };
    setActivePrompt(prompt);

    // Auto-expire prompt
    promptTimeoutRef.current = setTimeout(() => {
      setActivePrompt(prev => {
        if (prev?.id !== prompt.id) return prev;
        // Missed! If attack prompt expired without tap → no damage, no penalty
        // If defend prompt expired without tap → player takes damage
        if (type === 'defend') {
          const patron = patronRef.current!;
          const dmg = getHitDamage(patron, speedRef.current);
          setFightState(fs => {
            const newHP = Math.max(0, fs.playerHP - dmg);
            const log = [...fs.log, `Missed block — took ${dmg} damage!`];
            if (newHP <= 0) {
              phaseRef.current = 'result';
              stopExchange();
              return { ...fs, playerHP: 0, phase: 'result', winner: 'enemy', log };
            }
            if (newHP <= fs.playerMaxHP * 0.25 && fs.phase === 'exchange') {
              const p3 = generatePhase3Options(patron, 'By-the-Book');
              phaseRef.current = 'breaking_point';
              stopExchange();
              return {
                ...fs, playerHP: newHP,
                phase: 'breaking_point',
                phase3Options: p3.options,
                phase3Line: p3.line,
                log: [...log, `You're at ${newHP}HP — breaking point!`],
              };
            }
            return { ...fs, playerHP: newHP, log };
          });
        }
        return null;
      });
    }, windowMs);
  }, [stopExchange]);

  const startExchangeLoop = useCallback(() => {
    stopExchange();
    phaseRef.current = 'exchange';
    spawnPrompt();
    intervalRef.current = setInterval(() => {
      spawnPrompt();
    }, 1600 / speedRef.current);

    // Speed escalation every 5s
    const speedEscalation = setInterval(() => {
      if (phaseRef.current !== 'exchange') { clearInterval(speedEscalation); return; }
      speedRef.current = Math.min(speedRef.current + 0.2, 2.5);
      // Reset interval with new speed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(spawnPrompt, 1600 / speedRef.current);
      }
    }, 5000);

    return () => clearInterval(speedEscalation);
  }, [stopExchange, spawnPrompt]);

  const startFight = useCallback((patron: AIPatron, personality: BouncerPersonality) => {
    patronRef.current = patron;
    speedRef.current = 1.0;
    phaseRef.current = 'standoff';
    const enemyHP = getEnemyFightHP(patron);
    const tell = generatePhase1Tell(patron);
    const p3 = generatePhase3Options(patron, personality);
    setFightState({
      phase: 'standoff',
      playerHP: PLAYER_FIGHT_HP,
      enemyHP,
      playerMaxHP: PLAYER_FIGHT_HP,
      enemyMaxHP: enemyHP,
      speedMultiplier: 1.0,
      phase1Tell: tell,
      phase1Result: null,
      phase3Options: p3.options,
      phase3Line: p3.line,
      winner: null,
      log: [],
    });
    setActivePrompt(null);
  }, []);

  const handlePhase1Choice = useCallback((choice: FightMoveChoice) => {
    setFightState(fs => {
      if (!fs.phase1Tell) return fs;
      const correct = choice === fs.phase1Tell.correctMove;
      const advantage = correct ? 'advantage' : 'disadvantage';
      const enemyHPMod = correct ? Math.round(fs.enemyHP * 0.8) : fs.enemyHP;
      const playerHPMod = correct ? fs.playerHP : Math.max(0, fs.playerHP - getHitDamage(patronRef.current!, 1.0));
      const log = correct
        ? [`✅ Correct read! ${fs.phase1Tell.advantage}`]
        : [`❌ Wrong read — took the first hit.`];
      phaseRef.current = 'exchange';
      return {
        ...fs,
        phase: 'exchange',
        phase1Result: advantage,
        playerHP: playerHPMod,
        enemyHP: enemyHPMod,
        log,
      };
    });
    startExchangeLoop();
  }, [startExchangeLoop]);

  const handleZoneTap = useCallback((zone: Zone) => {
    setActivePrompt(prev => {
      if (!prev) return null;
      const patron = patronRef.current!;
      const dmg = getHitDamage(patron, speedRef.current);
      const penalty = getMissPenalty();

      if (prev.type === 'attack') {
        if (prev.zone === zone) {
          // Hit!
          setFightState(fs => {
            const newEnemyHP = Math.max(0, fs.enemyHP - dmg);
            const log = [...fs.log, `Hit! ${dmg} damage to ${patron.name}.`];
            if (newEnemyHP === 0) {
              phaseRef.current = 'result';
              stopExchange();
              return { ...fs, enemyHP: 0, phase: 'result', winner: 'player', log };
            }
            if (newEnemyHP <= fs.enemyMaxHP * 0.25 && fs.phase === 'exchange') {
              phaseRef.current = 'breaking_point';
              stopExchange();
              return { ...fs, enemyHP: newEnemyHP, phase: 'breaking_point', log: [...log, 'Breaking point triggered!'] };
            }
            return { ...fs, enemyHP: newEnemyHP, log };
          });
        } else {
          // Miss — small penalty
          setFightState(fs => ({ ...fs, playerHP: Math.max(0, fs.playerHP - penalty), log: [...fs.log, 'Missed!'] }));
        }
      } else {
        // Defend prompt — any zone tap = block
        setFightState(fs => ({ ...fs, log: [...fs.log, 'Blocked!'] }));
      }
      return null;
    });
  }, [stopExchange]);

  const handlePhase3Choice = useCallback((index: number) => {
    setFightState(fs => {
      const option = fs.phase3Options[index];
      if (!option) return fs;
      if (option.isCorrect) {
        return { ...fs, phase: 'result', winner: 'player', log: [...fs.log, `✅ ${option.explanation}`] };
      } else {
        // Wrong — re-enter exchange at higher speed
        speedRef.current = Math.min(speedRef.current + 0.5, 2.5);
        phaseRef.current = 'exchange';
        startExchangeLoop();
        return { ...fs, phase: 'exchange', log: [...fs.log, `❌ ${option.explanation}`] };
      }
    });
  }, [startExchangeLoop]);

  // Cleanup on unmount
  useEffect(() => () => stopExchange(), [stopExchange]);

  return { fightState, activePrompt, handlePhase1Choice, handleZoneTap, handlePhase3Choice, startFight };
}
