import { useState, useCallback } from 'react';
import { AIPatron, GenerationState } from '../game/aiTypes';
import { generateAiPatron } from '../api/generatePatron';
import { BarLocation } from '../game/types';

const GENERATION_LOGS = [
  'Scanning psychological database...',
  'Synthesizing behavioral profile...',
  'Calibrating deception layers...',
  'Generating identity matrix...',
  'Calculating manipulation vectors...',
  'Assigning behavioral tells...',
  'Compositing backstory...',
  'Patron ready.',
];

export interface PatronGenerationHook {
  generation: GenerationState;
  patron: AIPatron | null;
  generate: (location: BarLocation) => Promise<AIPatron | null>;
  reset: () => void;
}

export function usePatronGeneration(): PatronGenerationHook {
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle',
    logs: [],
    error: null,
  });
  const [patron, setPatron] = useState<AIPatron | null>(null);

  const generate = useCallback(async (location: BarLocation): Promise<AIPatron | null> => {
    setPatron(null);
    setGeneration({ status: 'loading', logs: [], error: null });

    // Stream log lines while waiting for API
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < GENERATION_LOGS.length - 1) {
        const line = GENERATION_LOGS[logIndex++];
        setGeneration(prev => ({ ...prev, logs: [...prev.logs, line] }));
      }
    }, 380);

    try {
      const result = await generateAiPatron(location);
      clearInterval(logInterval);
      setGeneration({
        status: 'success',
        logs: [...GENERATION_LOGS],
        error: null,
      });
      setPatron(result);
      return result;
    } catch (err: any) {
      clearInterval(logInterval);
      const msg = err?.message ?? 'Unknown error generating patron.';
      setGeneration(prev => ({
        ...prev,
        status: 'error',
        error: msg,
        logs: [...prev.logs, `ERROR: ${msg}`],
      }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setPatron(null);
    setGeneration({ status: 'idle', logs: [], error: null });
  }, []);

  return { generation, patron, generate, reset };
}
