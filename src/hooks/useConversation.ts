import { useState, useCallback, useRef } from 'react';
import { AIPatron, ConversationMessage, BribeOffer, BouncerPersonality } from '../game/aiTypes';
import { getPatronResponse, getPatronSilenceResponse } from '../api/conversationApi';
import { detectBribeAttempt } from '../game/bribeDetection';
import { VoiceHook } from './useVoice';
import * as Haptics from 'expo-haptics';

export interface ConversationHook {
  messages: ConversationMessage[];
  isPatronTyping: boolean;
  pendingBribe: BribeOffer | null;
  clearBribe: () => void;
  sendBouncerMessage: (text: string) => Promise<void>;
  triggerSilenceResponse: () => Promise<void>;
  getOpeningLine: () => Promise<void>;
  playMessage: (text: string) => void;
  reset: () => void;
}

function makeId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useConversation(
  patron: AIPatron | null,
  personality: BouncerPersonality,
  voice: VoiceHook,
): ConversationHook {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isPatronTyping, setIsPatronTyping] = useState(false);
  const [pendingBribe, setPendingBribe] = useState<BribeOffer | null>(null);
  const messagesRef = useRef<ConversationMessage[]>([]);

  const addMessage = useCallback((msg: ConversationMessage) => {
    messagesRef.current = [...messagesRef.current, msg];
    setMessages([...messagesRef.current]);
  }, []);

  const handlePatronText = useCallback((text: string, currentMessages: ConversationMessage[]) => {
    const id = makeId();
    const msg: ConversationMessage = {
      id,
      role: 'patron',
      text,
      timestamp: Date.now(),
    };

    // Check for bribe
    if (patron && patron.bribeAmount > 0) {
      const bribeResult = detectBribeAttempt(text, patron.bribeAmount);
      if (bribeResult.isBribe && !pendingBribe) {
        msg.isBribe = true;
        msg.brideDetectedAmount = bribeResult.amount;
        setPendingBribe({ amount: bribeResult.amount, messageId: id, patronText: text });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    }

    messagesRef.current = [...currentMessages, msg];
    setMessages([...messagesRef.current]);

    return msg;
  }, [patron, pendingBribe, voice]);

  const getOpeningLine = useCallback(async () => {
    if (!patron) return;
    setIsPatronTyping(true);
    try {
      const text = await getPatronResponse(patron, [], null, personality);
      handlePatronText(text, []);
    } catch (e) {
      // Silent fail — show a fallback
      handlePatronText(`*${patron.name} approaches, saying nothing yet.*`, []);
    } finally {
      setIsPatronTyping(false);
    }
  }, [patron, personality, handlePatronText]);

  const sendBouncerMessage = useCallback(async (text: string) => {
    if (!patron || !text.trim()) return;

    const bouncerMsg: ConversationMessage = {
      id: makeId(),
      role: 'bouncer',
      text: text.trim(),
      timestamp: Date.now(),
    };

    const currentMessages = [...messagesRef.current, bouncerMsg];
    messagesRef.current = currentMessages;
    setMessages([...currentMessages]);

    setIsPatronTyping(true);
    try {
      const response = await getPatronResponse(patron, messagesRef.current.slice(0, -1), text.trim(), personality);
      handlePatronText(response, currentMessages);
    } catch (e) {
      handlePatronText(`*${patron.name} stares at you in silence.*`, currentMessages);
    } finally {
      setIsPatronTyping(false);
    }
  }, [patron, personality, handlePatronText]);

  const triggerSilenceResponse = useCallback(async () => {
    if (!patron || isPatronTyping) return;
    setIsPatronTyping(true);
    try {
      const response = await getPatronSilenceResponse(patron, messagesRef.current, personality);
      handlePatronText(response, messagesRef.current);
    } catch {
      // silent
    } finally {
      setIsPatronTyping(false);
    }
  }, [patron, personality, isPatronTyping, handlePatronText]);

  const playMessage = useCallback((text: string) => {
    if (patron) {
      voice.speak(text, patron.voicePitch, patron.voiceRate);
    }
  }, [patron, voice]);

  const clearBribe = useCallback(() => setPendingBribe(null), []);

  const reset = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    setIsPatronTyping(false);
    setPendingBribe(null);
  }, []);

  return {
    messages,
    isPatronTyping,
    pendingBribe,
    clearBribe,
    sendBouncerMessage,
    triggerSilenceResponse,
    getOpeningLine,
    playMessage,
    reset,
  };
}
