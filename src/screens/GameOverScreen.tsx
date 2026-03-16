import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { GameState } from '../game/types';
import { formatMoney, getNightGrade } from '../game/scoring';

interface GameOverScreenProps {
  state: GameState;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ state, onRestart, onMenu }: GameOverScreenProps) {
  const { score, balance, patronsProcessed, locationConfig, gameOverReason, patronsLetIn, underage_let_in } = state;
  const grade = getNightGrade(score, patronsProcessed);

  const gradeColor = {
    S: COLORS.neonYellow,
    A: COLORS.neonGreen,
    B: COLORS.neonBlue,
    C: COLORS.neonOrange,
    D: COLORS.neonPink,
  }[grade] ?? COLORS.textPrimary;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A0000', '#0A0A0F', '#0A0010']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.titleTop}>GAME</Text>
        <Text style={styles.titleBottom}>OVER</Text>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>{gameOverReason}</Text>
        </View>

        {/* Grade */}
        <View style={styles.gradeContainer}>
          <Text style={styles.gradeLabel}>PERFORMANCE</Text>
          <Text style={[styles.gradeValue, { color: gradeColor }]}>{grade}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={[styles.statValue, { color: COLORS.neonYellow }]}>{score}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BALANCE</Text>
            <Text style={[styles.statValue, { color: balance >= 0 ? COLORS.neonGreen : COLORS.neonPink }]}>
              {formatMoney(balance)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PATRONS IN</Text>
            <Text style={styles.statValue}>{patronsLetIn}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>UNDERAGE IN</Text>
            <Text style={[styles.statValue, { color: underage_let_in > 0 ? COLORS.neonPink : COLORS.neonGreen }]}>
              {underage_let_in}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BAR</Text>
            <Text style={styles.statValue}>{locationConfig.subtitle}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnStack}>
          <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.85}>
            <Text style={styles.restartBtnText}>↺  TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={onMenu} activeOpacity={0.85}>
            <Text style={styles.menuBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl, gap: LAYOUT.spacing.lg,
  },
  titleTop: {
    color: COLORS.neonPink, fontSize: 60, fontWeight: '900',
    letterSpacing: 16,
    textShadowColor: COLORS.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    lineHeight: 62,
  },
  titleBottom: {
    color: COLORS.textPrimary, fontSize: 80, fontWeight: '900',
    letterSpacing: 16,
    marginTop: -LAYOUT.spacing.md,
    lineHeight: 82,
  },
  reasonBox: {
    backgroundColor: 'rgba(255,45,85,0.15)',
    borderRadius: 10, paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    borderWidth: 1, borderColor: COLORS.neonPink,
    width: '100%',
  },
  reasonText: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md,
    textAlign: 'center', lineHeight: 22,
  },
  gradeContainer: { alignItems: 'center', gap: 4 },
  gradeLabel: {
    color: COLORS.textDim, fontSize: 11,
    letterSpacing: 3, fontWeight: '700',
  },
  gradeValue: {
    fontSize: 72, fontWeight: '900', lineHeight: 80,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm, justifyContent: 'center', width: '100%',
  },
  statCard: {
    backgroundColor: COLORS.bgSurface, borderRadius: 10,
    padding: LAYOUT.spacing.md, alignItems: 'center',
    minWidth: 100, flex: 1,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  statLabel: {
    color: COLORS.textDim, fontSize: 9,
    letterSpacing: 1.5, fontWeight: '700',
  },
  statValue: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.lg,
    fontWeight: '800', marginTop: 4,
  },
  btnStack: { gap: LAYOUT.spacing.md, width: '100%', marginTop: LAYOUT.spacing.sm },
  restartBtn: {
    backgroundColor: COLORS.neonPink, borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: COLORS.neonPink, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 12,
  },
  restartBtnText: {
    color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.lg, letterSpacing: 3,
  },
  menuBtn: {
    backgroundColor: COLORS.bgSurface, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  menuBtnText: {
    color: COLORS.textSecondary, fontWeight: '700',
    fontSize: LAYOUT.fontSize.md, letterSpacing: 2,
  },
});
