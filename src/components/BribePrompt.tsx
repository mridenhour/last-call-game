import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { BribeOffer } from '../game/aiTypes';

interface BribePromptProps {
  visible: boolean;
  bribe: BribeOffer | null;
  balance: number;
  policeMeter: number;
  onAccept: () => void;
  onReject: () => void;
  onCounter: () => void;
}

export default function BribePrompt({
  visible, bribe, balance, policeMeter, onAccept, onReject, onCounter,
}: BribePromptProps) {
  if (!bribe) return null;
  const canAfford = true; // Patron is offering TO you
  const heatRisk = bribe.amount >= 50 ? 'HIGH' : 'MEDIUM';
  const heatColor = heatRisk === 'HIGH' ? COLORS.neonPink : COLORS.neonOrange;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>💵</Text>
          <Text style={styles.title}>BRIBE ATTEMPT</Text>
          <Text style={styles.quote}>"{bribe.patronText.slice(0, 120)}"</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>AMOUNT</Text>
              <Text style={[styles.infoValue, { color: COLORS.neonGreen }]}>${bribe.amount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>HEAT RISK</Text>
              <Text style={[styles.infoValue, { color: heatColor }]}>{heatRisk}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>POLICE METER</Text>
              <Text style={[styles.infoValue, { color: policeMeter > 60 ? COLORS.neonPink : COLORS.textSecondary }]}>
                {Math.round(policeMeter)}%
              </Text>
            </View>
          </View>

          <Text style={styles.warning}>
            {bribe.amount >= 50
              ? '⚠️ Large bribe — high bust risk if police meter is elevated.'
              : 'Small bribe — raises heat but manageable if meter is low.'}
          </Text>

          <View style={styles.btnCol}>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
              <Text style={styles.acceptBtnText}>💰  TAKE THE MONEY  (+${bribe.amount})</Text>
            </TouchableOpacity>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.counterBtn} onPress={onCounter} activeOpacity={0.8}>
                <Text style={styles.counterBtnText}>🤝  COUNTER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={onReject} activeOpacity={0.8}>
                <Text style={styles.rejectBtnText}>✗  REFUSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center',
    padding: LAYOUT.spacing.lg,
  },
  modal: {
    width: '100%', backgroundColor: COLORS.bgCard,
    borderRadius: LAYOUT.borderRadiusLarge, padding: LAYOUT.spacing.xl,
    gap: LAYOUT.spacing.md, borderWidth: 1,
    borderColor: '#FFD700',
  },
  icon: { fontSize: 40, textAlign: 'center' },
  title: {
    color: '#FFD700', fontSize: LAYOUT.fontSize.xl,
    fontWeight: '900', letterSpacing: 2, textAlign: 'center',
  },
  quote: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.sm,
    fontStyle: 'italic', textAlign: 'center', lineHeight: 20,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center', gap: 4 },
  infoLabel: { color: COLORS.textDim, fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  infoValue: { fontSize: LAYOUT.fontSize.lg, fontWeight: '800' },
  warning: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.xs,
    textAlign: 'center', lineHeight: 16,
  },
  btnCol: { gap: LAYOUT.spacing.sm },
  acceptBtn: {
    backgroundColor: '#FFD700', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  acceptBtnText: { color: '#000', fontWeight: '900', fontSize: LAYOUT.fontSize.md, letterSpacing: 1 },
  btnRow: { flexDirection: 'row', gap: LAYOUT.spacing.sm },
  counterBtn: {
    flex: 1, backgroundColor: COLORS.bgSurface,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.neonOrange,
  },
  counterBtnText: { color: COLORS.neonOrange, fontWeight: '800', fontSize: LAYOUT.fontSize.sm },
  rejectBtn: {
    flex: 1, backgroundColor: COLORS.bgSurface,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  rejectBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: LAYOUT.fontSize.sm },
});
