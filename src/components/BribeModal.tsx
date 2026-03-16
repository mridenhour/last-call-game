import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { calcBribeCost } from '../game/police';
import { GameState } from '../game/types';
import { formatMoney } from '../game/scoring';

interface BribeModalProps {
  visible: boolean;
  state: GameState;
  onPay: () => void;
  onDecline: () => void;
}

export default function BribeModal({ visible, state, onPay, onDecline }: BribeModalProps) {
  const cost = calcBribeCost(state.locationConfig, state.policeMeter);
  const canAfford = state.balance >= cost;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>👮</Text>
          <Text style={styles.title}>OFFICER WANTS A WORD</Text>

          <Text style={styles.body}>
            A plain-clothes cop is sniffing around. The heat is at{' '}
            <Text style={styles.meterVal}>{Math.round(state.policeMeter)}%</Text>.
          </Text>

          <Text style={styles.body}>
            Slip him{' '}
            <Text style={[styles.costVal, !canAfford && styles.cantAfford]}>
              {formatMoney(cost)}
            </Text>{' '}
            and he'll look the other way tonight.
          </Text>

          {!canAfford && (
            <Text style={styles.noFunds}>
              ⚠️ You don't have enough cash.
            </Text>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.declineBtn]}
              onPress={onDecline}
              activeOpacity={0.8}
            >
              <Text style={styles.declineBtnText}>REFUSE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.payBtn, !canAfford && styles.disabledBtn]}
              onPress={canAfford ? onPay : undefined}
              activeOpacity={canAfford ? 0.8 : 1}
            >
              <Text style={[styles.payBtnText, !canAfford && styles.disabledText]}>
                PAY {formatMoney(cost)}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Bribing reduces your heat meter. Refusing keeps your cash but keeps the heat on.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.spacing.lg,
  },
  modal: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.bribe,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: COLORS.bribe,
    fontSize: LAYOUT.fontSize.xl,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: LAYOUT.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  meterVal: {
    color: COLORS.neonPink,
    fontWeight: '800',
  },
  costVal: {
    color: COLORS.bribe,
    fontWeight: '800',
  },
  cantAfford: {
    color: COLORS.textDim,
    textDecorationLine: 'line-through',
  },
  noFunds: {
    color: COLORS.neonPink,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    width: '100%',
    marginTop: LAYOUT.spacing.sm,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.borderDim,
  },
  declineBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: LAYOUT.fontSize.sm,
  },
  payBtn: {
    backgroundColor: COLORS.bribe,
  },
  payBtnText: {
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: LAYOUT.fontSize.sm,
  },
  disabledBtn: {
    backgroundColor: COLORS.borderDim,
  },
  disabledText: {
    color: COLORS.textDim,
  },
  disclaimer: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
