import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { HighScore } from '../game/types';
import { BAR_CONFIGS } from '../game/locations';
import { formatMoney } from '../game/scoring';

interface HighScoreScreenProps {
  scores: HighScore[];
  onBack: () => void;
  onClear: () => void;
}

export default function HighScoreScreen({ scores, onBack, onClear }: HighScoreScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0F', '#100A1A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 HIGH SCORES</Text>
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {scores.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyText}>No scores yet.</Text>
          <Text style={styles.emptySubtext}>Play a round to get on the board.</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={[styles.scoreRow, index === 0 && styles.topScore]}>
              <View style={styles.rankBadge}>
                <Text style={[styles.rank, index === 0 && styles.rankTop]}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreLocation}>
                  {BAR_CONFIGS[item.location]?.name ?? item.location}
                </Text>
                <Text style={styles.scoreDate}>{item.date}</Text>
              </View>
              <View style={styles.scoreValues}>
                <Text style={styles.scorePoints}>{item.score}</Text>
                <Text style={[
                  styles.scoreBalance,
                  { color: item.balance >= 0 ? COLORS.neonGreen : COLORS.neonPink }
                ]}>
                  {formatMoney(item.balance)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingTop: 56, paddingBottom: LAYOUT.spacing.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderDim,
  },
  backBtn: { padding: LAYOUT.spacing.sm },
  backBtnText: { color: COLORS.neonPink, fontWeight: '700', fontSize: LAYOUT.fontSize.sm, letterSpacing: 1 },
  title: { color: COLORS.neonYellow, fontSize: LAYOUT.fontSize.lg, fontWeight: '900', letterSpacing: 2 },
  clearBtn: { padding: LAYOUT.spacing.sm },
  clearBtnText: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.xs, fontWeight: '600', letterSpacing: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: LAYOUT.spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.xl, fontWeight: '700' },
  emptySubtext: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.md },
  list: { padding: LAYOUT.spacing.lg, gap: LAYOUT.spacing.md },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: LAYOUT.spacing.md,
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    padding: LAYOUT.spacing.md, borderWidth: 1, borderColor: COLORS.borderDim,
  },
  topScore: {
    borderColor: COLORS.neonYellow,
    shadowColor: COLORS.neonYellow, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  rankBadge: { width: 40, alignItems: 'center' },
  rank: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.md, fontWeight: '700' },
  rankTop: { fontSize: LAYOUT.fontSize.xl },
  scoreInfo: { flex: 1, gap: 2 },
  scoreLocation: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md, fontWeight: '700' },
  scoreDate: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.xs },
  scoreValues: { alignItems: 'flex-end', gap: 2 },
  scorePoints: { color: COLORS.neonYellow, fontSize: LAYOUT.fontSize.lg, fontWeight: '900' },
  scoreBalance: { fontSize: LAYOUT.fontSize.sm, fontWeight: '700' },
});
