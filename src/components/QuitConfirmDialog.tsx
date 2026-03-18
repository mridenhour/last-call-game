import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

interface QuitConfirmDialogProps {
  visible: boolean;
  score: number;
  onResume: () => void;
  onQuit: () => void;
}

export default function QuitConfirmDialog({ visible, score, onResume, onQuit }: QuitConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>END YOUR SHIFT?</Text>
          <Text style={styles.body}>Your score will be saved.</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.resumeBtn} onPress={onResume} activeOpacity={0.8}>
              <Text style={styles.resumeText}>KEEP GOING</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitBtn} onPress={onQuit} activeOpacity={0.8}>
              <Text style={styles.quitText}>QUIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  dialog: {
    backgroundColor: COLORS.bgSurface, borderRadius: 18,
    padding: LAYOUT.spacing.xl, width: '80%',
    borderWidth: 1, borderColor: COLORS.borderDim,
    gap: LAYOUT.spacing.sm, alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.lg,
    fontWeight: '900', letterSpacing: 3,
  },
  body: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center',
  },
  score: {
    color: COLORS.neonYellow, fontSize: LAYOUT.fontSize.md,
    fontWeight: '700', marginBottom: LAYOUT.spacing.sm,
  },
  btnRow: { flexDirection: 'row', gap: LAYOUT.spacing.md, width: '100%' },
  resumeBtn: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  resumeText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: LAYOUT.fontSize.sm, letterSpacing: 1 },
  quitBtn: {
    flex: 1, backgroundColor: COLORS.neonPink, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  quitText: { color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.sm, letterSpacing: 2 },
});
