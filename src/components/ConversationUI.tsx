import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { ConversationMessage, AIPatron, BouncerPersonality } from '../game/aiTypes';
import PersonalityBadge from './PersonalityBadge';

interface ConversationUIProps {
  patron: AIPatron;
  messages: ConversationMessage[];
  isPatronTyping: boolean;
  personality: BouncerPersonality;
  isMuted: boolean;
  onSend: (text: string) => void;
  onToggleMute: () => void;
  onLetIn: () => void;
  onReject: () => void;
}

export default function ConversationUI({
  patron, messages, isPatronTyping, personality,
  isMuted, onSend, onToggleMute, onLetIn, onReject,
}: ConversationUIProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, isPatronTyping]);

  useEffect(() => {
    if (isPatronTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      typingDots.stopAnimation();
      typingDots.setValue(0);
    }
  }, [isPatronTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    onSend(text);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header strip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.patronEmoji}>{patron.emoji}</Text>
          <View>
            <Text style={styles.patronName}>{patron.name}</Text>
            <Text style={styles.patronDesc} numberOfLines={1}>{patron.deceptionType}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <PersonalityBadge personality={personality} />
          <TouchableOpacity onPress={onToggleMute} style={styles.muteBtn}>
            <Text style={styles.muteBtnText}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View key={msg.id} style={[
            styles.bubble,
            msg.role === 'bouncer' ? styles.bouncerBubble : styles.patronBubble,
            msg.isBribe && styles.bribeBubble,
          ]}>
            {msg.isBribe && <Text style={styles.brideTag}>💵 BRIBE ATTEMPT</Text>}
            <Text style={[
              styles.bubbleText,
              msg.role === 'bouncer' ? styles.bouncerText : styles.patronText,
            ]}>
              {msg.text}
            </Text>
            <Text style={styles.bubbleTime}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}

        {isPatronTyping && (
          <View style={[styles.bubble, styles.patronBubble, styles.typingBubble]}>
            <Animated.Text style={[styles.typingText, { opacity: typingDots }]}>
              {patron.name} is responding...
            </Animated.Text>
          </View>
        )}
      </ScrollView>

      {/* Decision buttons */}
      <View style={styles.decisionRow}>
        <TouchableOpacity style={styles.rejectDecisionBtn} onPress={onReject} activeOpacity={0.8}>
          <Text style={styles.rejectDecisionText}>✗ REJECT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.letInBtn} onPress={onLetIn} activeOpacity={0.8}>
          <Text style={styles.letInText}>✓ LET IN</Text>
        </TouchableOpacity>
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Say something to them..."
          placeholderTextColor={COLORS.textDim}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
          maxLength={200}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md, paddingVertical: LAYOUT.spacing.sm,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderDim,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: LAYOUT.spacing.sm },
  patronEmoji: { fontSize: 28 },
  patronName: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md, fontWeight: '700' },
  patronDesc: { color: COLORS.neonPink, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: LAYOUT.spacing.sm },
  muteBtn: { padding: 6 },
  muteBtnText: { fontSize: 20 },
  messageList: { flex: 1 },
  messageListContent: {
    padding: LAYOUT.spacing.md, paddingBottom: LAYOUT.spacing.xl, gap: LAYOUT.spacing.sm,
  },
  bubble: {
    maxWidth: '80%', borderRadius: 14, padding: LAYOUT.spacing.md,
    gap: 4,
  },
  bouncerBubble: {
    alignSelf: 'flex-end', backgroundColor: COLORS.neonBlue + '25',
    borderWidth: 1, borderColor: COLORS.neonBlue + '60',
  },
  patronBubble: {
    alignSelf: 'flex-start', backgroundColor: COLORS.bgSurface,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  bribeBubble: {
    borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.08)',
  },
  brideTag: { color: '#FFD700', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  bubbleText: { fontSize: LAYOUT.fontSize.md, lineHeight: 22 },
  bouncerText: { color: COLORS.textPrimary },
  patronText: { color: COLORS.textSecondary },
  bubbleTime: { color: COLORS.textDim, fontSize: 9, alignSelf: 'flex-end' },
  typingBubble: { opacity: 0.7 },
  typingText: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm, fontStyle: 'italic' },
  decisionRow: {
    flexDirection: 'row', paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.sm, gap: LAYOUT.spacing.sm,
  },
  rejectDecisionBtn: {
    flex: 1, backgroundColor: COLORS.neonPink,
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  rejectDecisionText: { color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.sm, letterSpacing: 2 },
  letInBtn: {
    flex: 1, backgroundColor: COLORS.neonGreen,
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  letInText: { color: '#000', fontWeight: '900', fontSize: LAYOUT.fontSize.sm, letterSpacing: 2 },
  inputRow: {
    flexDirection: 'row', paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.md, gap: LAYOUT.spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1, backgroundColor: COLORS.bgSurface,
    borderRadius: 22, paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.sm, color: COLORS.textPrimary,
    fontSize: LAYOUT.fontSize.md, borderWidth: 1, borderColor: COLORS.borderDim,
    minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.neonBlue, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.borderDim },
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
