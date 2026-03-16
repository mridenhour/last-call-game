import { FightMove, FightRound } from './types';

export const PLAYER_MAX_HP = 100;
export const BASE_ENEMY_MAX_HP = 60;

export function getEnemyMaxHP(fightLevel: number): number {
  return BASE_ENEMY_MAX_HP + fightLevel * 25;
}

// Counter system: block > strike, dodge > block, strike > dodge
const COUNTER_TABLE: Record<FightMove, FightMove> = {
  block: 'strike',    // strike beats block? No: block wins vs strike
  dodge: 'block',     // dodge wins vs block
  strike: 'dodge',    // strike wins vs dodge
};

// Which move beats which
// strike beats block (power through)
// block beats dodge (corners them)
// dodge beats strike (sidestep)
const BEATS: Record<FightMove, FightMove> = {
  strike: 'block',  // strike beats block
  block: 'dodge',   // block beats dodge
  dodge: 'strike',  // dodge beats strike
};

export function fightRound(
  playerMove: FightMove,
  fightLevel: number
): FightRound {
  // Enemy AI: weighted random based on fight level
  const moves: FightMove[] = ['block', 'dodge', 'strike'];
  let enemyMove: FightMove;

  if (fightLevel === 0) {
    // Random
    enemyMove = moves[Math.floor(Math.random() * 3)];
  } else if (fightLevel === 1) {
    // Slight lean toward strike
    const weights = [0.25, 0.25, 0.5];
    enemyMove = weightedRand(moves, weights);
  } else if (fightLevel === 2) {
    // Tries to counter player (reads player occasionally)
    const shouldCounter = Math.random() < 0.4;
    if (shouldCounter) {
      // Counter: pick what beats player's move
      enemyMove = Object.entries(BEATS).find(([_, v]) => v === playerMove)?.[0] as FightMove ?? moves[1];
    } else {
      enemyMove = moves[Math.floor(Math.random() * 3)];
    }
  } else {
    // Level 3: frequently counters
    const shouldCounter = Math.random() < 0.6;
    if (shouldCounter) {
      enemyMove = Object.entries(BEATS).find(([_, v]) => v === playerMove)?.[0] as FightMove ?? moves[2];
    } else {
      enemyMove = moves[Math.floor(Math.random() * 3)];
    }
  }

  // Determine outcome
  const playerBeatsEnemy = BEATS[playerMove] === enemyMove;
  const enemyBeatsPlayer = BEATS[enemyMove] === playerMove;
  const tie = playerMove === enemyMove;

  let playerDamage = 0;
  let enemyDamage = 0;
  let result: FightRound['result'] = 'miss';
  let message = '';

  const BASE_DAMAGE = 15 + fightLevel * 8;

  if (tie) {
    playerDamage = Math.round(BASE_DAMAGE * 0.3);
    enemyDamage = Math.round(BASE_DAMAGE * 0.3);
    result = 'blocked';
    message = tieMessages[playerMove];
  } else if (playerBeatsEnemy) {
    enemyDamage = BASE_DAMAGE + Math.floor(Math.random() * 10);
    playerDamage = Math.floor(Math.random() * 5);
    result = 'hit';
    message = playerWinMessages[playerMove];
  } else {
    // enemy beats player
    playerDamage = BASE_DAMAGE + Math.floor(Math.random() * 8);
    enemyDamage = Math.floor(Math.random() * 5);
    result = 'miss';
    message = enemyWinMessages[enemyMove];
  }

  return {
    playerMove,
    enemyMove,
    playerDamage,
    enemyDamage,
    result,
    message,
  };
}

function weightedRand<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < items.length; i++) {
    cum += weights[i];
    if (r < cum) return items[i];
  }
  return items[items.length - 1];
}

const tieMessages: Record<FightMove, string> = {
  block: 'You both brace — a stalemate.',
  dodge: 'You both dance around each other.',
  strike: 'Fists collide — both take a hit.',
};

const playerWinMessages: Record<FightMove, string> = {
  strike: 'You land a clean hit to the jaw! 💥',
  block: 'You absorb their rush and shove them back.',
  dodge: 'You sidestep perfectly — they stumble.',
};

const enemyWinMessages: Record<FightMove, string> = {
  strike: 'They catch you off guard — brutal shot. 😵',
  block: 'They turtle up and you exhaust yourself.',
  dodge: 'They slip past your attack and counter!',
};

export function getMoveEmoji(move: FightMove): string {
  return { block: '🛡️', dodge: '💨', strike: '👊' }[move];
}

export function getMoveLabel(move: FightMove): string {
  return { block: 'BLOCK', dodge: 'DODGE', strike: 'STRIKE' }[move];
}
