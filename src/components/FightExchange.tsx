import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { AIPatron, FightState } from '../game/aiTypes';
import { ActivePrompt, Zone } from '../hooks/useFight';

interface FightExchangeProps {
  patron: AIPatron;
  fightState: FightState;
  activePrompt: ActivePrompt | null;
  onZoneTap: (zone: Zone) => void;
}

const ZONES: { id: Zone; label: string }[] = [
  { id: 'left', label: 'LEFT' },
  { id: 'center', label: 'CENTER' },
  { id: 'right', label: 'RIGHT' },
];

export default function FightExchange({ patron, fightState, activePrompt, onZoneTap }: FightExchangeProps) {
  const progressAnim = useRef(new Animated.Value(1)).current;
  const promptAnim = useRef(new Animated.Value(0)).current;
  const prevPromptId = useRef<string | null>(null);

  const playerPct = fightState.playerHP / fightState.playerMaxHP;
  const enemyPct = fightState.enemyHP / fightState.enemyMaxHP;

  const playerHPColor = playerPct > 0.6 ? COLORS.neonGreen : playerPct > 0.3 ? COLORS.neonOrange : COLORS.neonPink;
  const enemyHPColor = enemyPct > 0.6 ? COLORS.neonPink : enemyPct > 0.3 ? COLORS.neonOrange : COLORS.neonGreen;

  // Animate prompt countdown
  useEffect(() => {
    if (activePrompt && activePrompt.id !== prevPromptId.current) {
      prevPromptId.current = activePrompt.id;
      progressAnim.setValue(1);
      promptAnim.setValue(0);
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: activePrompt.windowMs,
          useNativeDriver: false,
        }),
        Animated.spring(promptAnim, { toValue: 1, useNativeDriver: true, tension: 120 }),
      ]).start();
    } else if (!activePrompt) {
      promptAnim.setValue(0);
    }
  }, [activePrompt?.id]);

  const isDefend = activePrompt?.type === 'defend';
  const promptColor = isDefend ? COLORS.neonPink : COLORS.neonGreen;

  const lastLog = fightState.log[fightState.log.length - 1] ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>⚔️ PHASE 2 — THE EXCHANGE</Text>

      {/* HP bars */}
      <View style={styles.hpRow}>
        <View style={styles.hpBlock}>
          <Text style={styles.hpName}>YOU</Text>
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${playerPct * 100}%` as any, backgroundColor: playerHPColor }]} />
          </View>
          <Text style={[styles.hpVal, { color: playerHPColor }]}>{fightState.playerHP}</Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.hpBlock}>
          <Text style={styles.hpName}>{patron.emoji} {patron.name.split(' ')[0].toUpperCase()}</Text>
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${enemyPct * 100}%` as any, backgroundColor: enemyHPColor }]} />
          </View>
          <Text style={[styles.hpVal, { color: enemyHPColor }]}>{fightState.enemyHP}</Text>
        </View>
      </View>

      {/* Prompt countdown bar */}
      {activePrompt && (
        <Animated.View style={[
          styles.countdownTrack,
          { borderColor: promptColor },
        ]}>
          <Animated.View style={[
            styles.countdownFill,
            { backgroundColor: promptColor, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) as any },
          ]} />
        </Animated.View>
      )}

      {/* Instruction */}
      <Animated.View style={[styles.instructionBox, { opacity: promptAnim, transform: [{ scale: promptAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
        <Text style={[styles.instructionText, { color: promptColor }]}>
          {activePrompt
            ? (isDefend ? '🛡️  BLOCK! Tap any zone!' : `👊  ATTACK!  TAP  ${activePrompt.zone.toUpperCase()}`)
            : '⏳  Wait for prompt...'}
        </Text>
      </Animated.View>

      {/* Zone buttons */}
      <View style={styles.zoneRow}>
        {ZONES.map(({ id, label }) => {
          const isTarget = activePrompt?.zone === id && !isDefend;
          const isActive = !!activePrompt;
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.zoneBtn,
                isActive && (isDefend ? styles.zoneBtnDefend : (isTarget ? styles.zoneBtnTarget : styles.zoneBtnInactive)),
              ]}
              onPress={() => onZoneTap(id)}
              activeOpacity={0.7}
            >
              <Text style={styles.zoneLabel}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Last log line */}
      {lastLog ? (
        <View style={styles.logBox}>
          <Text style={styles.logText}>{lastLog}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.lg, gap: LAYOUT.spacing.lg,
  },
  phaseLabel: {
    color: COLORS.neonOrange, fontSize: LAYOUT.fontSize.sm,
    fontWeight: '800', letterSpacing: 3,
  },
  hpRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: LAYOUT.spacing.md, width: '100%',
  },
  hpBlock: { flex: 1, gap: 4 },
  hpName: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  hpTrack: { height: 12, backgroundColor: COLORS.borderDim, borderRadius: 6, overflow: 'hidden' },
  hpFill: { height: '100%', borderRadius: 6 },
  hpVal: { fontSize: LAYOUT.fontSize.md, fontWeight: '800', textAlign: 'center' },
  vs: { color: COLORS.textDim, fontWeight: '700', fontSize: LAYOUT.fontSize.sm, letterSpacing: 2 },
  countdownTrack: {
    width: '100%', height: 8, borderRadius: 4,
    backgroundColor: COLORS.borderDim, overflow: 'hidden',
    borderWidth: 1,
  },
  countdownFill: { height: '100%', borderRadius: 4 },
  instructionBox: {
    paddingHorizontal: LAYOUT.spacing.xl, paddingVertical: LAYOUT.spacing.md,
    borderRadius: 10, backgroundColor: COLORS.bgSurface,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  instructionText: {
    fontSize: LAYOUT.fontSize.lg, fontWeight: '900', letterSpacing: 2, textAlign: 'center',
  },
  zoneRow: { flexDirection: 'row', gap: LAYOUT.spacing.md, width: '100%' },
  zoneBtn: {
    flex: 1, height: 100, borderRadius: 16,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.borderDim,
  },
  zoneBtnTarget: {
    backgroundColor: 'rgba(0,255,178,0.15)',
    borderColor: COLORS.neonGreen,
    shadowColor: COLORS.neonGreen, shadowOpacity: 0.5, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  zoneBtnDefend: {
    backgroundColor: 'rgba(255,45,85,0.15)',
    borderColor: COLORS.neonPink,
    shadowColor: COLORS.neonPink, shadowOpacity: 0.5, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  zoneBtnInactive: { opacity: 0.4 },
  zoneLabel: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md, fontWeight: '800', letterSpacing: 2 },
  logBox: {
    backgroundColor: COLORS.bgCard, borderRadius: 8,
    paddingHorizontal: LAYOUT.spacing.md, paddingVertical: LAYOUT.spacing.sm,
    width: '100%',
  },
  logText: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center', fontStyle: 'italic',
  },
});
