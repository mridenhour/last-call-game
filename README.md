# Last Call 🍺

A single-player **bouncer simulation** mobile game powered by Claude AI. Check IDs, read psychological tells, manage the crowd — and don't get busted.

---

## Setup

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [Expo Go](https://expo.dev/go) on your iOS or Android phone
- An [Anthropic API key](https://console.anthropic.com)

### Install

```bash
git clone https://github.com/mridenhour/last-call-game.git
cd last-call-game
npm install
```

### Configure API Key

```bash
cp .env.example .env
# Edit .env and add your key:
# ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Run

```bash
npx expo start
```

Scan the QR code with **Expo Go**. The game runs fully offline except for AI patron generation calls.

---

## How to Play

Each round, Claude AI generates a unique patron — psychologically complex, with hidden agendas, behavioral tells, and real manipulation tactics. Your job as the bouncer:

1. **Read the patron** — observe their visible behavior, sobriety, and attitude
2. **Start a conversation** — ask questions and interrogate their story
3. **Spot behavioral tells** — five tells are hidden in every patron's profile; they'll slip under pressure
4. **Decide: LET IN or REJECT** — based on what you've learned
5. **Dossier reveal** — the full psychological breakdown is shown after every decision
6. **Handle trouble** — if they cause a disturbance inside, eject them with the 3-phase fight system

### Fail States
| Cause | Result |
|-------|--------|
| Police heat reaches 100% | Raided — game over |
| Lose a street fight | Down for the count — game over |
| Negative balance when broke | Fired — game over |

---

## AI Mechanics

### Procedural Patron Generation
Every patron is generated fresh via **Claude claude-sonnet-4-20250514**. No two patrons are the same:
- Deception types: underage fake ID, borrowed sibling ID, banned patron, dangerously drunk valid ID, drug dealer, anxious legitimate patron, no ID at all
- Age range 18–55, varied genders, backgrounds, sophistication levels
- Scales with bar location — dive bar patrons are simpler, nightclub patrons are complex

### Live AI Conversation
Patrons respond in-character to everything you say. They:
- Open with a line that reflects their psychological state and sobriety
- Fill silence with character-revealing behavior after 8 seconds
- React to your interrogation style — pushing harder if you're empathetic, crumbling faster if you're tough
- May spontaneously attempt a bribe when cornered (3 response options: Accept / Reject / Counter)

### Emergent Bouncer Personality
Your typing style is analyzed in real time to classify you as one of four archetypes:

| Type | Style | Effect |
|------|-------|--------|
| **Tough** 🤜 | Short, direct, no-nonsense | Nervous patrons crumble faster |
| **Sarcastic** 😏 | Wit, irony, dry humor | Patrons get defensive or amused |
| **By-the-Book** 📋 | Procedural, formal | Hard to charm, misses emotional nuance |
| **Empathetic** 🤝 | Warm, asks follow-ups | Gets more truth, easier to manipulate |

Your personality is shown as a live badge during conversations and fed back into the patron's AI so they adapt.

### Voice System
- Every patron speaks their lines aloud via **expo-speech** with unique pitch and rate
- Mute toggle available during conversation
- Voice characteristics (pitch, rate, style) are generated per-patron

---

## Fight Mini-Game (3 Phases)

Triggered when you eject a troublemaking patron who was incorrectly let in.

**Phase 1 — Standoff** (read the tell)
The patron displays one behavioral tell before attacking. Choose Dodge / Block / Strike First. Correct read → health advantage. Wrong read → eat the first hit.

**Phase 2 — Exchange** (zone tapping)
Attack and defense prompts flash across Left / Center / Right zones with a shrinking time window. Speed escalates every 5 seconds. Drunk patrons are slow and unpredictable; psychopaths are fast and relentless.

**Phase 3 — Breaking Point** (psychological read)
When either fighter drops below 25%, the patron delivers a line from their psychological profile. Choose from 3 bouncer responses: De-escalate, Confront, or Psychological Insight. The correct option is determined by the patron's profile. Getting it right ends the fight immediately.

---

## Bar Locations (Progression)

| # | Bar | Vibe | Heat | Entry Fee |
|---|-----|------|------|-----------|
| 1 | **The Rusty Nail** — Dive Bar | Grimy, low stakes | 🟢 Low | $8+ |
| 2 | **Keg & Crown** — College Bar | Fake IDs everywhere | 🟡 Medium | $12+ |
| 3 | **Sky & Rye** — Rooftop Lounge | Big spenders, bigger problems | 🟡 Medium | $25+ |
| 4 | **VAULT** — Nightclub | Zero tolerance, maximum chaos | 🔴 High | $40+ |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript / React 19 |
| AI | Anthropic Claude claude-sonnet-4-20250514 via direct `fetch` API |
| Voice | `expo-speech` (TTS, works in Expo Go) |
| Environment | `react-native-dotenv` via Babel |
| Persistence | `@react-native-async-storage/async-storage` — offline high scores |
| Visuals | `expo-linear-gradient`, custom dark neon aesthetic |

### Project Structure

```
src/
  api/          # Anthropic API calls — patron generation + conversation
  game/         # Pure logic — AI types, personality inference, bribe detection, fight phases
  hooks/        # useAiGameState, useConversation, useFight, useVoice, useBouncerPersonality
  components/   # All UI — GeneratingScreen, AiPatronCard, ConversationUI, DossierReveal, fight phases
  screens/      # AiGameScreen orchestrator + original classic screens
  constants/    # Colors, layout
```

Game logic and UI are fully separated so the app can be extended to Expo Web or Mac Catalyst.

---

## License

MIT
