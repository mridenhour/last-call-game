import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { AIPatron } from '../game/aiTypes';
import StatBar from './StatBar';

interface AiPatronCardProps {
  patron: AIPatron;
  onBeginConversation: () => void;
  isLoadingOpener?: boolean;
  onQuit?: () => void;
  onPause?: () => void;
}

export default function AiPatronCard({ patron, onBeginConversation, isLoadingOpener, onQuit, onPause }: AiPatronCardProps) {
  // Derive apparent stat bars (what bouncer can observe — not the full truth)
  const cooperationScore = patron.sobriety > 70 ? 65 : patron.sobriety > 40 ? 40 : 20;
  const nervousnessScore = 100 - Math.min(100, patron.sobriety + 10);

  return (
    <View style={styles.container}>
      {/* Quit / Pause row */}
      {(onQuit || onPause) && (
        <View style={styles.actionRow}>
          {onQuit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onQuit} activeOpacity={0.8}>
              <Text style={[styles.actionBtnText, { color: COLORS.neonPink }]}>✕ QUIT</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {onPause && (
            <TouchableOpacity style={styles.actionBtn} onPress={onPause} activeOpacity={0.8}>
              <Text style={[styles.actionBtnText, { color: COLORS.neonBlue }]}>⏸ PAUSE</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Portrait + name */}
      <View style={styles.header}>
        <Text style={styles.portrait}>{patron.emoji}</Text>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{patron.name}</Text>
          <Text style={styles.gender}>{patron.gender} · {patron.voiceDesc}</Text>
        </View>
      </View>

      {/* Visible description */}
      <View style={styles.descBox}>
        <Text style={styles.descLabel}>BOUNCER'S OBSERVATION</Text>
        <Text style={styles.descText}>{patron.visibleInfo}</Text>
      </View>

      {/* Stat bars */}
      <View style={styles.statsBlock}>
        <StatBar label="APPARENT SOBRIETY" value={patron.sobriety} />
        <StatBar label="COOPERATION" value={cooperationScore} color={COLORS.neonBlue} />
        <StatBar label="NERVOUSNESS" value={nervousnessScore} color={COLORS.neonOrange} />
      </View>

      {/* ID status */}
      <View style={[styles.idBadge, !patron.hasID && styles.idBadgeMissing]}>
        <Text style={styles.idBadgeText}>
          {patron.hasID ? '🪪  Has ID on them' : '⚠️  No ID — talk or walk'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.proceedBtn, isLoadingOpener && styles.proceedBtnLoading]}
        onPress={onBeginConversation}
        disabled={isLoadingOpener}
        activeOpacity={0.8}
      >
        <Text style={styles.proceedBtnText}>
          {isLoadingOpener ? '💬  Getting opening line...' : '💬  BEGIN ASSESSMENT'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingHorizontal: LAYOUT.spacing.lg,
    paddingTop: LAYOUT.spacing.lg, gap: LAYOUT.spacing.lg,
  },
  header: {
    flexDirection: 'row', gap: LAYOUT.spacing.lg,
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface, borderRadius: 16,
    padding: LAYOUT.spacing.lg,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  portrait: { fontSize: 56 },
  nameBlock: { flex: 1, gap: 4 },
  name: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.xxl, fontWeight: '900' },
  gender: { color: COLORS.textDim, fontSize: LAYOUT.fontSize.xs, fontStyle: 'italic' },
  descBox: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    padding: LAYOUT.spacing.md, gap: 6,
    borderWidth: 1, borderColor: COLORS.borderDim,
    borderLeftWidth: 3, borderLeftColor: COLORS.neonBlue,
  },
  descLabel: { color: COLORS.neonBlue, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  descText: { color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.md, lineHeight: 22 },
  statsBlock: { gap: LAYOUT.spacing.sm },
  idBadge: {
    borderRadius: 8, paddingHorizontal: LAYOUT.spacing.md, paddingVertical: LAYOUT.spacing.sm,
    backgroundColor: 'rgba(0,180,255,0.1)', borderWidth: 1, borderColor: COLORS.neonBlue,
    alignSelf: 'flex-start',
  },
  idBadgeMissing: {
    backgroundColor: 'rgba(255,140,0,0.1)', borderColor: COLORS.neonOrange,
  },
  idBadgeText: { color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.sm, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: LAYOUT.spacing.xs },
  actionBtn: { padding: 6 },
  actionBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  proceedBtn: {
    backgroundColor: COLORS.neonPink, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: COLORS.neonPink, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 12,
  },
  proceedBtnLoading: { backgroundColor: COLORS.bgSurface, shadowOpacity: 0 },
  proceedBtnText: { color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.md, letterSpacing: 2 },
});
