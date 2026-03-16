import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, StatusBar, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { GameState } from '../game/types';
import { formatMoney } from '../game/scoring';
import { getPoliceWarningMessage, calcBribeCost } from '../game/police';
import HUD from '../components/HUD';
import PatronCard from '../components/PatronCard';
import IDCard from '../components/IDCard';
import FightMinigame from '../components/FightMinigame';
import BribeModal from '../components/BribeModal';
import AlertBanner from '../components/AlertBanner';

interface GameScreenProps {
  state: GameState;
  onBeginNight: () => void;
  onNextPatron: () => void;
  onViewID: () => void;
  onOpenEmotional: () => void;
  onOpenTrivia: () => void;
  onCloseTrivia: () => void;
  onDecision: (approved: boolean) => void;
  onDismissPolice: () => void;
  onOpenBribe: () => void;
  onPayBribe: () => void;
  onDeclineBribe: () => void;
  onHandleDisturbance: (eject: boolean) => void;
  onFightMove: (move: import('../game/types').FightMove) => void;
  onEndNight: () => void;
}

export default function GameScreen({
  state,
  onBeginNight,
  onNextPatron,
  onViewID,
  onOpenEmotional,
  onOpenTrivia,
  onCloseTrivia,
  onDecision,
  onDismissPolice,
  onOpenBribe,
  onPayBribe,
  onDeclineBribe,
  onHandleDisturbance,
  onFightMove,
  onEndNight,
}: GameScreenProps) {
  const {
    phase, currentPatron, fightPatron, fightHP, fightRounds,
    showApproveFlash, showRejectFlash, lastMoneyChange, lastDecisionCorrect,
    pendingDisturbances, policeMeter, balance, score, locationConfig,
    patronQueue, patronsProcessed
  } = state;

  // Flash overlay animation
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState(COLORS.approve);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');
  const [bannerType, setBannerType] = useState<'approve' | 'reject' | 'warning' | 'police' | 'money'>('approve');
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showApproveFlash || showRejectFlash) {
      const color = showApproveFlash ? COLORS.neonGreen : COLORS.neonPink;
      setFlashColor(color);
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.25, duration: 80, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Show banner
      const msg = showApproveFlash
        ? lastDecisionCorrect ? '✅ APPROVED — Correct call!' : '⚠️ APPROVED — Risky call'
        : lastDecisionCorrect ? '❌ REJECTED — Good catch!' : '❌ REJECTED — Turned away valid ID';
      showBanner(msg, showApproveFlash ? 'approve' : 'reject', lastMoneyChange);
    }
  }, [showApproveFlash, showRejectFlash]);

  function showBanner(msg: string, type: typeof bannerType, money?: number) {
    setBannerMsg(msg);
    setBannerType(type);
    setBannerVisible(true);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBannerVisible(false), 2000);
  }

  // Auto-advance from 'waiting' to nextPatron after brief pause
  useEffect(() => {
    if (phase === 'waiting') {
      const t = setTimeout(() => onNextPatron(), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const lastRound = fightRounds.length > 0 ? fightRounds[fightRounds.length - 1] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0F', '#0D0010', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Flash overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: flashColor, opacity: flashOpacity, zIndex: 10, pointerEvents: 'none' }
        ]}
      />

      {/* Night intro */}
      {phase === 'night_intro' && (
        <View style={styles.centeredFull}>
          <Text style={styles.introLocation}>{locationConfig.subtitle}</Text>
          <Text style={styles.introName}>{locationConfig.name}</Text>
          <Text style={styles.introDesc}>{locationConfig.description}</Text>
          <View style={styles.introStats}>
            <View style={styles.introStat}>
              <Text style={styles.introStatLabel}>PATRONS TONIGHT</Text>
              <Text style={styles.introStatValue}>{locationConfig.patronsPerNight}</Text>
            </View>
            <View style={styles.introStat}>
              <Text style={styles.introStatLabel}>ENTRY FEE</Text>
              <Text style={styles.introStatValue}>${locationConfig.entryFee}+</Text>
            </View>
            <View style={styles.introStat}>
              <Text style={styles.introStatLabel}>BRIBE COST</Text>
              <Text style={styles.introStatValue}>${locationConfig.bribeCost}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bigBtn} onPress={onBeginNight} activeOpacity={0.85}>
            <Text style={styles.bigBtnText}>START SHIFT</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* HUD (shown during active game phases) */}
      {!['night_intro', 'game_over', 'night_end', 'fight'].includes(phase) && (
        <HUD state={state} onBribePress={onOpenBribe} />
      )}

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <AlertBanner
          message={bannerMsg}
          type={bannerType}
          moneyChange={lastMoneyChange}
          visible={bannerVisible}
        />
      </View>

      {/* Patron approach phase */}
      {phase === 'patron_approach' && currentPatron && (
        <View style={styles.patronContainer}>
          <Text style={styles.approachText}>Someone approaches...</Text>
          <PatronCard
            patron={currentPatron}
            onShowID={onViewID}
            onTalk={currentPatron.emotionalType !== 'none' ? onOpenEmotional : undefined}
          />
        </View>
      )}

      {/* ID check phase */}
      {(phase === 'id_check' || phase === 'trivia_check') && currentPatron && (
        <ScrollView contentContainerStyle={styles.idCheckContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.idCheckTitle}>🪪 ID CHECK</Text>
          <IDCard
            patron={currentPatron}
            onInspect={phase === 'id_check' ? onOpenTrivia : undefined}
          />

          {/* Trivia overlay */}
          {phase === 'trivia_check' && (
            <View style={styles.triviaBox}>
              <Text style={styles.triviaTitle}>STATE CAPITAL VERIFICATION</Text>
              <Text style={styles.triviaQuestion}>
                Is <Text style={styles.triviaHighlight}>{
                  currentPatron.idCapitalIsCorrect
                    ? currentPatron.idState.capital
                    : wrongCapital(currentPatron.idState.abbreviation)
                }</Text> the capital of {currentPatron.idState.name}?
              </Text>
              <Text style={styles.triviaHint}>
                Actual capital: {currentPatron.idState.capital}
              </Text>
              <View style={styles.triviaAnswer}>
                {currentPatron.idCapitalIsCorrect
                  ? <Text style={styles.triviaCorrect}>✅ MATCHES — Capital is correct</Text>
                  : <Text style={styles.triviaWrong}>❌ MISMATCH — This ID lists the wrong capital!</Text>
                }
              </View>
              <TouchableOpacity style={styles.triviaClose} onPress={onCloseTrivia}>
                <Text style={styles.triviaCloseText}>← BACK TO ID</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'id_check' && (
            <View style={styles.decisionRow}>
              <TouchableOpacity
                style={[styles.decisionBtn, styles.rejectBtn]}
                onPress={() => onDecision(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.rejectBtnText}>✗ TURN AWAY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.decisionBtn, styles.approveBtn]}
                onPress={() => onDecision(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.approveBtnText}>✓ LET IN</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Emotional phase */}
      {phase === 'emotional' && currentPatron && (
        <View style={styles.emotionalContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechPortrait}>{currentPatron.portrait}</Text>
            <View style={styles.speechBubbleText}>
              <Text style={styles.speechName}>{currentPatron.name}</Text>
              <Text style={styles.speechLine}>"{currentPatron.emotionalLine}"</Text>
            </View>
          </View>

          <Text style={styles.emotionalPrompt}>What do you do?</Text>

          <View style={styles.emotionalActions}>
            <TouchableOpacity
              style={[styles.decisionBtn, styles.rejectBtn]}
              onPress={() => onDecision(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>✗ STILL NO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.decisionBtn, styles.approveBtn]}
              onPress={() => onDecision(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.approveBtnText}>✓ FINE, IN</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backToID} onPress={onViewID}>
            <Text style={styles.backToIDText}>← Check ID First</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Police warning */}
      {phase === 'police_warning' && (
        <View style={styles.centeredFull}>
          <Text style={styles.policeIcon}>🚔</Text>
          <Text style={styles.policeTitle}>POLICE ALERT</Text>
          <Text style={styles.policeMessage}>{getPoliceWarningMessage(policeMeter)}</Text>
          <Text style={styles.policeHeat}>HEAT: {Math.round(policeMeter)}%</Text>

          <View style={styles.policeBtns}>
            <TouchableOpacity style={styles.bribeBtn} onPress={onOpenBribe} activeOpacity={0.8}>
              <Text style={styles.bribeBtnText}>💵  BRIBE THEM  ({formatMoney(calcBribeCost(locationConfig, policeMeter))})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dismissBtn} onPress={onDismissPolice} activeOpacity={0.8}>
              <Text style={styles.dismissBtnText}>IGNORE & CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Disturbance */}
      {phase === 'disturbance' && pendingDisturbances.length > 0 && (
        <View style={styles.centeredFull}>
          <Text style={styles.disturbIcon}>⚠️</Text>
          <Text style={styles.disturbTitle}>DISTURBANCE INSIDE</Text>
          <Text style={styles.disturbDesc}>{pendingDisturbances[0].description}</Text>
          <Text style={styles.disturbFight}>Fight Level: {'⭐'.repeat(pendingDisturbances[0].fightLevel + 1)}</Text>

          <View style={styles.disturbBtns}>
            <TouchableOpacity
              style={[styles.disturbBtn, styles.ejectBtn]}
              onPress={() => onHandleDisturbance(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.ejectBtnText}>👊  EJECT THEM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.disturbBtn, styles.ignoreBtn]}
              onPress={() => onHandleDisturbance(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.ignoreBtnText}>🙈  IGNORE IT</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disturbHint}>
            Ignoring raises heat by {pendingDisturbances[0].policeThreat}%. Ejecting may lead to a fight.
          </Text>
        </View>
      )}

      {/* Fight */}
      {phase === 'fight' && fightPatron && (
        <View style={styles.fightContainer}>
          <HUD state={state} />
          <FightMinigame
            patron={fightPatron}
            playerHP={fightHP[0]}
            enemyHP={fightHP[1]}
            lastRound={lastRound}
            onMove={onFightMove}
          />
        </View>
      )}

      {/* Night end */}
      {phase === 'night_end' && (
        <View style={styles.centeredFull}>
          <Text style={styles.nightEndEmoji}>🌃</Text>
          <Text style={styles.nightEndTitle}>NIGHT'S OVER</Text>
          <Text style={styles.nightEndSub}>{locationConfig.name}</Text>

          <View style={styles.nightEndStats}>
            <View style={styles.nightEndStat}>
              <Text style={styles.nightEndStatLabel}>FINAL BALANCE</Text>
              <Text style={[
                styles.nightEndStatValue,
                { color: balance >= 0 ? COLORS.neonGreen : COLORS.neonPink }
              ]}>{formatMoney(balance)}</Text>
            </View>
            <View style={styles.nightEndStat}>
              <Text style={styles.nightEndStatLabel}>SCORE</Text>
              <Text style={[styles.nightEndStatValue, { color: COLORS.neonYellow }]}>{score}</Text>
            </View>
            <View style={styles.nightEndStat}>
              <Text style={styles.nightEndStatLabel}>PATRONS IN</Text>
              <Text style={styles.nightEndStatValue}>{state.patronsLetIn}</Text>
            </View>
            <View style={styles.nightEndStat}>
              <Text style={styles.nightEndStatLabel}>UNDERAGE IN</Text>
              <Text style={[
                styles.nightEndStatValue,
                { color: state.underage_let_in > 0 ? COLORS.neonPink : COLORS.neonGreen }
              ]}>{state.underage_let_in}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bigBtn} onPress={onEndNight} activeOpacity={0.85}>
            <Text style={styles.bigBtnText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Waiting indicator */}
      {phase === 'waiting' && (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>...</Text>
        </View>
      )}

      {/* Bribe modal */}
      <BribeModal
        visible={phase === 'bribe'}
        state={state}
        onPay={onPayBribe}
        onDecline={onDeclineBribe}
      />
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  centeredFull: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl, gap: LAYOUT.spacing.lg,
  },
  patronContainer: {
    flex: 1, paddingTop: LAYOUT.spacing.lg, gap: LAYOUT.spacing.lg,
  },
  approachText: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm,
    textAlign: 'center', letterSpacing: 2, fontStyle: 'italic',
  },
  idCheckContainer: {
    paddingTop: LAYOUT.spacing.lg, paddingBottom: LAYOUT.spacing.xxl,
    paddingHorizontal: LAYOUT.spacing.md, gap: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  idCheckTitle: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.lg,
    fontWeight: '800', letterSpacing: 2,
  },
  decisionRow: {
    flexDirection: 'row', gap: LAYOUT.spacing.md,
    width: LAYOUT.cardWidth,
  },
  decisionBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  rejectBtn: { backgroundColor: COLORS.neonPink },
  approveBtn: { backgroundColor: COLORS.neonGreen },
  rejectBtnText: {
    color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.md,
    letterSpacing: 2,
  },
  approveBtnText: {
    color: '#000', fontWeight: '900', fontSize: LAYOUT.fontSize.md,
    letterSpacing: 2,
  },
  triviaBox: {
    width: LAYOUT.cardWidth, backgroundColor: COLORS.bgSurface,
    borderRadius: 12, padding: LAYOUT.spacing.lg, gap: LAYOUT.spacing.md,
    borderWidth: 1, borderColor: COLORS.neonBlue,
  },
  triviaTitle: {
    color: COLORS.neonBlue, fontSize: 11,
    fontWeight: '800', letterSpacing: 3,
  },
  triviaQuestion: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.lg,
    lineHeight: 26,
  },
  triviaHighlight: {
    color: COLORS.neonYellow, fontWeight: '800',
  },
  triviaHint: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm,
    fontStyle: 'italic',
  },
  triviaAnswer: { paddingTop: LAYOUT.spacing.xs },
  triviaCorrect: {
    color: COLORS.neonGreen, fontWeight: '700', fontSize: LAYOUT.fontSize.md,
  },
  triviaWrong: {
    color: COLORS.neonPink, fontWeight: '700', fontSize: LAYOUT.fontSize.md,
  },
  triviaClose: {
    paddingTop: LAYOUT.spacing.sm,
  },
  triviaCloseText: {
    color: COLORS.neonBlue, fontWeight: '700', fontSize: LAYOUT.fontSize.sm,
  },
  emotionalContainer: {
    flex: 1, paddingHorizontal: LAYOUT.spacing.xl, paddingTop: LAYOUT.spacing.xxl,
    gap: LAYOUT.spacing.xl, alignItems: 'center', justifyContent: 'center',
  },
  speechBubble: {
    flexDirection: 'row', gap: LAYOUT.spacing.md,
    backgroundColor: COLORS.bgSurface, borderRadius: 16,
    padding: LAYOUT.spacing.lg, width: '100%',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  speechPortrait: { fontSize: 48 },
  speechBubbleText: { flex: 1, gap: 6 },
  speechName: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.sm, fontWeight: '700',
  },
  speechLine: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md,
    lineHeight: 22, fontStyle: 'italic',
  },
  emotionalPrompt: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.md, letterSpacing: 1,
  },
  emotionalActions: {
    flexDirection: 'row', gap: LAYOUT.spacing.md, width: '100%',
  },
  backToID: { paddingTop: LAYOUT.spacing.sm },
  backToIDText: { color: COLORS.neonBlue, fontWeight: '600', fontSize: LAYOUT.fontSize.sm },
  policeIcon: { fontSize: 64 },
  policeTitle: {
    color: COLORS.neonBlue, fontSize: LAYOUT.fontSize.xxl,
    fontWeight: '900', letterSpacing: 3,
  },
  policeMessage: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.lg,
    textAlign: 'center', lineHeight: 26,
  },
  policeHeat: {
    color: COLORS.neonPink, fontSize: LAYOUT.fontSize.xl,
    fontWeight: '800',
  },
  policeBtns: { gap: LAYOUT.spacing.md, width: '100%' },
  bribeBtn: {
    backgroundColor: COLORS.bribe, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  bribeBtnText: {
    color: '#000', fontWeight: '900', fontSize: LAYOUT.fontSize.md, letterSpacing: 1,
  },
  dismissBtn: {
    backgroundColor: COLORS.bgSurface, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  dismissBtnText: {
    color: COLORS.textSecondary, fontWeight: '700', fontSize: LAYOUT.fontSize.sm, letterSpacing: 1.5,
  },
  disturbIcon: { fontSize: 64 },
  disturbTitle: {
    color: COLORS.neonOrange, fontSize: LAYOUT.fontSize.xxl,
    fontWeight: '900', letterSpacing: 2,
  },
  disturbDesc: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.lg,
    textAlign: 'center', lineHeight: 26,
  },
  disturbFight: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.md,
  },
  disturbBtns: { gap: LAYOUT.spacing.md, width: '100%' },
  disturbBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ejectBtn: { backgroundColor: COLORS.neonPink },
  ejectBtnText: { color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.md, letterSpacing: 2 },
  ignoreBtn: {
    backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: COLORS.borderDim,
  },
  ignoreBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: LAYOUT.fontSize.sm },
  disturbHint: {
    color: COLORS.textDim, fontSize: 11, textAlign: 'center', lineHeight: 16,
  },
  fightContainer: { flex: 1 },
  nightEndEmoji: { fontSize: 72 },
  nightEndTitle: {
    color: COLORS.neonGreen, fontSize: LAYOUT.fontSize.title,
    fontWeight: '900', letterSpacing: 4,
  },
  nightEndSub: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.md,
    letterSpacing: 2, marginTop: -LAYOUT.spacing.md,
  },
  nightEndStats: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: LAYOUT.spacing.md, justifyContent: 'center',
    width: '100%',
  },
  nightEndStat: {
    backgroundColor: COLORS.bgSurface, borderRadius: 10,
    padding: LAYOUT.spacing.md, alignItems: 'center',
    minWidth: 130, flex: 1,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  nightEndStatLabel: {
    color: COLORS.textDim, fontSize: 10,
    letterSpacing: 1.5, fontWeight: '700',
  },
  nightEndStatValue: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.xl,
    fontWeight: '900', marginTop: 4,
  },
  bigBtn: {
    backgroundColor: COLORS.neonPink, borderRadius: 14,
    paddingVertical: 18, paddingHorizontal: LAYOUT.spacing.xxl,
    width: '100%', alignItems: 'center',
    shadowColor: COLORS.neonPink, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 16,
  },
  bigBtnText: {
    color: '#FFF', fontWeight: '900', fontSize: LAYOUT.fontSize.lg,
    letterSpacing: 3,
  },
  introLocation: {
    color: COLORS.neonPink, fontSize: 11,
    fontWeight: '800', letterSpacing: 4, textTransform: 'uppercase',
  },
  introName: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.title,
    fontWeight: '900', textAlign: 'center',
  },
  introDesc: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.md,
    textAlign: 'center', lineHeight: 24, fontStyle: 'italic',
  },
  introStats: {
    flexDirection: 'row', gap: LAYOUT.spacing.md, width: '100%',
  },
  introStat: {
    flex: 1, backgroundColor: COLORS.bgSurface,
    borderRadius: 10, padding: LAYOUT.spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  introStatLabel: {
    color: COLORS.textDim, fontSize: 9,
    letterSpacing: 1.5, fontWeight: '700',
  },
  introStatValue: {
    color: COLORS.neonGreen, fontSize: LAYOUT.fontSize.lg,
    fontWeight: '800', marginTop: 4,
  },
  waitingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  waitingText: {
    color: COLORS.textDim, fontSize: LAYOUT.fontSize.xxl,
    letterSpacing: 8,
  },
  bannerContainer: {
    position: 'absolute', top: 100, left: 0, right: 0, zIndex: 20,
  },
});
