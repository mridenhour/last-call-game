import { Patron, PatronType, FakeIDType, EmotionalType, StateInfo, BarLocation } from './types';

// ─── State Data ───────────────────────────────────────────────────────────────

const STATES: StateInfo[] = [
  { name: 'California', abbreviation: 'CA', capital: 'Sacramento' },
  { name: 'Texas', abbreviation: 'TX', capital: 'Austin' },
  { name: 'Florida', abbreviation: 'FL', capital: 'Tallahassee' },
  { name: 'New York', abbreviation: 'NY', capital: 'Albany' },
  { name: 'Illinois', abbreviation: 'IL', capital: 'Springfield' },
  { name: 'Ohio', abbreviation: 'OH', capital: 'Columbus' },
  { name: 'Georgia', abbreviation: 'GA', capital: 'Atlanta' },
  { name: 'Michigan', abbreviation: 'MI', capital: 'Lansing' },
  { name: 'Arizona', abbreviation: 'AZ', capital: 'Phoenix' },
  { name: 'Colorado', abbreviation: 'CO', capital: 'Denver' },
  { name: 'Washington', abbreviation: 'WA', capital: 'Olympia' },
  { name: 'Nevada', abbreviation: 'NV', capital: 'Carson City' },
  { name: 'Oregon', abbreviation: 'OR', capital: 'Salem' },
  { name: 'Tennessee', abbreviation: 'TN', capital: 'Nashville' },
  { name: 'Massachusetts', abbreviation: 'MA', capital: 'Boston' },
];

// Wrong capitals (used for fake IDs)
const WRONG_CAPITALS: Record<string, string> = {
  CA: 'Los Angeles',
  TX: 'Houston',
  FL: 'Miami',
  NY: 'New York City',
  IL: 'Chicago',
  OH: 'Cleveland',
  GA: 'Savannah',
  MI: 'Detroit',
  AZ: 'Tucson',
  CO: 'Colorado Springs',
  WA: 'Seattle',
  NV: 'Las Vegas',
  OR: 'Portland',
  TN: 'Memphis',
  MA: 'Cambridge',
};

// ─── Name Pools ───────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Tyler', 'Morgan', 'Casey', 'Taylor', 'Riley', 'Avery',
  'Logan', 'Peyton', 'Quinn', 'Blake', 'Dakota', 'Skyler', 'Reese',
  'Hunter', 'Jesse', 'Drew', 'Jamie', 'Cameron', 'Madison', 'Brittany',
  'Kyle', 'Chad', 'Brody', 'Tiffany', 'Amber', 'Cody', 'Derek', 'Kayla',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
  'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
];

// ─── Patron Templates ─────────────────────────────────────────────────────────

interface PatronTemplate {
  type: PatronType;
  portrait: string;
  spendRange: [number, number];
  ageRange: [number, number];         // actual age range
  fakeIDChance: number;               // 0–1
  troubleChance: number;
  fightLevel: number;
  emotionalChance: number;
  description: string;
}

const PATRON_TEMPLATES: Record<string, PatronTemplate> = {
  college_kid: {
    type: 'college_kid',
    portrait: '🎒',
    spendRange: [5, 20],
    ageRange: [18, 22],
    fakeIDChance: 0.55,
    troubleChance: 0.2,
    fightLevel: 1,
    emotionalChance: 0.2,
    description: 'Backpack, hoodie. Clearly nervous.',
  },
  party_regular: {
    type: 'party_regular',
    portrait: '💃',
    spendRange: [25, 60],
    ageRange: [21, 30],
    fakeIDChance: 0.1,
    troubleChance: 0.15,
    fightLevel: 1,
    emotionalChance: 0.3,
    description: 'Done-up hair, high heels. Ready to party.',
  },
  professional: {
    type: 'professional',
    portrait: '🧑‍💼',
    spendRange: [60, 120],
    ageRange: [28, 45],
    fakeIDChance: 0.02,
    troubleChance: 0.05,
    fightLevel: 0,
    emotionalChance: 0.05,
    description: 'Business casual. Loosened tie.',
  },
  grungy: {
    type: 'grungy',
    portrait: '🧔',
    spendRange: [0, 5],
    ageRange: [22, 40],
    fakeIDChance: 0.15,
    troubleChance: 0.4,
    fightLevel: 2,
    emotionalChance: 0.1,
    description: 'Ripped jeans, smells like cigarettes.',
  },
  flirt: {
    type: 'flirt',
    portrait: '😏',
    spendRange: [15, 40],
    ageRange: [19, 26],
    fakeIDChance: 0.4,
    troubleChance: 0.1,
    fightLevel: 0,
    emotionalChance: 1.0,
    description: 'Batting eyelashes. Suspiciously charming.',
  },
  sob_story: {
    type: 'sob_story',
    portrait: '😢',
    spendRange: [5, 15],
    ageRange: [18, 23],
    fakeIDChance: 0.5,
    troubleChance: 0.05,
    fightLevel: 0,
    emotionalChance: 1.0,
    description: 'Looks upset. Mascara running.',
  },
  vip: {
    type: 'vip',
    portrait: '🎩',
    spendRange: [150, 300],
    ageRange: [30, 50],
    fakeIDChance: 0,
    troubleChance: 0.02,
    fightLevel: 0,
    emotionalChance: 0.1,
    description: 'Designer clothes. Clearly wealthy.',
  },
  already_drunk: {
    type: 'already_drunk',
    portrait: '🥴',
    spendRange: [-20, 10],
    ageRange: [21, 35],
    fakeIDChance: 0.05,
    troubleChance: 0.6,
    fightLevel: 2,
    emotionalChance: 0.2,
    description: 'Stumbling. Slurring. Red face.',
  },
  troublemaker: {
    type: 'troublemaker',
    portrait: '😤',
    spendRange: [10, 30],
    ageRange: [21, 32],
    fakeIDChance: 0.2,
    troubleChance: 0.9,
    fightLevel: 3,
    emotionalChance: 0.1,
    description: 'Looking for an argument.',
  },
  undercover_cop: {
    type: 'undercover_cop',
    portrait: '🕵️',
    spendRange: [0, 0],
    ageRange: [28, 45],
    fakeIDChance: 0,
    troubleChance: 0,
    fightLevel: 0,
    emotionalChance: 0,
    description: 'Something seems... off about this one.',
  },
};

// ─── Emotional Lines ──────────────────────────────────────────────────────────

const FLIRT_LINES = [
  "Come on, I left my ID at home. You're not seriously gonna keep me out?",
  "I'll make it worth your while if you let me through... 😉",
  "My friends are already inside. I just need five minutes, please?",
  "You're cute. Don't be the reason my night gets ruined.",
];

const GUILT_LINES = [
  "Seriously? My friend just broke up with her boyfriend. We need this.",
  "I drove 45 minutes to get here. Please, man.",
  "I'm a regular here! You've let me in like ten times.",
  "It's my birthday. Please. Just this once.",
];

const SOB_LINES = [
  "I... I just need to find my friend. She's not answering her phone.",
  "Please. I won't even drink. I just can't be alone right now.",
  "Today was the worst day of my life and I just need to be around people.",
];

const BRIBE_ATTEMPT_LINES = [
  "How about I slip you a $20 and we both forget about the ID thing?",
  "Look, there's an extra fifty in it if you just wave me through.",
  "Keep the change. We cool?",
];

// ─── Generator ────────────────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const CURRENT_YEAR = 2026;

export function generatePatron(location: BarLocation): Patron {
  // Weight patron types based on location
  const typeWeights: Record<BarLocation, PatronType[]> = {
    dive: [
      'grungy', 'grungy', 'college_kid', 'college_kid', 'already_drunk',
      'already_drunk', 'troublemaker', 'party_regular', 'sob_story',
    ],
    college: [
      'college_kid', 'college_kid', 'college_kid', 'party_regular',
      'party_regular', 'flirt', 'flirt', 'already_drunk', 'sob_story', 'grungy',
    ],
    rooftop: [
      'party_regular', 'party_regular', 'professional', 'professional',
      'vip', 'flirt', 'college_kid', 'troublemaker', 'undercover_cop',
    ],
    nightclub: [
      'party_regular', 'professional', 'vip', 'vip', 'flirt',
      'troublemaker', 'troublemaker', 'already_drunk', 'undercover_cop',
      'college_kid', 'college_kid',
    ],
  };

  const type = rand(typeWeights[location]);
  const template = PATRON_TEMPLATES[type];
  const firstName = rand(FIRST_NAMES);
  const lastName = rand(LAST_NAMES);
  const name = `${firstName} ${lastName}`;

  const actualAge = randInt(template.ageRange[0], template.ageRange[1]);
  const actualBirthYear = CURRENT_YEAR - actualAge;
  const idState = rand(STATES);

  // Determine fake ID situation
  const isFake = Math.random() < template.fakeIDChance;
  let fakeType: FakeIDType = 'none';
  let idBirthYear = actualBirthYear;
  let idCapitalIsCorrect = true;
  let idExpiry = `${randInt(1, 12).toString().padStart(2, '0')}/${CURRENT_YEAR + randInt(1, 5)}`;

  if (isFake) {
    const fakeOptions: FakeIDType[] = actualAge < 21
      ? ['wrong_birth_year', 'wrong_birth_year', 'wrong_state_capital', 'expired']
      : ['wrong_state_capital', 'expired', 'name_mismatch'];

    fakeType = rand(fakeOptions);

    switch (fakeType) {
      case 'wrong_birth_year':
        // Make them appear 21+ on fake ID
        idBirthYear = CURRENT_YEAR - randInt(21, 25);
        break;
      case 'wrong_state_capital':
        idCapitalIsCorrect = false;
        break;
      case 'expired':
        const expiredYear = CURRENT_YEAR - randInt(1, 3);
        idExpiry = `${randInt(1, 12).toString().padStart(2, '0')}/${expiredYear}`;
        break;
      case 'name_mismatch':
        // Name mismatch is handled by noting the description
        break;
    }
  }

  // Emotional type
  let emotionalType: EmotionalType = 'none';
  let emotionalLine = '';
  if (Math.random() < template.emotionalChance) {
    const emoOptions: EmotionalType[] = ['flirt', 'guilt', 'sob_story', 'bribe_attempt'];
    emotionalType = rand(emoOptions);
    switch (emotionalType) {
      case 'flirt': emotionalLine = rand(FLIRT_LINES); break;
      case 'guilt': emotionalLine = rand(GUILT_LINES); break;
      case 'sob_story': emotionalLine = rand(SOB_LINES); break;
      case 'bribe_attempt': emotionalLine = rand(BRIBE_ATTEMPT_LINES); break;
    }
  }

  const spendValue = randInt(template.spendRange[0], template.spendRange[1]);
  const willCauseTrouble = Math.random() < template.troubleChance;

  const idIsValid = fakeType === 'none' && actualAge >= 21;

  return {
    id: `patron_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    type,
    actualAge,
    idBirthYear,
    idState,
    idCapitalIsCorrect,
    idExpiry,
    idIsValid,
    fakeType,
    emotionalType,
    emotionalLine,
    spendValue,
    willCauseTrouble,
    fightLevel: template.fightLevel,
    portrait: template.portrait,
    description: template.description,
  };
}

export function generatePatronQueue(location: BarLocation, count: number): Patron[] {
  const queue: Patron[] = [];
  for (let i = 0; i < count; i++) {
    queue.push(generatePatron(location));
  }
  return queue;
}

export function getIdAgeDisplay(patron: Patron): number {
  return CURRENT_YEAR - patron.idBirthYear;
}

export function isExpiredId(patron: Patron): boolean {
  const [month, year] = patron.idExpiry.split('/').map(Number);
  return year < CURRENT_YEAR || (year === CURRENT_YEAR && month < new Date().getMonth() + 1);
}
