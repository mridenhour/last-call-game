import { BarConfig } from './types';

export const BAR_CONFIGS: Record<string, BarConfig> = {
  dive: {
    id: 'dive',
    name: 'The Rusty Nail',
    subtitle: 'Dive Bar',
    patronsPerNight: 15,
    policeAggression: 0.3,
    bribeCost: 50,
    minBalance: 0,
    entryFee: 8,
    description: 'A grimy bar on the wrong side of town. Low stakes, low pay.',
  },
  college: {
    id: 'college',
    name: "Keg & Crown",
    subtitle: 'College Bar',
    patronsPerNight: 20,
    policeAggression: 0.6,
    bribeCost: 100,
    minBalance: 200,
    entryFee: 12,
    description: 'Greek row adjacent. Fake IDs are practically a sport here.',
  },
  rooftop: {
    id: 'rooftop',
    name: 'Sky & Rye',
    subtitle: 'Rooftop Lounge',
    patronsPerNight: 18,
    policeAggression: 0.5,
    bribeCost: 250,
    minBalance: 600,
    entryFee: 25,
    description: 'Upscale crowd. Big spenders — but big problems too.',
  },
  nightclub: {
    id: 'nightclub',
    name: 'VAULT',
    subtitle: 'Nightclub',
    patronsPerNight: 25,
    policeAggression: 0.9,
    bribeCost: 500,
    minBalance: 1500,
    entryFee: 40,
    description: 'The city\'s hottest club. Zero tolerance. Maximum chaos.',
  },
};

export const LOCATION_ORDER: string[] = ['dive', 'college', 'rooftop', 'nightclub'];

export function getNextLocation(current: string): string | null {
  const idx = LOCATION_ORDER.indexOf(current);
  if (idx === -1 || idx === LOCATION_ORDER.length - 1) return null;
  return LOCATION_ORDER[idx + 1];
}
