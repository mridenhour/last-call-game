import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { AIPatron, Phase3Option, FightState } from '../game/aiTypes';

interface FightBreakingPointProps {
  patron: AIPatron;
  fightState: FightState;
  onChoice: (index: number) => void;
}

const OPTION_COLORS = [COLORS.neonBlue, COLORS.neonPink, COLORS.neonPurple];
const OPTION_LABELS = ['DE-ESCALATE', 'CONFRONT', 'INSIGHT'];

export default function FightBreakingPoint({ patron, fightState, onChoice }: FightBreakingPointProps) {
  const playerPct = fightState.playerHP / fightState.playerMaxHP;
  const enemyPct = fightState.enemyHP / fightState.enemyMaxHP;
  const playerHPColor = playerPct > 0.6 ? COLORS.neonGreen : playerPct > 0.3 ? COLORS.neonOrange : COLORS.neonPink;
  const enemyHPColor = enemyPct > 0.6 ? COLORS.neonPink : enemyPct > 0.3 ? COLORS.neonOrange : COLORS.neonGreen;

  const lastLog = fightState.log.filter(l => l.startsWith('❌') || l.startsWith('✅')).pop() ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>⚡ PHASE 3 — THE BREAKING POINT</Text>

      {/* Compact HP */}
      <View style={styles.hpRow}>
        <Text style={[styles.hpLabel, { color: playerHPColor }]}>YOU: {fightState.playerHP}HP</Text>
        <Text style={styles.vs}>·</Text>
        <Text style={[styles.hpLabel, { color: enemyHPColor }]}>
          {patron.name.split(' ')[0].toUpperCase()}: {fightState.enemyHP}HP
        </Text>
      </View>

      {/* Breaking point line */}
      <View style={styles.speechBox}>
        <Text style={styles.patronEmoji}>{patron.emoji}</Text>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{fightState.phase3Line}</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Everything you learned. One move. Make it count.
      </Text>

      {/* Previous attempt result */}
      {lastLog !== '' && (
        <View style={[styles.resultHint, lastLog.startsWith('✅') ? styles.resultCorrect : styles.resultWrong]}>
          <Text style={styles.resultHintText}>{lastLog}</Text>
        </View>
      )}

      {/* Options */}
      <View style={styles.optionsStack}>
        {fightState.phase3Options.map((option, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.optionBtn, { borderColor: OPTION_COLORS[i] }]}
            onPress={() => onChoice(i)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionTag, { color: OPTION_COLORS[i] }]}>
              {option.label ?? OPTION_LABELS[i]}
            </Text>
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.lg, gap: LAYOUT.spacing.lg,
  },
  phaseLabel: {
    color: COLORS.neonYellow, fontSize: LAYOUT.fontSize.sm,
    fontWeight: '800', letterSpacing: 2,
  },
  hpRow: {
    flexDirection: 'row', gap: LAYOUT.spacing.md, alignItems: 'center',
  },
  hpLabel: { fontSize: LAYOUT.fontSize.md, fontWeight: '800' },
  vs: { color: COLORS.textDim, fontWeight: '700' },
  speechBox: {
    flexDirection: 'row', gap: LAYOUT.spacing.md,
    backgroundColor: COLORS.bgSurface, borderRadius: 16,
    padding: LAYOUT.spacing.lg, width: '100%',
    borderWidth: 1, borderColor: COLORS.neonOrange,
    alignItems: 'flex-start',
  },
  patronEmoji: { fontSize: 36 },
  speechBubble: { flex: 1 },
  speechText: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md,
    fontStyle: 'italic', lineHeight: 22,
  },
  instruction: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center', fontStyle: 'italic',
  },
  resultHint: {
    width: '100%', borderRadius: 8, padding: LAYOUT.spacing.sm,
    borderWidth: 1,
  },
  resultCorrect: { backgroundColor: 'rgba(0,255,178,0.1)', borderColor: COLORS.neonGreen },
  resultWrong: { backgroundColor: 'rgba(255,45,85,0.1)', borderColor: COLORS.neonPink },
  resultHintText: { color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.sm, textAlign: 'center' },
  optionsStack: { gap: LAYOUT.spacing.md, width: '100%' },
  optionBtn: {
    backgroundColor: COLORS.bgCard, borderRadius: 14,
    padding: LAYOUT.spacing.md, borderWidth: 1,
    gap: 4,
  },
  optionTag: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  optionText: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md,
    lineHeight: 22, fontStyle: 'italic',
  },
});
