import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated
} from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { Patron } from '../game/types';
import { getIdAgeDisplay, isExpiredId } from '../game/patrons';

interface IDCardProps {
  patron: Patron;
  onInspect?: () => void;   // open trivia deep-check
  revealed?: boolean;        // show all flags (post-decision)
}

export default function IDCard({ patron, onInspect, revealed = false }: IDCardProps) {
  const [flipped, setFlipped] = useState(false);
  const idAge = getIdAgeDisplay(patron);
  const expired = isExpiredId(patron);

  const birthYearDisplay = patron.idBirthYear;
  const dobDisplay = `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${birthYearDisplay}`;

  // Expiry
  const expiryExpired = expired;

  return (
    <View style={styles.card}>
      {/* Card header stripe */}
      <View style={styles.headerStripe}>
        <Text style={styles.headerText}>DRIVER LICENSE</Text>
        <Text style={styles.stateAbbrev}>{patron.idState.abbreviation}</Text>
      </View>

      {/* Main content */}
      <View style={styles.cardBody}>
        {/* Portrait */}
        <View style={styles.portraitBox}>
          <Text style={styles.portrait}>{patron.portrait}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <Text style={styles.fieldValue}>{patron.name.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>DOB</Text>
            <Text style={[
              styles.fieldValue,
              revealed && patron.fakeType === 'wrong_birth_year' && styles.flaggedValue,
            ]}>
              {dobDisplay}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>AGE</Text>
            <Text style={[
              styles.fieldValue,
              idAge < 21 ? styles.underageValue : styles.validAgeValue,
            ]}>
              {idAge}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>STATE</Text>
            <Text style={styles.fieldValue}>{patron.idState.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>EXPIRES</Text>
            <Text style={[
              styles.fieldValue,
              expiryExpired && styles.expiredValue,
            ]}>
              {patron.idExpiry}
              {expiryExpired ? ' ⚠️' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Capital line */}
      <TouchableOpacity style={styles.capitalRow} onPress={onInspect} activeOpacity={0.7}>
        <Text style={styles.capitalLabel}>STATE CAPITAL: </Text>
        <Text style={[
          styles.capitalValue,
          revealed && !patron.idCapitalIsCorrect && styles.flaggedValue,
        ]}>
          {patron.idCapitalIsCorrect
            ? patron.idState.capital
            : wrongCapital(patron.idState.abbreviation)}
        </Text>
        {onInspect && (
          <Text style={styles.inspectHint}>  [VERIFY →]</Text>
        )}
      </TouchableOpacity>

      {/* Hologram / security strip */}
      <View style={styles.securityStrip}>
        {[...Array(12)].map((_, i) => (
          <View key={i} style={[styles.securityDot, { opacity: 0.3 + (i % 3) * 0.2 }]} />
        ))}
      </View>

      {/* Revealed overlay */}
      {revealed && !patron.idIsValid && (
        <View style={styles.fakeStamp}>
          <Text style={styles.fakeStampText}>FAKE</Text>
        </View>
      )}
      {revealed && patron.idIsValid && (
        <View style={styles.validStamp}>
          <Text style={styles.validStampText}>VALID</Text>
        </View>
      )}
    </View>
  );
}

function wrongCapital(abbrev: string): string {
  const wrong: Record<string, string> = {
    CA: 'Los Angeles', TX: 'Houston', FL: 'Miami', NY: 'New York City',
    IL: 'Chicago', OH: 'Cleveland', GA: 'Savannah', MI: 'Detroit',
    AZ: 'Tucson', CO: 'Colorado Springs', WA: 'Seattle', NV: 'Las Vegas',
    OR: 'Portland', TN: 'Memphis', MA: 'Cambridge',
  };
  return wrong[abbrev] ?? 'Unknown';
}

const styles = StyleSheet.create({
  card: {
    width: LAYOUT.idCardWidth,
    backgroundColor: COLORS.idBg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
  },
  headerStripe: {
    backgroundColor: COLORS.idAccent,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  stateAbbrev: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cardBody: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  portraitBox: {
    width: 70,
    height: 90,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.idBorder,
  },
  portrait: {
    fontSize: 40,
  },
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  fieldLabel: {
    color: COLORS.idAccent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    width: 50,
  },
  fieldValue: {
    color: COLORS.idText,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  underageValue: {
    color: COLORS.neonPink,
    fontWeight: '800',
  },
  validAgeValue: {
    color: '#006600',
    fontWeight: '700',
  },
  expiredValue: {
    color: COLORS.neonPink,
    fontWeight: '800',
  },
  flaggedValue: {
    color: COLORS.neonPink,
    fontWeight: '800',
  },
  capitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  capitalLabel: {
    color: COLORS.idAccent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  capitalValue: {
    color: COLORS.idText,
    fontSize: 10,
    fontWeight: '600',
  },
  inspectHint: {
    color: COLORS.idAccent,
    fontSize: 9,
    fontWeight: '700',
  },
  securityStrip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
  },
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.idAccent,
  },
  fakeStamp: {
    position: 'absolute',
    top: 20,
    right: 12,
    borderWidth: 3,
    borderColor: COLORS.neonPink,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-15deg' }],
  },
  fakeStampText: {
    color: COLORS.neonPink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
  },
  validStamp: {
    position: 'absolute',
    top: 20,
    right: 12,
    borderWidth: 3,
    borderColor: COLORS.neonGreen,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-15deg' }],
  },
  validStampText: {
    color: COLORS.neonGreen,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
