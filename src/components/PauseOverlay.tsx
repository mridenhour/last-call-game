import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

interface PauseOverlayProps {
  visible: boolean;
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({ visible, onResume, onQuit }: PauseOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.pauseIcon}>⏸</Text>
          <Text style={styles.title}>PAUSED</Text>
          <TouchableOpacity style={styles.resumeBtn} onPress={onResume} activeOpacity={0.8}>
            <Text style={styles.resumeText}>▶  RESUME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quitBtn} onPress={onQuit} activeOpacity={0.8}>
            <Text style={styles.quitText}>QUIT SHIFT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.bgSurface, borderRadius: 20,
    padding: LAYOUT.spacing.xl, width: '72%',
    alignItems: 'center', gap: LAYOUT.spacing.md,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  pauseIcon: { fontSize: 48 },
  title: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.xxl,
    fontWeight: '900', letterSpacing: 6,
  },
  resumeBtn: {
    backgroundColor: COLORS.neonGreen, borderRadius: 14,
    paddingVertical: 16, width: '100%', alignItems: 'center',
    shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 10,
  },
  resumeText: { color: '#000', fontWeight: '900', fontSize: LAYOUT.fontSize.md, letterSpacing: 2 },
  quitBtn: {
    backgroundColor: COLORS.bgCard, borderRadius: 14,
    paddingVertical: 14, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.neonPink,
  },
  quitText: { color: COLORS.neonPink, fontWeight: '700', fontSize: LAYOUT.fontSize.sm, letterSpacing: 2 },
});
