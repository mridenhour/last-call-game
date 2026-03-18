import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { GenerationState } from '../game/aiTypes';

interface GeneratingScreenProps {
  generation: GenerationState;
  onRetry?: () => void;
}

export default function GeneratingScreen({ generation, onRetry }: GeneratingScreenProps) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [generation.logs.length]);

  const isError = generation.status === 'error';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0F', '#0D000F', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      <Animated.Text style={[styles.icon, { opacity: pulse }]}>🚪</Animated.Text>
      <Text style={styles.title}>GENERATING PATRON</Text>
      <Text style={styles.subtitle}>Consulting psychological database...</Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[
          styles.progressFill,
          { width: `${(generation.logs.length / 8) * 100}%` as any },
        ]} />
      </View>

      <View style={styles.logBox}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
          {generation.logs.map((line, i) => (
            <Text key={i} style={[
              styles.logLine,
              isError && line.startsWith('ERROR') && styles.logError,
              i === generation.logs.length - 1 && !isError && styles.logActive,
            ]}>
              {line.startsWith('ERROR') ? '⚠ ' : '> '}{line}
            </Text>
          ))}
          {generation.status === 'loading' && (
            <Animated.Text style={[styles.logCursor, { opacity: pulse }]}>▌</Animated.Text>
          )}
        </ScrollView>
      </View>

      {isError && (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{generation.error}</Text>
          {onRetry && (
            <Text style={styles.retryBtn} onPress={onRetry}>↺  RETRY</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: LAYOUT.spacing.lg, paddingHorizontal: LAYOUT.spacing.xl,
  },
  icon: { fontSize: 56 },
  title: {
    color: COLORS.neonPink, fontSize: LAYOUT.fontSize.xl,
    fontWeight: '900', letterSpacing: 4,
  },
  subtitle: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm,
    letterSpacing: 1, marginTop: -LAYOUT.spacing.md,
  },
  logBox: {
    width: '100%', backgroundColor: COLORS.bgCard,
    borderRadius: 10, padding: LAYOUT.spacing.md,
    height: 200, borderWidth: 1, borderColor: COLORS.borderDim,
  },
  logLine: {
    color: COLORS.textDim, fontSize: 12,
    fontFamily: undefined, lineHeight: 22,
    letterSpacing: 0.5,
  },
  logActive: { color: COLORS.neonGreen },
  logError: { color: COLORS.neonPink },
  progressTrack: {
    width: '100%', height: 6, backgroundColor: COLORS.borderDim,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.neonPink,
    borderRadius: 3,
  },
  logCursor: { color: COLORS.neonGreen, fontSize: 14 },
  errorBlock: {
    width: '100%', alignItems: 'center', gap: LAYOUT.spacing.md,
  },
  errorText: {
    color: COLORS.neonPink, fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center', lineHeight: 20,
  },
  retryBtn: {
    color: COLORS.neonGreen, fontSize: LAYOUT.fontSize.md,
    fontWeight: '800', letterSpacing: 2,
    backgroundColor: COLORS.bgSurface, borderRadius: 10,
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.md,
    borderWidth: 1, borderColor: COLORS.neonGreen,
    overflow: 'hidden',
  },
});
