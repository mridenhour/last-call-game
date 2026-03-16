// ─── Location / Bar ───────────────────────────────────────────────────────────

export type BarLocation = 'dive' | 'college' | 'rooftop' | 'nightclub';

export interface BarConfig {
  id: BarLocation;
  name: string;
  subtitle: string;
  patronsPerNight: number;
  policeAggression: number;   // 0–1, how fast police meter fills
  bribeCost: number;           // $ to bribe cops
  minBalance: number;          // balance needed to unlock (0 for dive)
  entryFee: number;            // base revenue per approved patron
  description: string;
}

// ─── ID / Trivia ──────────────────────────────────────────────────────────────

export interface StateInfo {
  name: string;
  abbreviation: string;
  capital: string;
}

export type FakeIDType =
  | 'none'
  | 'wrong_birth_year'   // birth year makes them underage
  | 'wrong_state_capital'// wrong capital listed on ID
  | 'wrong_state'        // state doesn't match region (e.g., Alaska ID in Florida bar)
  | 'expired'            // ID expiry date is past
  | 'name_mismatch';     // name on card doesn't match how they introduced themselves

// ─── Patron ──────────────────────────────────────────────────────────────────

export type PatronType =
  | 'college_kid'
  | 'party_regular'
  | 'professional'
  | 'grungy'
  | 'flirt'
  | 'sob_story'
  | 'vip'
  | 'already_drunk'
  | 'troublemaker'
  | 'undercover_cop';

export type EmotionalType = 'none' | 'flirt' | 'guilt' | 'sob_story' | 'bribe_attempt';

export interface Patron {
  id: string;
  name: string;
  type: PatronType;
  actualAge: number;           // real age
  idBirthYear: number;         // year on the ID (may be faked)
  idState: StateInfo;
  idCapitalIsCorrect: boolean; // is the capital on ID actually correct?
  idExpiry: string;            // "MM/YYYY" — may be expired
  idIsValid: boolean;          // overall: is this a valid, real, legal ID?
  fakeType: FakeIDType;
  emotionalType: EmotionalType;
  emotionalLine: string;       // what they say when trying to talk their way in
  spendValue: number;          // revenue earned if let in (can be 0 or negative)
  willCauseTrouble: boolean;   // will create a disturbance later
  fightLevel: number;          // 0–3, difficulty if they want to fight
  portrait: string;            // emoji stand-in for portrait
  description: string;         // appearance description
}

// ─── Disturbance ─────────────────────────────────────────────────────────────

export type DisturbanceType = 'fight_inside' | 'drugs' | 'harassment' | 'vomiting' | 'property_damage';

export interface Disturbance {
  patronId: string;
  patronName: string;
  type: DisturbanceType;
  description: string;
  fightLevel: number;
  policeThreat: number; // how much this raises police meter if ignored
}

// ─── Police ──────────────────────────────────────────────────────────────────

export interface PoliceEvent {
  message: string;
  meterIncrease: number;
}

// ─── Fight ───────────────────────────────────────────────────────────────────

export type FightMove = 'block' | 'dodge' | 'strike';

export interface FightRound {
  playerMove: FightMove;
  enemyMove: FightMove;
  playerDamage: number;
  enemyDamage: number;
  result: 'hit' | 'miss' | 'blocked';
  message: string;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase =
  | 'main_menu'
  | 'night_intro'
  | 'waiting'            // between patrons
  | 'patron_approach'    // patron walks up
  | 'id_check'           // viewing ID
  | 'trivia_check'       // geographic trivia overlay
  | 'emotional'          // patron trying to talk way in
  | 'decision_pending'   // brief moment before consequence
  | 'disturbance'        // alert: trouble inside
  | 'fight'              // fight minigame
  | 'police_warning'     // police alert popup
  | 'bribe'              // bribe modal
  | 'night_end'          // end of night summary
  | 'game_over'          // game over screen
  | 'high_scores';       // high scores screen

export interface GameState {
  phase: GamePhase;
  location: BarLocation;
  locationConfig: BarConfig;
  night: number;
  balance: number;
  score: number;
  patronsProcessed: number;
  patronQueue: Patron[];
  currentPatron: Patron | null;
  pendingDisturbances: Disturbance[];
  policeMeter: number;          // 0–100
  policeWarningShown: boolean;
  lastDecisionCorrect: boolean | null;
  lastMoneyChange: number;
  fightHP: [number, number];    // [player, enemy]
  fightRounds: FightRound[];
  fightPatron: Patron | null;
  gameOverReason: string;
  showApproveFlash: boolean;
  showRejectFlash: boolean;
  patronsLetIn: number;
  underage_let_in: number;
}

// ─── High Score ───────────────────────────────────────────────────────────────

export interface HighScore {
  score: number;
  balance: number;
  location: BarLocation;
  night: number;
  date: string;
}
