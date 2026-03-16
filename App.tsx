import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/colors';
import { useGameState } from './src/hooks/useGameState';
import { useHighScores } from './src/hooks/useHighScores';
import { BarLocation } from './src/game/types';
import { BAR_CONFIGS } from './src/game/locations';

import MainMenuScreen from './src/screens/MainMenuScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import HighScoreScreen from './src/screens/HighScoreScreen';

type AppScreen = 'menu' | 'game' | 'scores';

export default function App() {
  const [screen, setScreen] = React.useState<AppScreen>('menu');
  const { state, startGame, beginNight, nextPatron, viewID, openTriviaCheck,
    closeTriviaCheck, openEmotionalPhase, makeDecision, dismissPoliceWarning,
    openBribe, payBribe, declineBribe, handleDisturbance, executeFightMove,
    endNight, goToMenu } = useGameState();
  const { scores, saveScore } = useHighScores();

  const highScore = scores.length > 0 ? scores[0].score : 0;

  // Save score when game ends
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

  function handleStartGame(location: BarLocation) {
    startGame(location);
    setScreen('game');
  }

  function handleRestart() {
    startGame(state.location);
    setScreen('game');
  }

  function handleMenu() {
    goToMenu();
    setScreen('menu');
  }

  function handleEndNight() {
    // After night ends, return to menu with option to continue
    handleMenu();
  }

  // ── Active game phases ───────────────────────────────────────────────────

  const gameOverPhase = state.phase === 'game_over';
  const nightEndPhase = state.phase === 'night_end';

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

  if (screen === 'menu') {
    return (
      <SafeAreaView style={styles.safe}>
        <MainMenuScreen
          onStartGame={handleStartGame}
          onShowScores={() => setScreen('scores')}
          highScore={highScore}
        />
      </SafeAreaView>
    );
  }

  // Game screen — show game over overlay when needed
  if (screen === 'game') {
    if (gameOverPhase) {
      return (
        <SafeAreaView style={styles.safe}>
          <GameOverScreen
            state={state}
            onRestart={handleRestart}
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
          onEndNight={handleEndNight}
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
