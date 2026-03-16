import { useState, useCallback, useRef } from 'react';
import { GameState, GamePhase, Patron, FightMove, BarLocation, Disturbance } from '../game/types';
import { BAR_CONFIGS } from '../game/locations';
import { generatePatronQueue, getIdAgeDisplay } from '../game/patrons';
import { fightRound, PLAYER_MAX_HP, getEnemyMaxHP } from '../game/fight';
import { calcPatronRevenue, calcScoreForDecision, SCORING } from '../game/scoring';
import {
  calcMeterIncreaseForUnderage,
  calcBribeCost,
  POLICE_BUST_THRESHOLD,
  POLICE_WARNING_THRESHOLD,
  POLICE_METER_EVENTS,
} from '../game/police';

const DISTURBANCE_TYPES: Disturbance['type'][] = [
  'fight_inside', 'drugs', 'harassment', 'vomiting', 'property_damage',
];
const DISTURBANCE_MESSAGES: Record<Disturbance['type'], string> = {
  fight_inside: 'throwing punches at the bar',
  drugs: 'doing drugs in the bathroom',
  harassment: 'harassing other patrons',
  vomiting: 'getting sick on the dance floor',
  property_damage: 'smashing glasses and a chair',
};

function makeDisturbance(patron: Patron): Disturbance {
  const type = DISTURBANCE_TYPES[Math.floor(Math.random() * DISTURBANCE_TYPES.length)];
  return {
    patronId: patron.id,
    patronName: patron.name,
    type,
    description: `${patron.name} is ${DISTURBANCE_MESSAGES[type]}.`,
    fightLevel: patron.fightLevel,
    policeThreat: 15,
  };
}

function buildInitialState(location: BarLocation): GameState {
  const locationConfig = BAR_CONFIGS[location];
  const queue = generatePatronQueue(location, locationConfig.patronsPerNight);
  return {
    phase: 'night_intro',
    location,
    locationConfig,
    night: 1,
    balance: 0,
    score: 0,
    patronsProcessed: 0,
    patronQueue: queue,
    currentPatron: null,
    pendingDisturbances: [],
    policeMeter: 0,
    policeWarningShown: false,
    lastDecisionCorrect: null,
    lastMoneyChange: 0,
    fightHP: [PLAYER_MAX_HP, 0],
    fightRounds: [],
    fightPatron: null,
    gameOverReason: '',
    showApproveFlash: false,
    showRejectFlash: false,
    patronsLetIn: 0,
    underage_let_in: 0,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => buildInitialState('dive'));
  const disturbanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateState = useCallback((partial: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Start / Reset ────────────────────────────────────────────────────────

  const startGame = useCallback((location: BarLocation) => {
    if (disturbanceTimerRef.current) clearTimeout(disturbanceTimerRef.current);
    setState(buildInitialState(location));
  }, []);

  // ── Night Intro → First Patron ───────────────────────────────────────────

  const beginNight = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'waiting' }));
  }, []);

  // ── Advance to Next Patron ───────────────────────────────────────────────

  const nextPatron = useCallback(() => {
    setState(prev => {
      if (prev.pendingDisturbances.length > 0) {
        return { ...prev, phase: 'disturbance' };
      }
      if (prev.patronQueue.length === 0) {
        return { ...prev, phase: 'night_end' };
      }
      const [next, ...rest] = prev.patronQueue;
      return {
        ...prev,
        phase: 'patron_approach',
        currentPatron: next,
        patronQueue: rest,
        lastDecisionCorrect: null,
        lastMoneyChange: 0,
        showApproveFlash: false,
        showRejectFlash: false,
      };
    });
  }, []);

  const viewID = useCallback(() => {
    updateState({ phase: 'id_check' });
  }, [updateState]);

  const openTriviaCheck = useCallback(() => {
    updateState({ phase: 'trivia_check' });
  }, [updateState]);

  const closeTriviaCheck = useCallback(() => {
    updateState({ phase: 'id_check' });
  }, [updateState]);

  const openEmotionalPhase = useCallback(() => {
    updateState({ phase: 'emotional' });
  }, [updateState]);

  // ── Make Decision ────────────────────────────────────────────────────────

  const makeDecision = useCallback((approved: boolean) => {
    setState(prev => {
      const patron = prev.currentPatron;
      if (!patron) return prev;

      const config = prev.locationConfig;
      const revenue = calcPatronRevenue(patron, config, approved);
      const scoreChange = calcScoreForDecision(patron, approved);
      const newBalance = prev.balance + revenue;
      const newScore = prev.score + scoreChange;

      let newMeter = prev.policeMeter;
      let gameOverReason = '';
      let newPhase: GamePhase = 'waiting';

      // Police meter impact
      if (approved && !patron.idIsValid) {
        newMeter = Math.min(100, newMeter + calcMeterIncreaseForUnderage(config));
      }
      if (approved && patron.type === 'undercover_cop') {
        // Letting in undercover cop is fine, angering them is not (handled elsewhere)
      }
      // Natural decay per patron
      newMeter = Math.max(0, newMeter + POLICE_METER_EVENTS.NATURAL_DECAY_PER_PATRON);

      // Check police bust
      if (newMeter >= POLICE_BUST_THRESHOLD) {
        gameOverReason = '🚨 The police raided the bar. You\'re arrested.';
        return {
          ...prev,
          phase: 'game_over',
          balance: newBalance,
          score: newScore,
          policeMeter: newMeter,
          gameOverReason,
          showApproveFlash: approved,
          showRejectFlash: !approved,
        };
      }

      // Disturbance scheduling
      let newDisturbances = [...prev.pendingDisturbances];
      if (approved && patron.willCauseTrouble) {
        newDisturbances.push(makeDisturbance(patron));
      }

      // Check balance
      if (newBalance < 0 && prev.patronQueue.length === 0) {
        gameOverReason = `💸 Night ended with ${formatMoney(newBalance)}. You're fired.`;
        return {
          ...prev,
          phase: 'game_over',
          balance: newBalance,
          score: newScore,
          policeMeter: newMeter,
          pendingDisturbances: newDisturbances,
          gameOverReason,
          showApproveFlash: approved,
          showRejectFlash: !approved,
        };
      }

      // Police warning threshold
      const showWarning = newMeter >= POLICE_WARNING_THRESHOLD && !prev.policeWarningShown;
      if (showWarning) {
        newPhase = 'police_warning';
      } else if (newDisturbances.length > 0 && !approved) {
        newPhase = 'disturbance';
      }

      return {
        ...prev,
        phase: newPhase,
        balance: newBalance,
        score: newScore,
        patronsProcessed: prev.patronsProcessed + 1,
        patronsLetIn: approved ? prev.patronsLetIn + 1 : prev.patronsLetIn,
        underage_let_in: (approved && !patron.idIsValid) ? prev.underage_let_in + 1 : prev.underage_let_in,
        policeMeter: newMeter,
        policeWarningShown: showWarning ? true : prev.policeWarningShown,
        lastDecisionCorrect: (approved && patron.idIsValid) || (!approved && !patron.idIsValid),
        lastMoneyChange: revenue,
        pendingDisturbances: newDisturbances,
        currentPatron: patron,
        showApproveFlash: approved,
        showRejectFlash: !approved,
      };
    });
  }, []);

  // ── Police Warning Dismiss ───────────────────────────────────────────────

  const dismissPoliceWarning = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: prev.pendingDisturbances.length > 0 ? 'disturbance' : 'waiting',
    }));
  }, []);

  // ── Bribe ────────────────────────────────────────────────────────────────

  const openBribe = useCallback(() => {
    updateState({ phase: 'bribe' });
  }, [updateState]);

  const payBribe = useCallback(() => {
    setState(prev => {
      const cost = calcBribeCost(prev.locationConfig, prev.policeMeter);
      if (prev.balance < cost) return prev; // can't afford
      return {
        ...prev,
        balance: prev.balance - cost,
        score: prev.score + SCORING.BRIBE_PAID,
        policeMeter: Math.max(0, prev.policeMeter + POLICE_METER_EVENTS.BRIBE_ACCEPTED),
        phase: 'waiting',
      };
    });
  }, []);

  const declineBribe = useCallback(() => {
    updateState({ phase: 'waiting' });
  }, [updateState]);

  // ── Disturbance ──────────────────────────────────────────────────────────

  const handleDisturbance = useCallback((eject: boolean) => {
    setState(prev => {
      const [disturbance, ...rest] = prev.pendingDisturbances;
      if (!disturbance) return { ...prev, phase: 'waiting' };

      if (eject) {
        // Find patron by id in "let in" pool — they want to fight back
        const fightPatron: Patron = {
          id: disturbance.patronId,
          name: disturbance.patronName,
          type: 'troublemaker',
          actualAge: 25,
          idBirthYear: 2001,
          idState: { name: 'Texas', abbreviation: 'TX', capital: 'Austin' },
          idCapitalIsCorrect: true,
          idExpiry: '12/2027',
          idIsValid: true,
          fakeType: 'none',
          emotionalType: 'none',
          emotionalLine: '',
          spendValue: 0,
          willCauseTrouble: true,
          fightLevel: disturbance.fightLevel,
          portrait: '😤',
          description: 'Resisting ejection.',
        };

        return {
          ...prev,
          pendingDisturbances: rest,
          fightPatron,
          fightHP: [PLAYER_MAX_HP, getEnemyMaxHP(disturbance.fightLevel)],
          fightRounds: [],
          phase: 'fight',
          score: prev.score + SCORING.DISTURBANCE_HANDLED,
        };
      } else {
        // Ignore disturbance: police meter up
        return {
          ...prev,
          pendingDisturbances: rest,
          policeMeter: Math.min(100, prev.policeMeter + disturbance.policeThreat),
          score: prev.score + SCORING.DISTURBANCE_IGNORED,
          phase: 'waiting',
        };
      }
    });
  }, []);

  // ── Fight ────────────────────────────────────────────────────────────────

  const executeFightMove = useCallback((move: FightMove) => {
    setState(prev => {
      const patron = prev.fightPatron;
      if (!patron) return prev;

      const round = fightRound(move, patron.fightLevel);
      const [playerHP, enemyHP] = prev.fightHP;
      const newPlayerHP = Math.max(0, playerHP - round.playerDamage);
      const newEnemyHP = Math.max(0, enemyHP - round.enemyDamage);
      const rounds = [...prev.fightRounds, round];

      if (newPlayerHP === 0) {
        return {
          ...prev,
          fightHP: [0, newEnemyHP],
          fightRounds: rounds,
          phase: 'game_over',
          gameOverReason: `🥊 You lost the fight against ${patron.name}. Down for the count.`,
          score: prev.score + SCORING.FIGHT_LOSE,
        };
      }

      if (newEnemyHP === 0) {
        return {
          ...prev,
          fightHP: [newPlayerHP, 0],
          fightRounds: rounds,
          phase: 'waiting',
          fightPatron: null,
          score: prev.score + SCORING.FIGHT_WIN,
        };
      }

      return {
        ...prev,
        fightHP: [newPlayerHP, newEnemyHP],
        fightRounds: rounds,
      };
    });
  }, []);

  // ── Night End ────────────────────────────────────────────────────────────

  const endNight = useCallback(() => {
    setState(prev => {
      if (prev.balance < 0) {
        return {
          ...prev,
          phase: 'game_over',
          gameOverReason: `💸 You ended the night ${formatMoney(prev.balance)} in the hole.`,
        };
      }
      return { ...prev, phase: 'night_end' };
    });
  }, []);

  const goToMenu = useCallback(() => {
    setState(buildInitialState('dive'));
  }, []);

  return {
    state,
    startGame,
    beginNight,
    nextPatron,
    viewID,
    openTriviaCheck,
    closeTriviaCheck,
    openEmotionalPhase,
    makeDecision,
    dismissPoliceWarning,
    openBribe,
    payBribe,
    declineBribe,
    handleDisturbance,
    executeFightMove,
    endNight,
    goToMenu,
  };
}

function formatMoney(amount: number): string {
  const abs = Math.abs(amount);
  return amount < 0 ? `-$${abs}` : `$${abs}`;
}
