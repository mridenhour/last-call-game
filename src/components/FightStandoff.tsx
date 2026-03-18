import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { AIPatron, Phase1Tell, FightMoveChoice } from '../game/aiTypes';

interface FightStandoffProps {
  patron: AIPatron;
  tell: Phase1Tell;
  onChoice: (move: FightMoveChoice) => void;
}

const MOVES: { move: FightMoveChoice; emoji: string; label: string; desc: string }[] = [
  { move: 'dodge',  emoji: '💨', label: 'DODGE',        desc: 'Slip to the side' },
  { move: 'block',  emoji: '🛡️', label: 'BLOCK',        desc: 'Absorb the hit' },
  { move: 'strike', emoji: '👊', label: 'STRIKE FIRST', desc: 'Take the initiative' },
];

export default function FightStandoff({ patron, tell, onChoice }: FightStandoffProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.phaseLabel}>⚔️ PHASE 1 — THE STANDOFF</Text>

      {/* Opponent display */}
      <View style={styles.opponentCard}>
        <Text style={styles.opponentEmoji}>{patron.emoji}</Text>
        <View style={styles.opponentInfo}>
          <Text style={styles.opponentName}>{patron.name}</Text>
          <Text style={styles.fightStyle} numberOfLines={2}>{patron.fightStyle}</Text>
        </View>
      </View>

      {/* Tell */}
      <View style={styles.tellBox}>
        <Text style={styles.tellLabel}>⚡ BEHAVIORAL TELL</Text>
        <Text style={styles.tellText}>{tell.description}</Text>
        <Text style={styles.tellHint}>Read the tell. Choose your response.</Text>
      </View>

      {/* Move choices */}
      <View style={styles.movesRow}>
        {MOVES.map(({ move, emoji, label, desc }) => (
          <TouchableOpacity
            key={move}
            style={styles.moveBtn}
            onPress={() => onChoice(move)}
            activeOpacity={0.75}
          >
            <Text style={styles.moveEmoji}>{emoji}</Text>
            <Text style={styles.moveLabel}>{label}</Text>
            <Text style={styles.moveDesc}>{desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>
        Correct read → health or speed advantage.{'\n'}
        Wrong read → you eat the first hit.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.lg, gap: LAYOUT.spacing.lg,
  },
  phaseLabel: {
    color: COLORS.neonPink, fontSize: LAYOUT.fontSize.sm,
    fontWeight: '800', letterSpacing: 3,
  },
  opponentCard: {
    flexDirection: 'row', gap: LAYOUT.spacing.md,
    backgroundColor: COLORS.bgSurface, borderRadius: 16,
    padding: LAYOUT.spacing.lg, width: '100%',
    borderWidth: 1, borderColor: COLORS.neonPink + '60',
    alignItems: 'center',
  },
  opponentEmoji: { fontSize: 48 },
  opponentInfo: { flex: 1, gap: 4 },
  opponentName: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.xl, fontWeight: '800' },
  fightStyle: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm, fontStyle: 'italic', lineHeight: 18 },
  tellBox: {
    width: '100%', backgroundColor: COLORS.bgCard,
    borderRadius: 14, padding: LAYOUT.spacing.lg, gap: LAYOUT.spacing.sm,
    borderWidth: 1, borderColor: COLORS.neonOrange,
    borderLeftWidth: 4,
  },
  tellLabel: { color: COLORS.neonOrange, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  tellText: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md, lineHeight: 24 },
  tellHint: { color: COLORS.textDim, fontSize: 11, fontStyle: 'italic' },
  movesRow: { flexDirection: 'row', gap: LAYOUT.spacing.sm, width: '100%' },
  moveBtn: {
    flex: 1, backgroundColor: COLORS.bgSurface,
    borderRadius: 14, paddingVertical: LAYOUT.spacing.lg,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.neonPink,
  },
  moveEmoji: { fontSize: 28 },
  moveLabel: {
    color: COLORS.neonPink, fontSize: 10,
    fontWeight: '900', letterSpacing: 1.5,
  },
  moveDesc: {
    color: COLORS.textDim, fontSize: 9,
    textAlign: 'center', paddingHorizontal: 4,
  },
  hint: {
    color: COLORS.textDim, fontSize: 11,
    textAlign: 'center', lineHeight: 18,
  },
});
