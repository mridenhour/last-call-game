import { AIPatron, Phase1Tell, Phase3Option, FightMoveChoice, BouncerPersonality } from './aiTypes';

// ─── Phase 1 ──────────────────────────────────────────────────────────────────

const TELL_TEMPLATES = [
  {
    description: 'They shift their weight repeatedly to their left foot — an unconscious preparation to lunge.',
    correctMove: 'dodge' as FightMoveChoice,
    advantage: 'You sidestep the lunge before it starts — they\'re off-balance.',
  },
  {
    description: 'Their jaw clenches tight and their hands ball into fists at their sides.',
    correctMove: 'block' as FightMoveChoice,
    advantage: 'You brace perfectly — the haymaker hits your guard, not your jaw.',
  },
  {
    description: 'They take a half-step back and lower their center of gravity — classic charging stance.',
    correctMove: 'strike' as FightMoveChoice,
    advantage: 'You hit first while they\'re loading up, stealing the initiative.',
  },
  {
    description: 'Their eyes dart to your midsection rather than your face — telegraphing a body shot.',
    correctMove: 'dodge' as FightMoveChoice,
    advantage: 'You pivot clear — they swing at air and stumble past you.',
  },
  {
    description: 'They raise their chin and puff their chest — posturing, covering their own nerves.',
    correctMove: 'strike' as FightMoveChoice,
    advantage: 'You read the bluster for what it is and land the first clean shot.',
  },
  {
    description: 'Their hands come up near their face too early, before a fight is confirmed.',
    correctMove: 'block' as FightMoveChoice,
    advantage: 'Your guard meets their guard — you absorb nothing and they burn energy.',
  },
  {
    description: 'A slight tremor in their right hand — either adrenaline or withdrawal.',
    correctMove: 'strike' as FightMoveChoice,
    advantage: 'You exploit the hesitation and land a clean strike before they commit.',
  },
  {
    description: 'They keep glancing behind them, planning an escape route while posturing.',
    correctMove: 'dodge' as FightMoveChoice,
    advantage: 'You step wide; they\'re already half-retreating when you counter.',
  },
];

export function generatePhase1Tell(patron: AIPatron): Phase1Tell {
  // Use patron's first tell as flavor, but map to a randomized correct response
  const template = TELL_TEMPLATES[Math.floor(Math.random() * TELL_TEMPLATES.length)];

  // Optionally flavor the description with the patron's tells
  const patronTell = patron.tells[0] ?? '';
  const description = patronTell
    ? `${template.description} ${patronTell.endsWith('.') ? patronTell : patronTell + '.'}`
    : template.description;

  return {
    description,
    correctMove: template.correctMove,
    advantage: template.advantage,
  };
}

// ─── Phase 3 ──────────────────────────────────────────────────────────────────

export function generatePhase3Options(
  patron: AIPatron,
  personality: BouncerPersonality,
): { line: string; options: Phase3Option[] } {
  const dark = patron.darkTriad.toLowerCase();
  const defenses = patron.defenses.toLowerCase();
  const drunk = patron.sobriety < 45;

  // Determine the correct move based on patron psychology
  let correctIndex: number;
  if (drunk) {
    correctIndex = 0; // De-escalation beats drunk patrons
  } else if (dark.includes('narciss') || dark.includes('psychopath')) {
    correctIndex = 1; // Confrontation breaks narcissists/psychopaths
  } else {
    correctIndex = 2; // Specific psychological insight works on everyone else
  }

  // Generate patron's breaking-point line from fightStyle
  const lines = [
    `"You don't know who I am. You're going to regret this."`,
    `"I'll sue this place into the ground. Get your manager."`,
    `"Please... please just stop. I don't want to do this."`,
    `"You think you're tough? I've been in worse than this."`,
    patron.fightStyle.length > 10
      ? `"${patron.fightStyle.split('.')[0]}!"`
      : `"This isn't over."`,
  ];
  const line = lines[Math.floor(Math.random() * lines.length)];

  const options: Phase3Option[] = [
    {
      label: 'De-escalate',
      text: drunk
        ? `"Hey. Easy. You need water and a cab — not this."`
        : `"I'm not your enemy here. Walk away clean."`,
      isCorrect: correctIndex === 0,
      explanation: correctIndex === 0
        ? 'Correct — their sobriety is too low for confrontation. Calm authority broke through.'
        : 'Wrong read — they needed firmness, not empathy.',
    },
    {
      label: 'Confront',
      text: dark.includes('narciss')
        ? `"I see exactly what you are. And so does everyone watching."`
        : `"You're done here. Make one more move and the cops hear about all of it."`,
      isCorrect: correctIndex === 1,
      explanation: correctIndex === 1
        ? 'Correct — direct exposure cracked their facade. Dark triad personalities fold when seen through.'
        : 'Wrong read — confrontation escalated rather than resolved.',
    },
    {
      label: 'Psychological Insight',
      text: patron.triggerPoints.length > 10
        ? `"${patron.triggerPoints.split('.')[0]}. I see it. So does everyone."`
        : `"This isn't really about the bar, is it? Something else is going on with you tonight."`,
      isCorrect: correctIndex === 2,
      explanation: correctIndex === 2
        ? 'Correct — you named exactly what they were hiding. The mask slipped and they backed down.'
        : 'Wrong read — the psychological play missed.',
    },
  ];

  return { line, options };
}

// ─── Fight HP ─────────────────────────────────────────────────────────────────

export const PLAYER_FIGHT_HP = 100;

export function getEnemyFightHP(patron: AIPatron): number {
  // Scale with sobriety (less drunk = harder fight) and aggression implied by fightStyle
  const base = 60;
  const sobrietyBonus = Math.round((patron.sobriety / 100) * 30); // max +30
  const aggression = patron.fightStyle.toLowerCase().includes('fast') ||
                     patron.fightStyle.toLowerCase().includes('relentless') ? 20 : 0;
  return base + sobrietyBonus + aggression;
}

// ─── Phase 2 Damage ───────────────────────────────────────────────────────────

export function getHitDamage(patron: AIPatron, speedMultiplier: number): number {
  const base = 15;
  const sobrietyMod = patron.sobriety > 70 ? 1.3 : patron.sobriety < 40 ? 0.7 : 1.0;
  return Math.round(base * sobrietyMod * speedMultiplier);
}

export function getMissPenalty(): number {
  return 8;
}
