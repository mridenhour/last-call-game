import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HighScore } from '../game/types';

const HIGH_SCORES_KEY = '@last_call_high_scores';
const MAX_SCORES = 10;

export function useHighScores() {
  const [scores, setScores] = useState<HighScore[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HIGH_SCORES_KEY);
      if (raw) {
        setScores(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Failed to load scores', e);
    } finally {
      setLoaded(true);
    }
  }, []);

  const saveScore = useCallback(async (score: HighScore) => {
    try {
      const raw = await AsyncStorage.getItem(HIGH_SCORES_KEY);
      const existing: HighScore[] = raw ? JSON.parse(raw) : [];
      const updated = [...existing, score]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES);
      await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updated));
      setScores(updated);
    } catch (e) {
      console.warn('Failed to save score', e);
    }
  }, []);

  const clearScores = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(HIGH_SCORES_KEY);
      setScores([]);
    } catch (e) {
      console.warn('Failed to clear scores', e);
    }
  }, []);

  return { scores, loaded, saveScore, clearScores };
}
