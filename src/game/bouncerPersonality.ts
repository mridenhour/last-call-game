import { BouncerPersonality } from './aiTypes';

const TOUGH_SIGNALS = [
  'no', 'out', 'leave', 'move', 'next', 'done', 'nope', 'not tonight',
  'beat it', 'walk', 'get lost', 'move along', 'forget it', 'not a chance',
  'end of story', 'that\'s it', 'over', 'step aside', 'goodbye',
];

const SARCASTIC_SIGNALS = [
  'seriously', 'really', 'sure', 'obviously', 'clearly', 'right', 'wow',
  'great', 'fantastic', 'brilliant', 'shocking', 'surprising', 'who knew',
  'of course', 'naturally', 'genius', 'nice try', 'good one', 'classic',
  'sure thing', 'yeah right', 'oh wow', 'fascinating', 'love that',
];

const BYBOOK_SIGNALS = [
  'policy', 'rules', 'required', 'regulation', 'procedure', 'cannot', 'must',
  'protocol', 'standard', 'allowed', 'prohibited', 'authorized', 'permit',
  'id required', 'need to see', 'have to', 'not permitted', 'against',
  'legally', 'technically', 'official', 'formally',
];

const EMPATHETIC_SIGNALS = [
  'understand', 'sorry', 'hear you', 'must be', 'sounds like', 'okay',
  'tell me', 'look', 'i get it', 'i know', 'that\'s tough', 'must feel',
  'appreciate', 'thank you for', 'respect that', 'makes sense', 'totally',
  'definitely', 'of course', 'no worries', 'take your time',
];

function scoreMessage(text: string, signals: string[]): number {
  const lower = text.toLowerCase();
  return signals.filter(s => lower.includes(s)).length;
}

export function inferPersonality(bouncerMessages: string[]): BouncerPersonality {
  if (bouncerMessages.length === 0) return 'By-the-Book';

  const recent = bouncerMessages.slice(-3);
  const combined = recent.join(' ');

  const scores: Record<BouncerPersonality, number> = {
    Tough: 0,
    Sarcastic: 0,
    'By-the-Book': 0,
    Empathetic: 0,
  };

  // Score based on signal words
  scores.Tough += scoreMessage(combined, TOUGH_SIGNALS) * 2;
  scores.Sarcastic += scoreMessage(combined, SARCASTIC_SIGNALS) * 2;
  scores['By-the-Book'] += scoreMessage(combined, BYBOOK_SIGNALS) * 2;
  scores.Empathetic += scoreMessage(combined, EMPATHETIC_SIGNALS) * 2;

  // Length heuristic: short messages lean Tough
  const avgLen = recent.reduce((s, m) => s + m.length, 0) / recent.length;
  if (avgLen < 20) scores.Tough += 3;
  if (avgLen > 80) scores.Empathetic += 2;

  // Question marks lean Empathetic
  const questions = combined.split('?').length - 1;
  scores.Empathetic += questions;

  // Exclamation marks lean Tough or Sarcastic
  const exclamations = combined.split('!').length - 1;
  scores.Tough += Math.floor(exclamations / 2);

  // Find winner
  const winner = Object.entries(scores).reduce(
    (best, [k, v]) => (v > best[1] ? [k, v] : best),
    ['By-the-Book', -1],
  );

  return winner[0] as BouncerPersonality;
}
