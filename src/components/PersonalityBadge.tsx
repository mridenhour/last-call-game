import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BouncerPersonality, PERSONALITY_COLORS, PERSONALITY_EMOJIS } from '../game/aiTypes';

interface PersonalityBadgeProps {
  personality: BouncerPersonality;
  showLabel?: boolean;
}

export default function PersonalityBadge({ personality, showLabel = true }: PersonalityBadgeProps) {
  const color = PERSONALITY_COLORS[personality];
  const emoji = PERSONALITY_EMOJIS[personality];

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      {showLabel && (
        <Text style={[styles.label, { color }]}>{personality.toUpperCase()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  emoji: { fontSize: 12 },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
});
