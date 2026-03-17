import { callAnthropic } from './anthropic';
import { AIPatron } from '../game/aiTypes';
import { BarLocation } from '../game/types';
import { BAR_CONFIGS } from '../game/locations';

const GENERATION_SYSTEM_PROMPT = `You are a procedural character generator for a psychological bouncer simulation game. Generate a unique, psychologically complex bar patron. Vary ages 18-55, backgrounds, deception sophistication, and patron types widely.
Respond ONLY with valid JSON, no markdown, no backticks:
{"name":"First Last","emoji":"one emoji","gender":"male or female","visibleInfo":"2-3 sentence physical description of what the bouncer observes","hiddenTruth":"one sentence revealing what is actually true","correctDecision":"letIn or reject","scoringCorrect":100,"scoringWrong":-120,"sobriety":75,"sobrietyLabel":"descriptive label","deceptionType":"short label","hasID":true,"traits":["t1","t2","t3","t4"],"darkTriad":"2-3 sentence dark triad analysis","defenses":"2-3 sentence defense mechanism analysis","attachment":"1-2 sentence attachment style description","manipulation":"2-3 sentence manipulation tactic analysis","tells":["tell1","tell2","tell3","tell4","tell5"],"voicePitch":1.0,"voiceRate":1.0,"voiceDesc":"brief voice character description","backstory":"2-3 sentence rich backstory never revealed directly","triggerPoints":"what questions or topics cause them to slip up or become defensive","fightStyle":"how they fight if ejected — speed, aggression, and key dialogue","bribeAmount":0}
Vary deception types randomly: underage with fake ID, borrowed sibling ID, banned patron with new ID, valid but dangerously drunk, completely legitimate anxious patron, drug dealer with valid ID, valid confident patron, forgot ID entirely. For forgot ID patrons set hasID to false and bribeAmount to a small amount like 5-20. For sophisticated patrons set bribeAmount to 50-200. Make tells psychologically specific and clever — the kind a trained psychologist would notice.`;

const DECEPTION_HINTS = [
  'underage with convincing fake ID',
  'banned patron with new ID',
  'valid but dangerously drunk',
  'completely legitimate anxious patron',
  'drug dealer with valid ID',
  'valid confident business person',
  'underage using older sibling ID',
  'patron who forgot their ID entirely',
];

const NAME_HINTS = [
  'Give them an unusual name.',
  'Give them a very common name.',
  'Give them a culturally diverse name.',
  'Give them an ironic name.',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildGenerationUserMessage(location: BarLocation): string {
  const deception = rand(DECEPTION_HINTS);
  const nameHint = rand(NAME_HINTS);
  const barName = BAR_CONFIGS[location].subtitle;
  return `Generate a patron for a ${barName}. Deception type: ${deception}. ${nameHint} Seed: ${Date.now()}`;
}

export async function generateAiPatron(location: BarLocation): Promise<AIPatron> {
  const userMsg = buildGenerationUserMessage(location);
  const raw = await callAnthropic(
    [{ role: 'user', content: userMsg }],
    GENERATION_SYSTEM_PROMPT,
    1200,
  );

  // Strip any accidental markdown code fences
  const jsonStr = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  let parsed: AIPatron;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse patron JSON: ${String(e)}\nRaw: ${raw.slice(0, 200)}`);
  }

  // Validate required fields
  const required: (keyof AIPatron)[] = ['name', 'emoji', 'visibleInfo', 'hiddenTruth', 'correctDecision', 'tells', 'fightStyle'];
  for (const field of required) {
    if (!(field in parsed)) throw new Error(`Missing field: ${field}`);
  }

  // Clamp numeric values
  parsed.sobriety = Math.max(0, Math.min(100, parsed.sobriety ?? 75));
  parsed.voicePitch = Math.max(0.5, Math.min(2.0, parsed.voicePitch ?? 1.0));
  parsed.voiceRate = Math.max(0.5, Math.min(2.0, parsed.voiceRate ?? 1.0));
  parsed.bribeAmount = Math.max(0, parsed.bribeAmount ?? 0);
  parsed.hasID = parsed.hasID !== false;

  // Ensure arrays
  if (!Array.isArray(parsed.tells)) parsed.tells = [];
  if (!Array.isArray(parsed.traits)) parsed.traits = [];

  return parsed;
}
