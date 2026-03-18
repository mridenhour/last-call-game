import { AIPatron } from './aiTypes';

export interface IDData {
  name: string;
  dob: string;          // MM/DD/YYYY
  dobRaw: Date;
  address: string;
  idNumber: string;
  expiry: string;       // MM/YYYY
  state: string;
  isFake: boolean;
  errors: IDError[];    // subtle discrepancies on fake IDs
}

export interface IDError {
  field: 'dob' | 'name' | 'address' | 'idNumber' | 'expiry' | 'photo';
  description: string;  // Shown in dossier reveal, NOT pre-reveal
}

const STATES = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'OH', 'PA', 'AZ', 'GA'];
const STREETS = ['Oak St', 'Maple Ave', 'Pine Rd', 'Cedar Blvd', 'Elm St', 'Birch Ln', 'River Rd', 'Park Ave'];
const CITIES: Record<string, string> = {
  CA: 'Los Angeles', NY: 'Brooklyn', TX: 'Austin', FL: 'Tampa',
  IL: 'Chicago', WA: 'Seattle', OH: 'Columbus', PA: 'Philadelphia',
  AZ: 'Phoenix', GA: 'Atlanta',
};

// Simple seeded pseudo-random from a string
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return Math.abs(h);
}

function seededRand(seed: number, max: number): number {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) % max;
}

export function generateIDData(patron: AIPatron): IDData {
  const h = hash(patron.name);
  const isFake = patron.correctDecision === 'reject' && patron.hasID;

  // State
  const state = STATES[h % STATES.length];

  // Real age: a legitimate adult is 21-38 for most patrons
  // For underage patrons the fake ID bumps the year to look 21+
  const baseAge = 21 + seededRand(h, 17);  // 21–37
  const realBirthYear = new Date().getFullYear() - baseAge;
  const birthMonth = 1 + seededRand(h >> 4, 12);
  const birthDay = 1 + seededRand(h >> 8, 28);

  const realDOB = new Date(realBirthYear, birthMonth - 1, birthDay);

  // Expiry: 4-8 years from now
  const expiryYear = new Date().getFullYear() + 4 + seededRand(h >> 12, 4);
  const expiryMonth = 1 + seededRand(h >> 16, 12);

  // Address
  const streetNum = 100 + seededRand(h >> 2, 9900);
  const street = STREETS[seededRand(h >> 6, STREETS.length)];
  const zip = 10000 + seededRand(h >> 10, 89999);
  const city = CITIES[state];

  // ID number: state abbreviation + 8 digits
  const idNum = `${state}${String(seededRand(h >> 14, 99999999)).padStart(8, '0')}`;

  const errors: IDError[] = [];
  let finalName = patron.name;
  let finalDOB = realDOB;
  let finalAddress = `${streetNum} ${street}, ${city}, ${state} ${zip}`;

  if (isFake) {
    // Pick 1-2 subtle errors based on hash
    const errorType = h % 4;

    if (errorType === 0 || errorType === 2) {
      // DOB year is 1 year off (still looks adult but wrong)
      const yearOff = (h % 2 === 0) ? 1 : -1;
      finalDOB = new Date(realBirthYear + yearOff, birthMonth - 1, birthDay);
      errors.push({
        field: 'dob',
        description: `Birth year is ${realBirthYear + yearOff}, but patron was born ${realBirthYear}. Off by 1 year.`,
      });
    }

    if (errorType === 1 || errorType === 2) {
      // Name has a transposed letter or missing middle initial
      const parts = patron.name.split(' ');
      if (parts.length >= 2) {
        const lastName = parts[parts.length - 1];
        // Swap two adjacent chars in last name
        if (lastName.length >= 3) {
          const idx = 1 + seededRand(h, lastName.length - 2);
          const swapped = lastName.split('');
          [swapped[idx], swapped[idx + 1]] = [swapped[idx + 1], swapped[idx]];
          parts[parts.length - 1] = swapped.join('');
          finalName = parts.join(' ');
          errors.push({
            field: 'name',
            description: `Last name on ID is "${parts[parts.length - 1]}" — letters transposed from "${lastName}".`,
          });
        }
      }
    }

    if (errorType === 3) {
      // Address zip code is wrong (mismatched state)
      const wrongZip = 10000 + seededRand(h >> 18, 89999);
      finalAddress = `${streetNum} ${street}, ${city}, ${state} ${wrongZip}`;
      errors.push({
        field: 'address',
        description: `ZIP code ${wrongZip} does not exist in ${state}.`,
      });
    }

    if (errors.length === 0) {
      // Fallback: photo doesn't quite match description
      errors.push({
        field: 'photo',
        description: 'Photo on ID appears to be a different person — hair color and build don\'t match.',
      });
    }
  }

  const padded = (n: number, len = 2) => String(n).padStart(len, '0');

  return {
    name: finalName,
    dob: `${padded(finalDOB.getMonth() + 1)}/${padded(finalDOB.getDate())}/${finalDOB.getFullYear()}`,
    dobRaw: finalDOB,
    address: finalAddress,
    idNumber: idNum,
    expiry: `${padded(expiryMonth)}/${expiryYear}`,
    state,
    isFake,
    errors,
  };
}
