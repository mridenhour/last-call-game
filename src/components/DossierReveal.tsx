import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { AIPatron, BouncerPersonality, PERSONALITY_COLORS } from '../game/aiTypes';
import { formatMoney } from '../game/scoring';
import StatBar from './StatBar';

interface DossierRevealProps {
  patron: AIPatron;
  playerDecision: 'letIn' | 'reject';
  personality: BouncerPersonality;
  scoreChange: number;
  balanceChange: number;
  onContinue: () => void;
  willFight: boolean;
}

export default function DossierReveal({
  patron, playerDecision, personality,
  scoreChange, balanceChange, onContinue, willFight,
}: DossierRevealProps) {
  const correct = playerDecision === patron.correctDecision;
  const decisionColor = correct ? COLORS.neonGreen : COLORS.neonPink;
  const personalityColor = PERSONALITY_COLORS[personality];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={correct ? ['#001A00', '#0A0A0F'] : ['#1A0000', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.portrait}>{patron.emoji}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.patronName}>{patron.name}</Text>
            <View style={[styles.verdictBadge, { borderColor: decisionColor }]}>
              <Text style={[styles.verdictText, { color: decisionColor }]}>
                {correct ? '✅ CORRECT CALL' : '❌ WRONG CALL'}
              </Text>
            </View>
          </View>
          <View style={styles.scoreCol}>
            <Text style={[styles.scoreChange, { color: scoreChange >= 0 ? COLORS.neonYellow : COLORS.neonPink }]}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange}
            </Text>
            <Text style={styles.scoreLabel}>PTS</Text>
          </View>
        </View>

        {/* Hidden Truth — the reveal */}
        <View style={[styles.revealBox, { borderColor: decisionColor }]}>
          <Text style={styles.revealLabel}>HIDDEN TRUTH</Text>
          <Text style={styles.revealText}>{patron.hiddenTruth}</Text>
        </View>

        {/* Backstory */}
        <Section title="BACKSTORY" color={COLORS.neonPurple}>
          <Text style={styles.sectionText}>{patron.backstory}</Text>
        </Section>

        {/* Clinical profile */}
        <Section title="CLINICAL PROFILE" color={COLORS.neonBlue}>
          <StatBar label="SOBRIETY" value={patron.sobriety} />
          <View style={styles.traitsRow}>
            {patron.traits.map((t, i) => (
              <View key={i} style={styles.traitChip}>
                <Text style={styles.traitText}>{t}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="DARK TRIAD ANALYSIS" color={COLORS.neonPink}>
          <Text style={styles.sectionText}>{patron.darkTriad}</Text>
        </Section>

        <Section title="DEFENSE MECHANISMS" color={COLORS.neonOrange}>
          <Text style={styles.sectionText}>{patron.defenses}</Text>
        </Section>

        <Section title="ATTACHMENT STYLE" color={COLORS.neonGreen}>
          <Text style={styles.sectionText}>{patron.attachment}</Text>
        </Section>

        <Section title="MANIPULATION TACTICS" color={COLORS.neonPurple}>
          <Text style={styles.sectionText}>{patron.manipulation}</Text>
        </Section>

        <Section title="TRIGGER POINTS" color={COLORS.neonYellow}>
          <Text style={styles.sectionText}>{patron.triggerPoints}</Text>
        </Section>

        {/* All 5 tells */}
        <Section title="BEHAVIORAL TELLS" color={COLORS.neonBlue}>
          {patron.tells.map((tell, i) => (
            <View key={i} style={styles.tellRow}>
              <Text style={styles.tellNumber}>{i + 1}</Text>
              <Text style={styles.tellText}>{tell}</Text>
            </View>
          ))}
        </Section>

        {/* Personality impact */}
        <Section title="YOUR BOUNCER VIBE" color={personalityColor}>
          <Text style={[styles.personalityLabel, { color: personalityColor }]}>{personality}</Text>
          <Text style={styles.sectionText}>
            {getPersonalityFeedback(personality, patron)}
          </Text>
        </Section>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: willFight ? COLORS.neonPink : COLORS.neonGreen }]}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, { color: willFight ? '#FFF' : '#000' }]}>
            {willFight ? '👊  FIGHT MODE — EJECT THEM' : '→  NEXT PATRON'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={[sectionStyles.container, { borderLeftColor: color }]}>
      <Text style={[sectionStyles.title, { color }]}>{title}</Text>
      {children}
    </View>
  );
}

function getPersonalityFeedback(personality: BouncerPersonality, patron: AIPatron): string {
  const low = patron.sobriety < 40;
  switch (personality) {
    case 'Tough':
      return low
        ? 'Your directness may have overwhelmed someone already struggling to keep it together.'
        : 'A firm presence tends to expose cracks in deception quickly. Well-suited for this one.';
    case 'Sarcastic':
      return 'Wit can disarm — or inflame. Depends how close you cut to the truth.';
    case 'By-the-Book':
      return 'Procedural firmness is hard to manipulate. But emotional manipulation flies right under your radar.';
    case 'Empathetic':
      return patron.manipulation.toLowerCase().includes('empathy') || patron.manipulation.toLowerCase().includes('sob')
        ? '⚠️ Your warmth was exactly what they were fishing for.'
        : 'Warmth builds trust and gets more truth out — when the patron isn\'t weaponizing it.';
  }
}

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard, borderRadius: 10,
    padding: LAYOUT.spacing.md, gap: LAYOUT.spacing.sm,
    borderWidth: 1, borderColor: COLORS.borderDim,
    borderLeftWidth: 3,
  },
  title: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    padding: LAYOUT.spacing.lg, gap: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.xxl,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: LAYOUT.spacing.md,
  },
  portrait: { fontSize: 48 },
  headerInfo: { flex: 1, gap: 6 },
  patronName: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.xl, fontWeight: '800' },
  verdictBadge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  verdictText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  scoreCol: { alignItems: 'center' },
  scoreChange: { fontSize: LAYOUT.fontSize.xxl, fontWeight: '900' },
  scoreLabel: { color: COLORS.textDim, fontSize: 9, letterSpacing: 1.5 },
  revealBox: {
    backgroundColor: COLORS.bgSurface, borderRadius: 12,
    padding: LAYOUT.spacing.lg, gap: 8,
    borderWidth: 2,
  },
  revealLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  revealText: { color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md, lineHeight: 24, fontWeight: '600' },
  sectionText: { color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.sm, lineHeight: 20 },
  traitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  traitChip: {
    backgroundColor: COLORS.bgElevated, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  traitText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },
  tellRow: {
    flexDirection: 'row', gap: LAYOUT.spacing.sm, alignItems: 'flex-start',
  },
  tellNumber: {
    color: COLORS.neonBlue, fontWeight: '800', fontSize: LAYOUT.fontSize.sm,
    width: 16,
  },
  tellText: { color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.sm, lineHeight: 20, flex: 1 },
  personalityLabel: { fontSize: LAYOUT.fontSize.lg, fontWeight: '800', letterSpacing: 2 },
  continueBtn: {
    borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: LAYOUT.spacing.md,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  continueBtnText: { fontWeight: '900', fontSize: LAYOUT.fontSize.lg, letterSpacing: 2 },
});
