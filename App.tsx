import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/colors';
import { useGameState } from './src/hooks/useGameState';
import { useHighScores } from './src/hooks/useHighScores';
import { BarLocation } from './src/game/types';

import MainMenuScreen from './src/screens/MainMenuScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import HighScoreScreen from './src/screens/HighScoreScreen';
import AiGameScreen from './src/screens/AiGameScreen';

type AppScreen = 'menu' | 'classic_game' | 'ai_game' | 'scores';

export default function App() {
  const [screen, setScreen] = React.useState<AppScreen>('menu');
  const [aiLocation, setAiLocation] = React.useState<BarLocation>('dive');

  // Classic game state
  const { state, startGame, beginNight, nextPatron, viewID, openTriviaCheck,
    closeTriviaCheck, openEmotionalPhase, makeDecision, dismissPoliceWarning,
    openBribe, payBribe, declineBribe, handleDisturbance, executeFightMove,
    endNight, goToMenu } = useGameState();
  const { scores, saveScore } = useHighScores();

  const highScore = scores.length > 0 ? scores[0].score : 0;

  // Save classic score on game end
  useEffect(() => {
    if (state.phase === 'game_over' || state.phase === 'night_end') {
      if (state.score > 0) {
        saveScore({
          score: state.score,
          balance: state.balance,
          location: state.location,
          night: state.night,
          date: new Date().toLocaleDateString(),
        });
      }
    }
  }, [state.phase]);

  function handleStartAiGame(location: BarLocation) {
    setAiLocation(location);
    setScreen('ai_game');
  }

  function handleStartClassicGame(location: BarLocation) {
    startGame(location);
    setScreen('classic_game');
  }

  function handleMenu() {
    goToMenu();
    setScreen('menu');
  }

  // ── Scores ───────────────────────────────────────────────────────────────────

  if (screen === 'scores') {
    return (
      <SafeAreaView style={styles.safe}>
        <HighScoreScreen
          scores={scores}
          onBack={() => setScreen('menu')}
          onClear={() => {}}
        />
      </SafeAreaView>
    );
  }

  // ── Menu ─────────────────────────────────────────────────────────────────────

  if (screen === 'menu') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <MainMenuScreen
          onStartGame={handleStartAiGame}
          onShowScores={() => setScreen('scores')}
          highScore={highScore}
        />
      </SafeAreaView>
    );
  }

  // ── AI Game ──────────────────────────────────────────────────────────────────

  if (screen === 'ai_game') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <AiGameScreen
          location={aiLocation}
          onGoToMenu={handleMenu}
        />
      </SafeAreaView>
    );
  }

  // ── Classic Game ─────────────────────────────────────────────────────────────

  if (screen === 'classic_game') {
    if (state.phase === 'game_over') {
      return (
        <SafeAreaView style={styles.safe}>
          <GameOverScreen
            state={state}
            onRestart={() => { startGame(state.location); }}
            onMenu={handleMenu}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <GameScreen
          state={state}
          onBeginNight={beginNight}
          onNextPatron={nextPatron}
          onViewID={viewID}
          onOpenEmotional={openEmotionalPhase}
          onOpenTrivia={openTriviaCheck}
          onCloseTrivia={closeTriviaCheck}
          onDecision={makeDecision}
          onDismissPolice={dismissPoliceWarning}
          onOpenBribe={openBribe}
          onPayBribe={payBribe}
          onDeclineBribe={declineBribe}
          onHandleDisturbance={handleDisturbance}
          onFightMove={executeFightMove}
          onEndNight={handleMenu}
        />
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
