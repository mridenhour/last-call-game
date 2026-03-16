import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { BAR_CONFIGS, LOCATION_ORDER } from '../game/locations';
import { BarLocation } from '../game/types';

interface MainMenuScreenProps {
  onStartGame: (location: BarLocation) => void;
  onShowScores: () => void;
  highScore: number;
}

export default function MainMenuScreen({ onStartGame, onShowScores, highScore }: MainMenuScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0F', '#12001A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Neon sign header */}
      <View style={styles.header}>
        <Text style={styles.neonSubtitle}>◆ LAST ◆</Text>
        <Text style={styles.neonTitle}>CALL</Text>
        <Text style={styles.neonSubtitle}>◆ BOUNCER SIM ◆</Text>

        {/* Decorative bar */}
        <View style={styles.neonBar} />

        <Text style={styles.tagline}>Check IDs. Keep the peace. Don't get busted.</Text>
      </View>

      {highScore > 0 && (
        <TouchableOpacity onPress={onShowScores} style={styles.highScoreBadge}>
          <Text style={styles.highScoreLabel}>🏆 HIGH SCORE</Text>
          <Text style={styles.highScoreValue}>{highScore.toLocaleString()}</Text>
        </TouchableOpacity>
      )}

      {/* Location selector */}
      <ScrollView
        style={styles.locationList}
        contentContainerStyle={styles.locationListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>SELECT YOUR BAR</Text>

        {LOCATION_ORDER.map((locId, idx) => {
          const config = BAR_CONFIGS[locId];
          const isLocked = config.minBalance > 0; // For now show all, locked ones grayed

          return (
            <TouchableOpacity
              key={locId}
              style={[styles.locationCard, idx === 0 && styles.locationCardActive]}
              onPress={() => onStartGame(locId as BarLocation)}
              activeOpacity={0.8}
            >
              <View style={styles.locationCardInner}>
                <View style={styles.locationMeta}>
                  <Text style={styles.locationNumber}>0{idx + 1}</Text>
                  <View>
                    <Text style={styles.locationCardName}>{config.name}</Text>
                    <Text style={styles.locationCardSub}>{config.subtitle}</Text>
                  </View>
                </View>

                <View style={styles.locationStats}>
                  <View style={styles.locationStat}>
                    <Text style={styles.locationStatLabel}>PATRONS</Text>
                    <Text style={styles.locationStatValue}>{config.patronsPerNight}/night</Text>
                  </View>
                  <View style={styles.locationStat}>
                    <Text style={styles.locationStatLabel}>HEAT</Text>
                    <Text style={[
                      styles.locationStatValue,
                      { color: config.policeAggression > 0.7 ? COLORS.neonPink : COLORS.neonGreen }
                    ]}>
                      {config.policeAggression >= 0.8 ? '🔴 HIGH' :
                       config.policeAggression >= 0.5 ? '🟡 MED' : '🟢 LOW'}
                    </Text>
                  </View>
                  <View style={styles.locationStat}>
                    <Text style={styles.locationStatLabel}>ENTRY</Text>
                    <Text style={styles.locationStatValue}>${config.entryFee}+</Text>
                  </View>
                </View>

                <Text style={styles.locationDesc}>{config.description}</Text>
              </View>
              <View style={styles.locationArrow}>
                <Text style={styles.locationArrowText}>▶</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.scoresBtn} onPress={onShowScores} activeOpacity={0.8}>
          <Text style={styles.scoresBtnText}>🏆  HIGH SCORES</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Share via Expo Go  ·  Built with ❤️</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: LAYOUT.spacing.xl,
    paddingHorizontal: LAYOUT.spacing.lg,
  },
  neonSubtitle: {
    color: COLORS.neonPink,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 6,
  },
  neonTitle: {
    color: COLORS.textPrimary,
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 12,
    textShadowColor: COLORS.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    lineHeight: 80,
  },
  neonBar: {
    height: 2,
    width: 200,
    backgroundColor: COLORS.neonPink,
    marginVertical: LAYOUT.spacing.md,
    shadowColor: COLORS.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
    alignSelf: 'center',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 20,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.neonYellow,
  },
  highScoreLabel: {
    color: COLORS.neonYellow,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  highScoreValue: {
    color: COLORS.neonYellow,
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '900',
  },
  locationList: {
    flex: 1,
  },
  locationListContent: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.xxl,
    gap: LAYOUT.spacing.md,
  },
  sectionLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  locationCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: LAYOUT.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.borderDim,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  locationCardActive: {
    borderColor: COLORS.neonPink,
    shadowColor: COLORS.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  locationCardInner: {
    flex: 1,
    padding: LAYOUT.spacing.md,
    gap: LAYOUT.spacing.sm,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  locationNumber: {
    color: COLORS.neonPink,
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: '900',
    opacity: 0.4,
    width: 36,
  },
  locationCardName: {
    color: COLORS.textPrimary,
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '800',
  },
  locationCardSub: {
    color: COLORS.neonPink,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  locationStats: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
  },
  locationStat: {
    flex: 1,
  },
  locationStatLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  locationStatValue: {
    color: COLORS.textSecondary,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '600',
  },
  locationDesc: {
    color: COLORS.textDim,
    fontSize: LAYOUT.fontSize.xs,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  locationArrow: {
    paddingRight: LAYOUT.spacing.md,
  },
  locationArrowText: {
    color: COLORS.neonPink,
    fontSize: 18,
  },
  scoresBtn: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: LAYOUT.borderRadius,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.neonYellow,
  },
  scoresBtnText: {
    color: COLORS.neonYellow,
    fontWeight: '800',
    fontSize: LAYOUT.fontSize.md,
    letterSpacing: 2,
  },
  footer: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: LAYOUT.spacing.md,
  },
});
