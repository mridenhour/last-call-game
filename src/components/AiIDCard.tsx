import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { AIPatron } from '../game/aiTypes';
import { generateIDData } from '../game/generateIDData';
import PatronIllustration from './PatronIllustration';

interface AiIDCardProps {
  patron: AIPatron;
  visible: boolean;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export default function AiIDCard({ patron, visible, onClose, onAskQuestion }: AiIDCardProps) {
  const id = useMemo(() => generateIDData(patron), [patron.name]);

  if (!patron.hasID) return null;

  function askAbout(field: string, question: string) {
    onAskQuestion(question);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>ID DOCUMENT</Text>
              <Text style={styles.sheetHint}>Tap any field to ask about it</Text>

              {/* The license card */}
              <View style={styles.card}>
                {/* Card header bar */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardState}>{id.state}</Text>
                  <Text style={styles.cardType}>DRIVER LICENSE</Text>
                </View>

                {/* Card body */}
                <View style={styles.cardBody}>
                  {/* Photo column */}
                  <View style={styles.photoCol}>
                    <View style={styles.photoFrame}>
                      <PatronIllustration patron={patron} size={64} />
                    </View>
                    <Text style={styles.idNumber} numberOfLines={1}>{id.idNumber}</Text>
                  </View>

                  {/* Fields column */}
                  <View style={styles.fieldsCol}>
                    <IDField
                      label="NAME"
                      value={id.name}
                      onPress={() => askAbout('name', `Your ID says your name is "${id.name}" — can you confirm that?`)}
                    />
                    <IDField
                      label="DOB"
                      value={id.dob}
                      onPress={() => askAbout('dob', `Your date of birth shows ${id.dob} — what year were you born?`)}
                    />
                    <IDField
                      label="ADDRESS"
                      value={id.address}
                      onPress={() => askAbout('address', `This address — ${id.address} — do you actually live there?`)}
                    />
                    <IDField
                      label="EXPIRES"
                      value={id.expiry}
                      onPress={() => askAbout('expiry', `Your ID expires ${id.expiry}. Is this your current ID?`)}
                    />
                    <IDField
                      label="CLASS"
                      value="C  REAL ID"
                      onPress={() => askAbout('class', `You have a REAL ID — when did you get this updated?`)}
                    />
                  </View>
                </View>

                {/* Card footer stripe */}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    {id.state} DEPT OF MOTOR VEHICLES
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeBtnText}>DONE CHECKING</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function IDField({
  label, value, onPress,
}: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.field} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={2}>{value}</Text>
      <Text style={styles.fieldTapHint}>tap to ask ›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgSurface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.xxl,
    gap: LAYOUT.spacing.sm,
  },
  sheetTitle: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md,
    fontWeight: '900', letterSpacing: 3, textAlign: 'center',
  },
  sheetHint: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.xs,
    textAlign: 'center', marginBottom: LAYOUT.spacing.sm,
  },

  // ── License card ─────────────────────────────────────────────────────────
  card: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 2, borderColor: COLORS.idBorder,
    backgroundColor: COLORS.idBg,
  },
  cardHeader: {
    backgroundColor: COLORS.idAccent,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md, paddingVertical: 8,
  },
  cardState: {
    color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3,
  },
  cardType: {
    color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 2,
  },
  cardBody: {
    flexDirection: 'row', padding: LAYOUT.spacing.md, gap: LAYOUT.spacing.md,
  },
  photoCol: {
    width: 72, alignItems: 'center', gap: 6,
  },
  photoFrame: {
    width: 70, height: 90,
    borderWidth: 1, borderColor: COLORS.idBorder,
    backgroundColor: '#F0EBE0', borderRadius: 4,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end',
  },
  idNumber: {
    color: COLORS.idAccent, fontSize: 8, fontWeight: '700',
    letterSpacing: 1, textAlign: 'center',
  },
  fieldsCol: { flex: 1, gap: 6 },

  field: {
    borderBottomWidth: 1, borderBottomColor: COLORS.idBorder,
    paddingBottom: 5,
  },
  fieldLabel: {
    color: COLORS.idAccent, fontSize: 8,
    fontWeight: '800', letterSpacing: 1.5,
  },
  fieldValue: {
    color: COLORS.idText, fontSize: 12,
    fontWeight: '600', lineHeight: 16,
  },
  fieldTapHint: {
    color: COLORS.idAccent, fontSize: 7,
    opacity: 0.6, textAlign: 'right', marginTop: 1,
  },

  cardFooter: {
    backgroundColor: COLORS.idAccent + '22',
    borderTopWidth: 1, borderTopColor: COLORS.idBorder,
    paddingHorizontal: LAYOUT.spacing.md, paddingVertical: 6,
    alignItems: 'center',
  },
  cardFooterText: {
    color: COLORS.idAccent, fontSize: 8,
    fontWeight: '700', letterSpacing: 2,
  },

  closeBtn: {
    backgroundColor: COLORS.neonBlue, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: LAYOUT.spacing.sm,
    shadowColor: COLORS.neonBlue, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  closeBtnText: {
    color: '#000', fontWeight: '900',
    fontSize: LAYOUT.fontSize.md, letterSpacing: 2,
  },
});
