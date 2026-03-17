# Last Call 🍺

A single-player **bouncer simulation** mobile game built with React Native and Expo. Check IDs, manage the crowd, keep the bar profitable — and don't get busted.

---

## How to Play

You're the bouncer. Each night, a queue of patrons approaches. Your job:

- **Check their ID** — verify age, expiry date, and state capital
- **Spot fakes** — wrong birth year, wrong state capital, expired license
- **Handle emotional pleas** — flirts, sob stories, guilt trips, and cash bribes
- **Manage police heat** — too many bad calls and you get raided
- **Eject troublemakers** — or fight them in the street
- **Stay profitable** — negative balance at closing = game over

### Fail States
| Cause | Result |
|-------|--------|
| Police heat reaches 100% | Raided — game over |
| Lose a street fight | Down for the count — game over |
| Negative balance at end of night | Fired — game over |

---

## Bar Locations (Progression)

| # | Bar | Vibe | Heat | Entry Fee |
|---|-----|------|------|-----------|
| 1 | **The Rusty Nail** — Dive Bar | Grimy, low stakes | 🟢 Low | $8+ |
| 2 | **Keg & Crown** — College Bar | Fake IDs everywhere | 🟡 Medium | $12+ |
| 3 | **Sky & Rye** — Rooftop Lounge | Big spenders, bigger problems | 🟡 Medium | $25+ |
| 4 | **VAULT** — Nightclub | Zero tolerance, maximum chaos | 🔴 High | $40+ |

Each location increases patron volume, police aggression, and bribe costs.

---

## Running Locally with Expo Go

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Expo Go](https://expo.dev/go) installed on your iOS or Android phone

### Setup

```bash
git clone https://github.com/mridenhour/last-call-game.git
cd last-call-game
npm install
npx expo start
```

Scan the QR code in your terminal with the **Expo Go** app. The game runs fully offline — no backend required.

### Share with Friends

Once running, anyone on your local network can scan the same QR code with Expo Go to play.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Manual state machine (no router dependency) |
| Persistence | `@react-native-async-storage/async-storage` — offline high scores |
| Visuals | `expo-linear-gradient`, custom dark neon aesthetic |
| Platform | iOS + Android via Expo Go, Expo Web ready |

### Project Structure

```
src/
  game/         # Pure logic — types, patron generation, police, fight, scoring
  hooks/        # useGameState (core loop), useHighScores (AsyncStorage)
  components/   # HUD, IDCard, PatronCard, FightMinigame, BribeModal, AlertBanner
  screens/      # MainMenu, Game, GameOver, HighScores
  constants/    # Colors, layout dimensions
```

Game logic and UI are fully separated so the app can be extended to Expo Web or Mac Catalyst.

---

## Gameplay Mechanics

### ID Checking
Each ID card shows name, date of birth, state of issuance, expiry date, and listed state capital. Fake IDs use one of five tricks:
- Wrong birth year (makes an underage patron appear 21+)
- Wrong state capital
- Expired license
- Out-of-region state
- Name mismatch

Tap **VERIFY** on any ID to cross-check the state capital against a trivia overlay.

### Police Heat Meter
Every underage patron you let in raises the heat meter. At 70% you get a warning. At 100% the police raid. You can bribe officers to drop the meter — costs scale with heat level and bar location.

### Fight Minigame
When you eject a troublemaker they may resist. Street fights use a **BLOCK / DODGE / STRIKE** counter system:
- STRIKE beats BLOCK
- BLOCK beats DODGE  
- DODGE beats STRIKE

Higher fight levels mean smarter enemy AI.

---

## License

MIT
