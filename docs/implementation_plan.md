# Interactive Coach Training Simulator

Transform Coach from a post-meeting feedback tool into an **active training platform** where sales reps can practice against an AI-simulated client, guided by their sales plan and past performance data.

## User Review Required

> [!IMPORTANT]
> **API Key required**: The AI simulation relies on the OpenAI API. You'll need to provide an `OPENAI_API_KEY` in a `.env` file. The app will gracefully degrade without one (analysis dashboard still works, simulation uses mock responses).

> [!IMPORTANT]
> **Stack choice**: I'm proposing **Vite + vanilla JS** (no React/framework). This keeps the project lightweight, zero-dependency on the frontend, and fast to iterate. The README says `npm run dev` — Vite supports this out of the box. If you prefer React or another framework, let me know.

> [!WARNING]
> **No database**: Per the README, MVP uses the JSON files directly. Session history won't persist across refreshes. This is intentional — no over-engineering.

## Strategy — Why This Architecture

| Principle | Decision |
|---|---|
| **Ship fast** | Vanilla JS + Vite. No framework overhead. |
| **Modular** | Each concern is a separate ES module (`planLoader`, `meetingAnalyzer`, `trainingEngine`, `evaluator`, `aiService`) |
| **Prod-ready patterns** | Clean separation of data layer / business logic / UI. Easy to swap in a real backend later. |
| **AI as constrained tool** | LLM prompts are scoped by sales plan markers — no hallucination-prone open-ended generation |
| **Visual impact** | Dark theme, radar chart, progress animations — this looks like a real SaaS product |

### Trade-offs

| Choice | Pro | Con |
|---|---|---|
| No framework | Fast, small, portable | Manual DOM management |
| OpenAI dependency | Best quality simulation | Requires API key, cost per call |
| No persistence | Simpler, no DB setup | Session data lost on refresh |
| Single-page | No routing complexity | All views in one page (tabs) |

---

## Proposed Changes

### Project Scaffold

#### [NEW] [package.json](file:///home/epitech/technicalTest/coach-training-simulator/package.json)
Vite dev server, OpenAI SDK dependency, dotenv.

#### [NEW] [vite.config.js](file:///home/epitech/technicalTest/coach-training-simulator/vite.config.js)
Minimal Vite config with proxy for API routes.

#### [NEW] [.env.example](file:///home/epitech/technicalTest/coach-training-simulator/.env.example)
Template for `OPENAI_API_KEY`.

---

### Core Modules (`src/modules/`)

#### [NEW] [planLoader.js](file:///home/epitech/technicalTest/coach-training-simulator/src/modules/planLoader.js)
- Loads [sales-plan.json](file:///home/epitech/technicalTest/coach-training-simulator/sales-plan.json), normalizes markers into a structured array
- Exposes `getMarkers()`, `getMarkerByTitle(title)`, `getMarkersByOrder()`

#### [NEW] [meetingAnalyzer.js](file:///home/epitech/technicalTest/coach-training-simulator/src/modules/meetingAnalyzer.js)
- Loads [meeting-details.json](file:///home/epitech/technicalTest/coach-training-simulator/meeting-details.json)
- Cross-references evaluations against plan markers
- Computes: `getMissedMarkers()`, `getWeakMarkers(threshold)`, `getPerformanceSummary()`
- Generates prioritized training recommendations (missed → low-score → remaining)

#### [NEW] [trainingEngine.js](file:///home/epitech/technicalTest/coach-training-simulator/src/modules/trainingEngine.js)
- Orchestrates the simulation session as a state machine
- States: `IDLE → BRIEFING → ACTIVE_MARKER → EVALUATING → NEXT_MARKER → COMPLETE`
- Manages marker progression order (worst-first priority)
- Tracks per-marker user responses and scores

#### [NEW] [evaluator.js](file:///home/epitech/technicalTest/coach-training-simulator/src/modules/evaluator.js)
- Takes a user response + marker definition → structured score + feedback
- Uses the marker's `description` as the grading rubric
- Returns `{ score: 1-5, strengths: [], improvements: [], advice: string }`

---

### AI Service (`src/services/`)

#### [NEW] [aiService.js](file:///home/epitech/technicalTest/coach-training-simulator/src/services/aiService.js)
- Wraps calls to the backend API proxy (which calls OpenAI)
- Two main functions:
  - `simulateClient(markerContext, conversationHistory)` → realistic client response
  - `evaluateResponse(userResponse, markerDefinition)` → structured evaluation
- Falls back to mock responses if API is unavailable

---

### Backend API Proxy (`server/`)

#### [NEW] [server.js](file:///home/epitech/technicalTest/coach-training-simulator/server/server.js)
- Express.js minimal server (proxy to avoid exposing API key in frontend)
- `POST /api/simulate` → calls OpenAI for client simulation
- `POST /api/evaluate` → calls OpenAI for response evaluation
- Loads `.env` for API key
- Serves Vite dev output in dev mode

---

### UI Layer (`src/`)

#### [NEW] [index.html](file:///home/epitech/technicalTest/coach-training-simulator/index.html)
- Single page with tab navigation: **Dashboard** | **Training** | **Details**
- Semantic HTML5 structure

#### [NEW] [src/styles/main.css](file:///home/epitech/technicalTest/coach-training-simulator/src/styles/main.css)
- Design system: dark theme, CSS variables, Inter font
- Glassmorphism cards, smooth transitions, radar chart styling
- Responsive layout (works on 360px+)

#### [NEW] [src/main.js](file:///home/epitech/technicalTest/coach-training-simulator/src/main.js)
- App entry point, initializes modules, sets up routing/tabs

#### [NEW] [src/views/dashboard.js](file:///home/epitech/technicalTest/coach-training-simulator/src/views/dashboard.js)
- **Performance radar chart** (Canvas-based, no library) plotting all 9 markers
- **Score cards** for each evaluated marker
- **Gap analysis** — highlights missed markers with recommended actions
- **Meeting summary** pulled from feedback field

#### [NEW] [src/views/training.js](file:///home/epitech/technicalTest/coach-training-simulator/src/views/training.js)
- Step-by-step chat-like simulation interface
- Shows current marker context (what's expected)
- User types their sales pitch → AI responds as client
- Real-time evaluation feedback after each marker
- Progress bar showing markers completed

#### [NEW] [src/views/details.js](file:///home/epitech/technicalTest/coach-training-simulator/src/views/details.js)
- Full marker breakdown with scores, comments, and transcript excerpts
- Expandable sections per marker

#### [NEW] [src/components/radarChart.js](file:///home/epitech/technicalTest/coach-training-simulator/src/components/radarChart.js)
- Vanilla Canvas radar/spider chart component
- Plots marker scores on axes

#### [NEW] [src/components/chatBubble.js](file:///home/epitech/technicalTest/coach-training-simulator/src/components/chatBubble.js)
- Reusable chat message component for the training simulation

#### [NEW] [src/components/markerCard.js](file:///home/epitech/technicalTest/coach-training-simulator/src/components/markerCard.js)
- Card component showing marker score, status, and quick feedback

---

## Verification Plan

### Automated — Dev Server & Build

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Verify it starts without errors (check terminal output for "ready in X ms")
```

### Browser — Visual & Functional

1. **Dashboard tab**: Open `http://localhost:5173` — verify radar chart renders with 9 axes, score cards display for 6 evaluated markers, 3 missed markers are highlighted
2. **Training tab**: Click "Start Training" — verify the simulation starts with the weakest marker first, user can type responses, AI (or mock) responds
3. **Details tab**: Verify all markers are listed with their evaluations and transcript excerpts
4. **Responsive**: Resize browser to 375px width — verify layout adapts

### Manual — AI Integration (requires API key)

1. Add `OPENAI_API_KEY=sk-...` to `.env`
2. Start the app, go to Training tab
3. Type a sales pitch response — verify AI generates a contextual client response
4. Complete a marker — verify structured evaluation appears with score, strengths, and improvements

> [!TIP]
> Without an API key, the app still works with mock/template responses, so the UI and logic can be fully verified without one.
