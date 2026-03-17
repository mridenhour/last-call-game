import { useState, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';

export interface VoiceHook {
  isMuted: boolean;
  toggleMute: () => void;
  speak: (text: string, pitch?: number, rate?: number) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
}

export function useVoice(): VoiceHook {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const muteRef = useRef(false);

  const stopSpeech = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, pitch = 1.0, rate = 1.0) => {
    if (muteRef.current) return;
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(text, {
      pitch: Math.max(0.5, Math.min(2.0, pitch)),
      rate: Math.max(0.5, Math.min(2.0, rate)),
      language: 'en-US',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      muteRef.current = next;
      if (next) Speech.stop();
      return next;
    });
  }, []);

  return { isMuted, toggleMute, speak, stopSpeech, isSpeaking };
}
