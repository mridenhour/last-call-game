// ─── AI-Generated Patron ─────────────────────────────────────────────────────

export interface AIPatron {
  name: string;
  emoji: string;
  gender: 'male' | 'female';
  visibleInfo: string;
  hiddenTruth: string;
  correctDecision: 'letIn' | 'reject';
  scoringCorrect: number;
  scoringWrong: number;
  sobriety: number;           // 0–100
  sobrietyLabel: string;
  deceptionType: string;
  hasID: boolean;
  traits: string[];
  darkTriad: string;
  defenses: string;
  attachment: string;
  manipulation: string;
  tells: string[];            // 5 behavioral tells
  voicePitch: number;         // expo-speech pitch (0.5–2.0)
  voiceRate: number;          // expo-speech rate (0.5–2.0)
  voiceDesc: string;
  backstory: string;
  triggerPoints: string;
  fightStyle: string;
  bribeAmount: number;        // 0 = no bribe, >0 = possible bribe
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface ConversationMessage {
  id: string;
  role: 'bouncer' | 'patron';
  text: string;
  timestamp: number;
  isBribe?: boolean;
  brideDetectedAmount?: number;
}

// ─── Bribe ───────────────────────────────────────────────────────────────────

export interface BribeOffer {
  amount: number;
  messageId: string;
  patronText: string;
}

// ─── Bouncer Personality ─────────────────────────────────────────────────────

export type BouncerPersonality = 'Tough' | 'Sarcastic' | 'By-the-Book' | 'Empathetic';

export const PERSONALITY_COLORS: Record<BouncerPersonality, string> = {
  Tough:        '#FF2D55',
  Sarcastic:    '#BF5FFF',
  'By-the-Book':'#00B4FF',
  Empathetic:   '#00FFB2',
};

export const PERSONALITY_EMOJIS: Record<BouncerPersonality, string> = {
  Tough:        '🤜',
  Sarcastic:    '😏',
  'By-the-Book':'📋',
  Empathetic:   '🤝',
};

// ─── Fight System ─────────────────────────────────────────────────────────────

export type FightPhase = 'standoff' | 'exchange' | 'breaking_point' | 'result';
export type FightMoveChoice = 'dodge' | 'block' | 'strike';

export interface Phase1Tell {
  description: string;      // What the bouncer observes
  correctMove: FightMoveChoice;
  advantage: string;        // What happens if you read it correctly
}

export interface Phase3Option {
  text: string;             // What the bouncer says/does
  label: string;            // Short label (De-escalate / Confront / Insight)
  isCorrect: boolean;
  explanation: string;      // Shown on reveal
}

export interface FightState {
  phase: FightPhase;
  playerHP: number;
  enemyHP: number;
  playerMaxHP: number;
  enemyMaxHP: number;
  speedMultiplier: number;
  phase1Tell: Phase1Tell | null;
  phase1Result: 'advantage' | 'disadvantage' | null;
  phase3Options: Phase3Option[];
  phase3Line: string;       // What the opponent says at breaking point
  winner: 'player' | 'enemy' | null;
  log: string[];
}

// ─── Generation Status ────────────────────────────────────────────────────────

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  logs: string[];
  error: string | null;
}

// ─── AI Game Phase ────────────────────────────────────────────────────────────

export type AiGamePhase =
  | 'menu'
  | 'generating'
  | 'patron_intro'
  | 'conversation'
  | 'dossier'
  | 'fight'
  | 'night_end'
  | 'game_over';

// ─── Full AI Game State ───────────────────────────────────────────────────────

export interface AiGameState {
  phase: AiGamePhase;
  patron: AIPatron | null;
  conversation: ConversationMessage[];
  bouncerPersonality: BouncerPersonality;
  playerDecision: 'letIn' | 'reject' | null;
  pendingBribe: BribeOffer | null;
  generation: GenerationState;
  fight: FightState | null;
  balance: number;
  score: number;
  patronsProcessed: number;
  policeMeter: number;
  night: number;
  isMuted: boolean;
  gameOverReason: string;
  isPatronTyping: boolean;
}
