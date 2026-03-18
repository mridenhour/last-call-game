import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

interface BarCapacityProps {
  patronsLetIn: number;
  capacity: number;
}

const SILHOUETTE_SIZE = 14;
const MAX_VISIBLE = 40; // cap displayed silhouettes for perf

function PersonSilhouette({ color }: { color: string }) {
  return (
    <Svg width={SILHOUETTE_SIZE} height={SILHOUETTE_SIZE * 2} viewBox="0 0 14 28">
      {/* Head */}
      <Circle cx={7} cy={4} r={3.5} fill={color} />
      {/* Body */}
      <Rect x={3} y={9} width={8} height={9} rx={2} fill={color} />
      {/* Legs */}
      <Rect x={3} y={19} width={3} height={7} rx={1.5} fill={color} />
      <Rect x={8} y={19} width={3} height={7} rx={1.5} fill={color} />
    </Svg>
  );
}

export default function BarCapacity({ patronsLetIn, capacity }: BarCapacityProps) {
  const pct = patronsLetIn / capacity;
  const isNearFull = pct >= 0.8;
  const isOverCapacity = patronsLetIn > capacity;

  const accentColor = isOverCapacity
    ? COLORS.neonPink
    : isNearFull
    ? COLORS.neonOrange
    : COLORS.neonGreen;

  // How many silhouettes to show (cap at MAX_VISIBLE)
  const displayed = Math.min(patronsLetIn, MAX_VISIBLE);
  const silhouettes = Array.from({ length: Math.min(capacity, MAX_VISIBLE) });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: accentColor }]}>BAR CAPACITY</Text>
        <Text style={[styles.counter, { color: accentColor }]}>
          {patronsLetIn}/{capacity}
          {isOverCapacity ? ' ⚠ OVER' : ''}
        </Text>
      </View>

      {/* Silhouette grid */}
      <View style={styles.grid}>
        {silhouettes.map((_, i) => {
          const filled = i < displayed;
          const isOver = i >= capacity - (patronsLetIn - capacity > 0 ? patronsLetIn - capacity : 0);
          const color = filled
            ? (isOverCapacity && i >= capacity ? COLORS.neonPink : accentColor)
            : 'rgba(255,255,255,0.06)';
          return (
            <View key={i} style={styles.silhouette}>
              <PersonSilhouette color={color} />
            </View>
          );
        })}
        {/* Overflow "+N" if more than MAX_VISIBLE */}
        {patronsLetIn > MAX_VISIBLE && (
          <View style={styles.overflow}>
            <Text style={[styles.overflowText, { color: accentColor }]}>+{patronsLetIn - MAX_VISIBLE}</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View style={[
          styles.barFill,
          {
            width: `${Math.min(100, pct * 100)}%` as any,
            backgroundColor: accentColor,
          },
        ]} />
      </View>

      {isOverCapacity && (
        <Text style={styles.warningText}>Police heat increasing</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    padding: LAYOUT.spacing.md,
    borderWidth: 1, borderColor: COLORS.borderDim,
    gap: LAYOUT.spacing.sm,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  label: {
    fontSize: 9, fontWeight: '800', letterSpacing: 2,
  },
  counter: {
    fontSize: LAYOUT.fontSize.sm, fontWeight: '900',
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 2,
  },
  silhouette: {
    width: SILHOUETTE_SIZE + 2,
    alignItems: 'center',
  },
  overflow: {
    width: SILHOUETTE_SIZE + 2,
    height: SILHOUETTE_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 10, fontWeight: '800',
  },
  barTrack: {
    height: 4, backgroundColor: COLORS.borderDim,
    borderRadius: 2, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 2,
  },
  warningText: {
    color: COLORS.neonPink, fontSize: 9,
    fontWeight: '700', letterSpacing: 1, textAlign: 'center',
  },
});
