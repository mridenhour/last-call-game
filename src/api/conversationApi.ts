import { callAnthropic, ApiMessage } from './anthropic';
import { AIPatron, ConversationMessage, BouncerPersonality } from '../game/aiTypes';

function buildRoleplaySystemPrompt(patron: AIPatron, bouncerPersonality: BouncerPersonality): string {
  const hasIDText = patron.hasID
    ? 'You have your ID with you.'
    : 'You forgot your ID at home (or never had one). You must talk your way in entirely.';

  const brideText = patron.bribeAmount > 0
    ? `If you feel you are losing the interaction, you may spontaneously attempt to offer a bribe of $${patron.bribeAmount}. Do this naturally — a desperate drunk might awkwardly shove cash forward, a sophisticated manipulator might slide it across smoothly.`
    : 'Do not offer bribes.';

  return `You are roleplaying as ${patron.name}, trying to enter a bar. A bouncer is assessing you.

HIDDEN TRUTH (never reveal directly): ${patron.hiddenTruth}
BACKSTORY (know but never reveal): ${patron.backstory}
TRIGGER POINTS: ${patron.triggerPoints}
HAS ID: ${hasIDText}

PROFILE: Sobriety ${patron.sobriety}/100 (${patron.sobrietyLabel}). Traits: ${patron.traits.join(', ')}. Dark triad: ${patron.darkTriad}. Defenses: ${patron.defenses}. Attachment: ${patron.attachment}. Manipulation: ${patron.manipulation}.

TELLS (let these slip naturally under pressure — never announce them): ${patron.tells.join('; ')}

${brideText}

VOICE CHARACTER: ${patron.voiceDesc}
BOUNCER PERSONALITY READING: The bouncer comes across as ${bouncerPersonality}. Adapt accordingly — a Tough bouncer makes nervous patrons crumble faster, an Empathetic bouncer can be manipulated more easily, a Sarcastic bouncer puts patrons on defense, a By-the-Book bouncer is hard to charm but misses emotional nuance.

RULES: Stay completely in character. Never acknowledge being an AI. Sobriety level must be evident in speech — low sobriety means slurring, losing train of thought, emotional volatility, repeating yourself. Use your manipulation tactics naturally and adapt if they fail. React authentically to your trigger points. Fill silences in a way that reveals your character. Every opening line must be unique and reflect your psychological state — never start with a generic greeting. Your opening line must be 1-2 sentences maximum — often just a greeting and handing over ID is most realistic. Keep all responses 2-3 sentences unless emotionally escalated. Never break character under any circumstances.`;
}

function toApiMessages(messages: ConversationMessage[]): ApiMessage[] {
  return messages
    .filter(m => m.text.trim() !== '')
    .map(m => ({
      role: m.role === 'bouncer' ? 'user' : 'assistant',
      content: m.text,
    }));
}

export async function getPatronResponse(
  patron: AIPatron,
  history: ConversationMessage[],
  bouncerMessage: string | null,
  bouncerPersonality: BouncerPersonality,
): Promise<string> {
  const systemPrompt = buildRoleplaySystemPrompt(patron, bouncerPersonality);

  const messages: ApiMessage[] = toApiMessages(history);

  if (bouncerMessage) {
    messages.push({ role: 'user', content: bouncerMessage });
  } else {
    // Opening line — prime the patron with a scene-setter
    messages.push({
      role: 'user',
      content: `[The bouncer is looking at you, waiting. You approach. What's your opening line? Remember your psychological state, sobriety (${patron.sobriety}/100), and hidden agenda.]`,
    });
  }

  return callAnthropic(messages, systemPrompt, 1000);
}

export async function getPatronSilenceResponse(
  patron: AIPatron,
  history: ConversationMessage[],
  bouncerPersonality: BouncerPersonality,
): Promise<string> {
  const systemPrompt = buildRoleplaySystemPrompt(patron, bouncerPersonality);
  const messages: ApiMessage[] = [
    ...toApiMessages(history),
    {
      role: 'user',
      content: `[The bouncer hasn't responded. Several awkward seconds pass. What do you do — do you fill the silence? Your response must reveal your character through the discomfort.]`,
    },
  ];
  return callAnthropic(messages, systemPrompt, 1000);
}
