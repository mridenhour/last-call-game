import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { formatMoney } from '../game/scoring';
import { GameState } from '../game/types';

interface HUDProps {
  state: GameState;
  onBribePress?: () => void;
}

export default function HUD({ state, onBribePress }: HUDProps) {
  const { balance, score, policeMeter, locationConfig, patronsProcessed, patronQueue } = state;
  const total = locationConfig.patronsPerNight;
  const remaining = patronQueue.length;
  const done = total - remaining;
  const progressPct = total > 0 ? done / total : 0;

  const meterColor =
    policeMeter >= 80 ? COLORS.neonPink :
    policeMeter >= 50 ? COLORS.neonOrange :
    COLORS.neonGreen;

  const balanceColor = balance < 0 ? COLORS.moneyNegative : COLORS.moneyPositive;

  return (
    <View style={styles.container}>
      {/* Top row: location + score */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.locationName}>{locationConfig.name}</Text>
          <Text style={styles.locationSub}>{locationConfig.subtitle}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      {/* Money bar */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>BALANCE</Text>
          <Text style={[styles.statValue, { color: balanceColor }]}>
            {formatMoney(balance)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PATRONS</Text>
          <Text style={styles.statValue}>
            {done}<Text style={styles.statDim}>/{total}</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.statItem} onPress={onBribePress}>
          <Text style={styles.statLabel}>HEAT</Text>
          <Text style={[styles.statValue, { color: meterColor }]}>
            {Math.round(policeMeter)}%
          </Text>
        </TouchableOpacity>
      </View>

      {/* Police meter bar */}
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, {
          width: `${policeMeter}%` as any,
          backgroundColor: meterColor,
        }]} />
      </View>

      {/* Patron progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct * 100}%` as any }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingTop: LAYOUT.spacing.sm,
    paddingBottom: LAYOUT.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDim,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.sm,
  },
  locationName: {
    color: COLORS.textPrimary,
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locationSub: {
    color: COLORS.neonPink,
    fontSize: LAYOUT.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    color: COLORS.textDim,
    fontSize: LAYOUT.fontSize.xs,
    letterSpacing: 2,
  },
  scoreValue: {
    color: COLORS.neonYellow,
    fontSize: LAYOUT.fontSize.xl,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.xs,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '700',
  },
  statDim: {
    color: COLORS.textDim,
    fontSize: LAYOUT.fontSize.sm,
  },
  meterTrack: {
    height: 4,
    backgroundColor: COLORS.borderDim,
    borderRadius: 2,
    marginBottom: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: COLORS.borderDim,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.neonBlue,
    borderRadius: 1,
  },
});
