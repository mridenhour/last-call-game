import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { FightMove, Patron, FightRound } from '../game/types';
import { getMoveEmoji, getMoveLabel, PLAYER_MAX_HP, getEnemyMaxHP } from '../game/fight';

interface FightMinigameProps {
  patron: Patron;
  playerHP: number;
  enemyHP: number;
  lastRound: FightRound | null;
  onMove: (move: FightMove) => void;
}

const MOVES: FightMove[] = ['block', 'dodge', 'strike'];

export default function FightMinigame({
  patron, playerHP, enemyHP, lastRound, onMove
}: FightMinigameProps) {
  const maxEnemyHP = getEnemyMaxHP(patron.fightLevel);
  const playerPct = (playerHP / PLAYER_MAX_HP) * 100;
  const enemyPct = (enemyHP / maxEnemyHP) * 100;

  const playerHPColor = playerPct > 60 ? COLORS.neonGreen : playerPct > 30 ? COLORS.neonOrange : COLORS.neonPink;
  const enemyHPColor = enemyPct > 60 ? COLORS.neonPink : enemyPct > 30 ? COLORS.neonOrange : COLORS.neonGreen;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥊 STREET FIGHT</Text>
      <Text style={styles.subtitle}>vs. {patron.name}</Text>

      {/* HP bars */}
      <View style={styles.hpSection}>
        <View style={styles.hpBlock}>
          <Text style={styles.hpLabel}>YOU</Text>
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${playerPct}%` as any, backgroundColor: playerHPColor }]} />
          </View>
          <Text style={[styles.hpValue, { color: playerHPColor }]}>{playerHP}</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.hpBlock}>
          <Text style={styles.hpLabel}>{patron.portrait} {patron.name.split(' ')[0].toUpperCase()}</Text>
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${enemyPct}%` as any, backgroundColor: enemyHPColor }]} />
          </View>
          <Text style={[styles.hpValue, { color: enemyHPColor }]}>{enemyHP}</Text>
        </View>
      </View>

      {/* Last round result */}
      {lastRound && (
        <View style={[
          styles.resultBox,
          lastRound.result === 'hit' ? styles.resultHit :
          lastRound.result === 'blocked' ? styles.resultBlock :
          styles.resultMiss,
        ]}>
          <Text style={styles.resultText}>{lastRound.message}</Text>
          {lastRound.enemyDamage > 0 && (
            <Text style={styles.dmgText}>You dealt <Text style={styles.dmgGreen}>{lastRound.enemyDamage} DMG</Text></Text>
          )}
          {lastRound.playerDamage > 0 && (
            <Text style={styles.dmgText}>You took <Text style={styles.dmgRed}>{lastRound.playerDamage} DMG</Text></Text>
          )}
        </View>
      )}

      {/* Move hint */}
      <Text style={styles.hint}>STRIKE beats BLOCK · BLOCK beats DODGE · DODGE beats STRIKE</Text>

      {/* Move buttons */}
      <View style={styles.moveRow}>
        {MOVES.map(move => (
          <TouchableOpacity
            key={move}
            style={styles.moveBtn}
            onPress={() => onMove(move)}
            activeOpacity={0.75}
          >
            <Text style={styles.moveEmoji}>{getMoveEmoji(move)}</Text>
            <Text style={styles.moveLabel}>{getMoveLabel(move)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingTop: LAYOUT.spacing.xl,
    gap: LAYOUT.spacing.lg,
  },
  title: {
    color: COLORS.neonPink,
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '600',
    marginTop: -LAYOUT.spacing.md,
  },
  hpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    width: '100%',
  },
  hpBlock: {
    flex: 1,
    gap: 4,
  },
  hpLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hpTrack: {
    height: 12,
    backgroundColor: COLORS.borderDim,
    borderRadius: 6,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 6,
  },
  hpValue: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  vsText: {
    color: COLORS.textDim,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  resultBox: {
    width: '100%',
    borderRadius: 10,
    padding: LAYOUT.spacing.md,
    gap: 4,
    borderWidth: 1,
  },
  resultHit: {
    backgroundColor: 'rgba(0,255,178,0.1)',
    borderColor: COLORS.neonGreen,
  },
  resultBlock: {
    backgroundColor: 'rgba(255,140,0,0.1)',
    borderColor: COLORS.neonOrange,
  },
  resultMiss: {
    backgroundColor: 'rgba(255,45,85,0.1)',
    borderColor: COLORS.neonPink,
  },
  resultText: {
    color: COLORS.textPrimary,
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  dmgText: {
    color: COLORS.textSecondary,
    fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center',
  },
  dmgGreen: {
    color: COLORS.neonGreen,
    fontWeight: '700',
  },
  dmgRed: {
    color: COLORS.neonPink,
    fontWeight: '700',
  },
  hint: {
    color: COLORS.textDim,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  moveRow: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    width: '100%',
  },
  moveBtn: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    paddingVertical: LAYOUT.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neonPink,
    gap: 6,
  },
  moveEmoji: {
    fontSize: 32,
  },
  moveLabel: {
    color: COLORS.neonPink,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
