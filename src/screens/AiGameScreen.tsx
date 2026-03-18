import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { BarLocation } from '../game/types';
import { useAiGameState } from '../hooks/useAiGameState';
import { formatMoney } from '../game/scoring';
import { BAR_CONFIGS } from '../game/locations';

// Components
import GeneratingScreen from '../components/GeneratingScreen';
import AiPatronCard from '../components/AiPatronCard';
import ConversationUI from '../components/ConversationUI';
import BribePrompt from '../components/BribePrompt';
import DossierReveal from '../components/DossierReveal';
import FightStandoff from '../components/FightStandoff';
import FightExchange from '../components/FightExchange';
import FightBreakingPoint from '../components/FightBreakingPoint';
import HUD from '../components/HUD';
import QuitConfirmDialog from '../components/QuitConfirmDialog';
import PauseOverlay from '../components/PauseOverlay';
import { GameState } from '../game/types';

interface AiGameScreenProps {
  location: BarLocation;
  onGoToMenu: () => void;
}

export default function AiGameScreen({ location, onGoToMenu }: AiGameScreenProps) {
  const game = useAiGameState(location);
  const [showQuit, setShowQuit] = useState(false);
  const [paused, setPaused] = useState(false);

  const {
    phase, patron, conversation, isPatronTyping, pendingBribe,
    personality, playerDecision, generation, fight,
    balance, score, patronsProcessed, policeMeter, night, isMuted,
    gameOverReason, locationConfig,
    sendBouncerMessage, makeDecision, respondToBribe,
    toggleMute, playMessage, proceedToFight, onFightEnd, nextPatron, retry,
  } = game;

  // Derive whether patron would cause trouble after being let in
  const patronWillFight = patron !== null &&
    playerDecision === 'letIn' &&
    patron.correctDecision === 'reject'; // They shouldn't have been let in

  // Build a fake GameState shape just for the HUD
  const hudState: GameState = {
    phase: 'waiting',
    location,
    locationConfig: BAR_CONFIGS[location],
    night,
    balance,
    score,
    patronsProcessed,
    patronQueue: [],
    currentPatron: null,
    pendingDisturbances: [],
    policeMeter,
    policeWarningShown: false,
    lastDecisionCorrect: null,
    lastMoneyChange: 0,
    fightHP: [100, 100],
    fightRounds: [],
    fightPatron: null,
    gameOverReason: '',
    showApproveFlash: false,
    showRejectFlash: false,
    patronsLetIn: 0,
    underage_let_in: 0,
  };

  // ── Generating ───────────────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#0A0A0F', '#0D000F', '#0A0A0F']} style={StyleSheet.absoluteFill} />
        <GeneratingScreen generation={generation} onRetry={retry} />
      </View>
    );
  }

  // ── Game Over ────────────────────────────────────────────────────────────────
  if (phase === 'game_over') {
    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#1A0000', '#0A0A0F']} style={StyleSheet.absoluteFill} />
        <View style={styles.gameOverContent}>
          <Text style={styles.gameOverTitle}>GAME{'\n'}OVER</Text>
          <View style={styles.gameOverReason}>
            <Text style={styles.gameOverReasonText}>{gameOverReason}</Text>
          </View>
          <View style={styles.gameOverStats}>
            <StatItem label="SCORE" value={String(score)} color={COLORS.neonYellow} />
            <StatItem label="BALANCE" value={formatMoney(balance)} color={balance >= 0 ? COLORS.neonGreen : COLORS.neonPink} />
            <StatItem label="PATRONS" value={String(patronsProcessed)} color={COLORS.textSecondary} />
          </View>
          <TouchableOpacity style={styles.menuBtn} onPress={onGoToMenu} activeOpacity={0.85}>
            <Text style={styles.menuBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Night End ────────────────────────────────────────────────────────────────
  if (phase === 'night_end') {
    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#001A00', '#0A0A0F']} style={StyleSheet.absoluteFill} />
        <View style={styles.gameOverContent}>
          <Text style={styles.nightEndTitle}>NIGHT{'\n'}DONE</Text>
          <View style={styles.gameOverStats}>
            <StatItem label="SCORE" value={String(score)} color={COLORS.neonYellow} />
            <StatItem label="BALANCE" value={formatMoney(balance)} color={balance >= 0 ? COLORS.neonGreen : COLORS.neonPink} />
            <StatItem label="PATRONS" value={String(patronsProcessed)} color={COLORS.textSecondary} />
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={nextPatron} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>NEXT PATRON →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={onGoToMenu} activeOpacity={0.85}>
            <Text style={styles.menuBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Fight Phases ─────────────────────────────────────────────────────────────
  if (phase === 'fight' && patron) {
    const { fightState, activePrompt, handlePhase1Choice, handleZoneTap, handlePhase3Choice } = fight;

    // Fight result
    if (fightState.winner) {
      const won = fightState.winner === 'player';
      return (
        <View style={styles.fullScreen}>
          <LinearGradient
            colors={won ? ['#001A00', '#0A0A0F'] : ['#1A0000', '#0A0A0F']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.fightResultContent}>
            <Text style={styles.fightResultEmoji}>{won ? '🏆' : '💀'}</Text>
            <Text style={[styles.fightResultTitle, { color: won ? COLORS.neonGreen : COLORS.neonPink }]}>
              {won ? 'YOU WIN' : 'KNOCKED OUT'}
            </Text>
            <Text style={styles.fightResultSub}>
              {won
                ? `${patron.name} is out on the street.`
                : `${patron.name} put you on the ground.`}
            </Text>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: won ? COLORS.neonGreen : COLORS.neonPink }]}
              onPress={() => onFightEnd(won)}
              activeOpacity={0.85}
            >
              <Text style={[styles.continueBtnText, { color: won ? '#000' : '#FFF' }]}>
                {won ? 'CONTINUE →' : 'GAME OVER'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#1A0005', '#0A0A0F']} style={StyleSheet.absoluteFill} />
        <StatusBar barStyle="light-content" />
        {fightState.phase === 'standoff' && fightState.phase1Tell && (
          <FightStandoff
            patron={patron}
            tell={fightState.phase1Tell}
            onChoice={handlePhase1Choice}
          />
        )}
        {fightState.phase === 'exchange' && (
          <FightExchange
            patron={patron}
            fightState={fightState}
            activePrompt={activePrompt}
            onZoneTap={handleZoneTap}
          />
        )}
        {fightState.phase === 'breaking_point' && (
          <FightBreakingPoint
            patron={patron}
            fightState={fightState}
            onChoice={handlePhase3Choice}
          />
        )}
      </View>
    );
  }

  // ── Dossier Reveal ────────────────────────────────────────────────────────────
  if (phase === 'dossier' && patron && playerDecision) {
    const correct = playerDecision === patron.correctDecision;
    const scoreChange = correct ? patron.scoringCorrect : patron.scoringWrong;
    const balanceChange = playerDecision === 'letIn'
      ? locationConfig.entryFee + (patron.sobriety > 50 ? 20 : 5)
      : 0;

    return (
      <View style={styles.fullScreen}>
        <StatusBar barStyle="light-content" />
        <DossierReveal
          patron={patron}
          playerDecision={playerDecision}
          personality={personality}
          scoreChange={scoreChange}
          balanceChange={balanceChange}
          willFight={patronWillFight}
          onContinue={patronWillFight ? proceedToFight : nextPatron}
        />
      </View>
    );
  }

  // ── Patron Intro / Conversation ───────────────────────────────────────────────
  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0F', '#0D0010', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      {/* HUD */}
      <HUD state={hudState} onBribePress={undefined} />

      {/* Dialogs */}
      <QuitConfirmDialog
        visible={showQuit}
        score={score}
        onResume={() => setShowQuit(false)}
        onQuit={() => { setShowQuit(false); onGoToMenu(); }}
      />
      <PauseOverlay
        visible={paused}
        onResume={() => setPaused(false)}
        onQuit={() => { setPaused(false); onGoToMenu(); }}
      />

      {/* Patron intro card */}
      {phase === 'patron_intro' && patron && (
        <AiPatronCard
          patron={patron}
          onBeginConversation={() => {/* auto-handled by state */}}
          isLoadingOpener={isPatronTyping}
          onQuit={() => setShowQuit(true)}
          onPause={() => setPaused(true)}
        />
      )}

      {/* Active conversation */}
      {phase === 'conversation' && patron && (
        <ConversationUI
          patron={patron}
          messages={conversation}
          isPatronTyping={isPatronTyping}
          personality={personality}
          isMuted={isMuted}
          onSend={sendBouncerMessage}
          onToggleMute={toggleMute}
          onPlayMessage={playMessage}
          onLetIn={() => makeDecision('letIn')}
          onReject={() => makeDecision('reject')}
          onQuit={() => setShowQuit(true)}
          onPause={() => setPaused(true)}
        />
      )}

      {/* Bribe modal */}
      {pendingBribe && (
        <BribePrompt
          visible={!!pendingBribe}
          bribe={pendingBribe}
          balance={balance}
          policeMeter={policeMeter}
          onAccept={() => respondToBribe('accept')}
          onReject={() => respondToBribe('reject')}
          onCounter={() => respondToBribe('counter')}
        />
      )}
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={statStyles.item}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  item: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.bgSurface,
    borderRadius: 10, padding: LAYOUT.spacing.md,
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  label: { color: COLORS.textDim, fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  value: { fontSize: LAYOUT.fontSize.xl, fontWeight: '900', marginTop: 4 },
});

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: COLORS.bg },
  gameOverContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl, gap: LAYOUT.spacing.lg,
  },
  gameOverTitle: {
    color: COLORS.neonPink, fontSize: 64, fontWeight: '900',
    letterSpacing: 12, textAlign: 'center', lineHeight: 68,
    textShadowColor: COLORS.neonPink, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  nightEndTitle: {
    color: COLORS.neonGreen, fontSize: 64, fontWeight: '900',
    letterSpacing: 12, textAlign: 'center', lineHeight: 68,
  },
  gameOverReason: {
    backgroundColor: 'rgba(255,45,85,0.15)', borderRadius: 10,
    padding: LAYOUT.spacing.lg, width: '100%',
    borderWidth: 1, borderColor: COLORS.neonPink,
  },
  gameOverReasonText: {
    color: COLORS.textPrimary, fontSize: LAYOUT.fontSize.md,
    textAlign: 'center', lineHeight: 24,
  },
  gameOverStats: {
    flexDirection: 'row', gap: LAYOUT.spacing.sm, width: '100%',
  },
  menuBtn: {
    backgroundColor: COLORS.bgSurface, borderRadius: 14,
    paddingVertical: 14, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderDim,
  },
  menuBtnText: {
    color: COLORS.textSecondary, fontWeight: '700',
    fontSize: LAYOUT.fontSize.md, letterSpacing: 2,
  },
  continueBtn: {
    backgroundColor: COLORS.neonPink, borderRadius: 14,
    paddingVertical: 18, width: '100%', alignItems: 'center',
    shadowColor: COLORS.neonPink, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 12,
  },
  continueBtnText: {
    color: '#FFF', fontWeight: '900',
    fontSize: LAYOUT.fontSize.lg, letterSpacing: 3,
  },
  fightResultContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl, gap: LAYOUT.spacing.lg,
  },
  fightResultEmoji: { fontSize: 72 },
  fightResultTitle: { fontSize: 52, fontWeight: '900', letterSpacing: 8 },
  fightResultSub: {
    color: COLORS.textSecondary, fontSize: LAYOUT.fontSize.md,
    textAlign: 'center', marginTop: -LAYOUT.spacing.md,
  },
});
