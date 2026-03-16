import { Patron, BarConfig } from './types';

export const SCORING = {
  CORRECT_APPROVE: 10,     // correctly approved a valid ID
  CORRECT_REJECT: 15,      // correctly turned away fake ID
  WRONG_APPROVE: -20,      // let in underage / fake
  WRONG_REJECT: -5,        // turned away a valid ID
  FIGHT_WIN: 25,
  FIGHT_LOSE: -50,
  BRIBE_PAID: -10,
  DISTURBANCE_HANDLED: 10,
  DISTURBANCE_IGNORED: -15,
  SURVIVE_NIGHT: 100,
  LOCATION_BONUS: 50,      // per location level cleared
};

export function calcPatronRevenue(patron: Patron, config: BarConfig, approved: boolean): number {
  if (!approved) return 0;
  return config.entryFee + patron.spendValue;
}

export function calcScoreForDecision(patron: Patron, approved: boolean): number {
  const isValid = patron.idIsValid;
  if (approved && isValid) return SCORING.CORRECT_APPROVE;
  if (!approved && !isValid) return SCORING.CORRECT_REJECT;
  if (approved && !isValid) return SCORING.WRONG_APPROVE;
  if (!approved && isValid) return SCORING.WRONG_REJECT;
  return 0;
}

export function getNightGrade(score: number, patronsProcessed: number): string {
  const avg = patronsProcessed > 0 ? score / patronsProcessed : 0;
  if (avg >= 12) return 'S';
  if (avg >= 8) return 'A';
  if (avg >= 5) return 'B';
  if (avg >= 2) return 'C';
  return 'D';
}

export function formatMoney(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 0 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}
