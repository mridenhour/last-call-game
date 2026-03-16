import { BarConfig, Patron } from './types';

export const POLICE_METER_EVENTS = {
  UNDERAGE_LET_IN: 20,
  DISTURBANCE_IGNORED: 12,
  UNDERCOVER_COP_ANGERED: 40,
  BRIBE_ACCEPTED: -30,       // negative = reduces meter
  NATURAL_DECAY_PER_PATRON: -1,
};

export const POLICE_WARNING_THRESHOLD = 70;
export const POLICE_BUST_THRESHOLD = 100;

export function getPoliceWarningMessage(meter: number): string {
  if (meter >= 90) return '🚨 POLICE ARE OUTSIDE. One more mistake and it\'s over.';
  if (meter >= 70) return '🚔 Patrol car circling the block. Watch yourself.';
  if (meter >= 50) return '👮 Someone called the cops. Keep it clean.';
  return '⚠️ You\'re on their radar.';
}

export function calcMeterIncreaseForUnderage(config: BarConfig): number {
  return Math.round(POLICE_METER_EVENTS.UNDERAGE_LET_IN * config.policeAggression * 1.5);
}

export function calcBribeCost(config: BarConfig, currentMeter: number): number {
  // Higher meter = higher bribe cost
  const multiplier = currentMeter > 80 ? 2 : currentMeter > 60 ? 1.5 : 1;
  return Math.round(config.bribeCost * multiplier);
}

export function canAffordBribe(balance: number, bribeCost: number): boolean {
  return balance >= bribeCost;
}

export function undercoverCopCaught(patron: Patron): boolean {
  // An undercover cop is "caught" if you let them in and act suspicious
  // They're always valid age, always let in = no immediate penalty
  // But if you turn them away rudely or they witness an underage patron, bust
  return patron.type === 'undercover_cop';
}
