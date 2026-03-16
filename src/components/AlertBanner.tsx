import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

interface AlertBannerProps {
  message: string;
  type: 'approve' | 'reject' | 'warning' | 'police' | 'money';
  moneyChange?: number;
  visible: boolean;
}

export default function AlertBanner({ message, type, moneyChange, visible }: AlertBannerProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true, tension: 100 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 100 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const bgColor = {
    approve: COLORS.neonGreen,
    reject: COLORS.neonPink,
    warning: COLORS.neonOrange,
    police: COLORS.neonBlue,
    money: moneyChange && moneyChange >= 0 ? COLORS.neonGreen : COLORS.neonPink,
  }[type];

  return (
    <Animated.View style={[
      styles.banner,
      { backgroundColor: bgColor, opacity, transform: [{ translateY }] },
    ]}>
      <Text style={styles.text}>{message}</Text>
      {moneyChange !== undefined && moneyChange !== 0 && (
        <Text style={styles.money}>
          {moneyChange > 0 ? `+$${moneyChange}` : `-$${Math.abs(moneyChange)}`}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 10,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    marginHorizontal: LAYOUT.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#000000',
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  money: {
    color: '#000000',
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '900',
  },
});
