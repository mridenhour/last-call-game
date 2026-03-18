import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface StatBarProps {
  label: string;
  value: number;   // 0–100
  color?: string;
  compact?: boolean;
}

export default function StatBar({ label, value, color, compact = false }: StatBarProps) {
  const clamp = Math.max(0, Math.min(100, value));
  const barColor = color ?? (
    clamp > 66 ? COLORS.neonGreen :
    clamp > 33 ? COLORS.neonOrange :
    COLORS.neonPink
  );

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
        <Text style={[styles.value, { color: barColor }, compact && styles.labelCompact]}>
          {Math.round(clamp)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamp}%` as any, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 3 },
  compact: { gap: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#8888AA', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  labelCompact: { fontSize: 9 },
  value: { fontSize: 10, fontWeight: '800' },
  track: {
    height: 6, backgroundColor: '#2A2A44',
    borderRadius: 3, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});
