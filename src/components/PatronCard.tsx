import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { Patron } from '../game/types';

interface PatronCardProps {
  patron: Patron;
  onShowID: () => void;
  onTalk?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  college_kid: 'College Kid',
  party_regular: 'Party Regular',
  professional: 'Professional',
  grungy: 'Grungy Guy',
  flirt: 'Flirt',
  sob_story: 'Sob Story',
  vip: 'VIP Guest',
  already_drunk: 'Already Drunk',
  troublemaker: 'Troublemaker',
  undercover_cop: 'Suspicious Figure',
};

const SPEND_LABEL: Record<string, { label: string; color: string }> = {
  college_kid:    { label: '💰 Low Spender',    color: COLORS.neonOrange },
  party_regular:  { label: '💰💰 Medium Spender', color: COLORS.neonYellow },
  professional:   { label: '💰💰💰 High Spender',  color: COLORS.neonGreen },
  grungy:         { label: '❌ No Spend',         color: COLORS.textDim },
  flirt:          { label: '💰 Low-Med Spender',  color: COLORS.neonOrange },
  sob_story:      { label: '💰 Low Spender',      color: COLORS.neonOrange },
  vip:            { label: '💎 VIP Spender',      color: COLORS.bribe },
  already_drunk:  { label: '⚠️ Liability',        color: COLORS.neonPink },
  troublemaker:   { label: '⚠️ Trouble Risk',     color: COLORS.neonPink },
  undercover_cop: { label: '❓ Unknown',          color: COLORS.textDim },
};

const COLORS_REF = COLORS as any;

export default function PatronCard({ patron, onShowID, onTalk }: PatronCardProps) {
  const spend = SPEND_LABEL[patron.type] ?? { label: 'Unknown', color: COLORS.textDim };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Portrait area */}
        <View style={styles.portraitSection}>
          <Text style={styles.portraitEmoji}>{patron.portrait}</Text>
          <View style={styles.portraitInfo}>
            <Text style={styles.patronType}>{TYPE_LABELS[patron.type] ?? patron.type}</Text>
            <Text style={[styles.spendLabel, { color: spend.color }]}>{spend.label}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{patron.description}</Text>

        {/* Emotion hint */}
        {patron.emotionalType !== 'none' && (
          <View style={styles.emotionHint}>
            <Text style={styles.emotionIcon}>
              {patron.emotionalType === 'flirt' ? '😏' :
               patron.emotionalType === 'guilt' ? '😤' :
               patron.emotionalType === 'sob_story' ? '😢' : '💵'}
            </Text>
            <Text style={styles.emotionText}>
              {patron.emotionalType === 'flirt' ? 'They\'re flirting with you' :
               patron.emotionalType === 'guilt' ? 'They have a story' :
               patron.emotionalType === 'sob_story' ? 'They look upset' :
               'They\'re offering cash'}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.showIDBtn} onPress={onShowID} activeOpacity={0.8}>
            <Text style={styles.showIDBtnText}>🪪  CHECK ID</Text>
          </TouchableOpacity>

          {patron.emotionalType !== 'none' && onTalk && (
            <TouchableOpacity style={styles.talkBtn} onPress={onTalk} activeOpacity={0.8}>
              <Text style={styles.talkBtnText}>💬  HEAR THEM OUT</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.md,
  },
  card: {
    width: LAYOUT.cardWidth,
    backgroundColor: COLORS.bgSurface,
    borderRadius: LAYOUT.borderRadiusLarge,
    padding: LAYOUT.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDim,
    shadowColor: COLORS.neonPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: LAYOUT.spacing.md,
  },
  portraitSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  portraitEmoji: {
    fontSize: 56,
    width: 72,
    textAlign: 'center',
  },
  portraitInfo: {
    flex: 1,
    gap: 4,
  },
  patronType: {
    color: COLORS.textPrimary,
    fontSize: LAYOUT.fontSize.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spendLabel: {
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '600',
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: LAYOUT.fontSize.md,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  emotionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 8,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.neonOrange,
  },
  emotionIcon: {
    fontSize: 20,
  },
  emotionText: {
    color: COLORS.neonOrange,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actions: {
    gap: LAYOUT.spacing.sm,
    marginTop: LAYOUT.spacing.xs,
  },
  showIDBtn: {
    backgroundColor: COLORS.neonBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  showIDBtnText: {
    color: '#FFFFFF',
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '800',
    letterSpacing: 2,
  },
  talkBtn: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neonOrange,
  },
  talkBtnText: {
    color: COLORS.neonOrange,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
