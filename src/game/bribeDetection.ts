export interface BribeDetectionResult {
  isBribe: boolean;
  amount: number;
  confidence: 'high' | 'medium' | 'low';
}

const DIRECT_PATTERNS = [
  /\$\s*(\d+)/,
  /(\d+)\s*bucks?/i,
  /(\d+)\s*dollars?/i,
  /slip\s+you/i,
  /take\s+this/i,
  /here['']?s\s+(\d+)/i,
  /(\d+)\s+for\s+you/i,
  /pay\s+you/i,
  /keep\s+the\s+change/i,
];

const SOFT_PATTERNS = [
  /make\s+it\s+worth/i,
  /something\s+for\s+you/i,
  /little\s+extra/i,
  /hook\s+you\s+up/i,
  /grateful/i,
  /compensate/i,
  /going\s+rate/i,
  /work\s+something\s+out/i,
  /come\s+to\s+an\s+arrangement/i,
];

export function detectBribeAttempt(
  message: string,
  patronBribeAmount: number,
): BribeDetectionResult {
  if (patronBribeAmount === 0) return { isBribe: false, amount: 0, confidence: 'low' };

  let amount = 0;
  let confidence: BribeDetectionResult['confidence'] = 'low';

  // Check direct patterns first
  for (const pattern of DIRECT_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const numStr = match[1];
      if (numStr) amount = parseInt(numStr, 10);
      confidence = 'high';
      break;
    }
  }

  // Soft patterns
  if (confidence === 'low') {
    for (const pattern of SOFT_PATTERNS) {
      if (pattern.test(message)) {
        confidence = 'medium';
        break;
      }
    }
  }

  if (confidence === 'low') return { isBribe: false, amount: 0, confidence: 'low' };

  // Fall back to patron's defined bribe amount if we couldn't parse one
  if (amount === 0) amount = patronBribeAmount;

  return { isBribe: true, amount, confidence };
}
