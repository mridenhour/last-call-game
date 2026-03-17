import { useState, useCallback } from 'react';
import { BouncerPersonality } from '../game/aiTypes';
import { inferPersonality } from '../game/bouncerPersonality';

export interface BouncerPersonalityHook {
  personality: BouncerPersonality;
  bouncerMessages: string[];
  addBouncerMessage: (msg: string) => void;
  reset: () => void;
}

export function useBouncerPersonality(): BouncerPersonalityHook {
  const [bouncerMessages, setBouncerMessages] = useState<string[]>([]);
  const [personality, setPersonality] = useState<BouncerPersonality>('By-the-Book');

  const addBouncerMessage = useCallback((msg: string) => {
    setBouncerMessages(prev => {
      const updated = [...prev, msg];
      setPersonality(inferPersonality(updated));
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    setBouncerMessages([]);
    setPersonality('By-the-Book');
  }, []);

  return { personality, bouncerMessages, addBouncerMessage, reset };
}
