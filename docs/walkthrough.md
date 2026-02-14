# Coach Training Simulator — Walkthrough

## What Was Built

An **interactive sales training simulator** that transforms static meeting feedback into an active practice platform. The app analyzes past meeting performance and lets sales reps practice against an AI-simulated client, guided by their sales plan.

## Architecture

```mermaid
graph TD
    A[sales-plan.json] --> B[planLoader]
    C[meeting-details.json] --> D[meetingAnalyzer]
    B --> E[trainingEngine]
    D --> E
    E --> F[evaluator]
    F --> G[aiService]
    G --> H[Express Server]
    H --> I[OpenAI API]
    E --> J[UI Views]
    J --> K[Dashboard]
    J --> L[Training Sim]
    J --> M[Details]
```

| Module | Role |
|---|---|
| [planLoader.js](../src/modules/planLoader.js) | Parses 9 sales plan markers |
| [meetingAnalyzer.js](../src/modules/meetingAnalyzer.js) | Cross-references evaluations, computes gaps |
| [trainingEngine.js](../src/modules/trainingEngine.js) | State machine for training sessions |
| [evaluator.js](../src/modules/evaluator.js) | Prompt engineering + mock fallbacks |
| [aiService.js](../src/services/aiService.js) | API calls with graceful degradation |
| [server.js](../server/server.js) | Express proxy to keep API key server-side |

## Screenshots

### Dashboard — Performance Analysis
Radar chart plotting all 9 markers, stat cards, gap priorities.

![Dashboard with radar chart, stats, and gap analysis](./images/dashboard_view_1770985730709.png)

---

### Training — Chat Simulation
Client IA sends opening message, user practices their pitch.

![Training session with AI client response](./images/training_session_start_1770985857102.png)

---

### Training — Evaluation Card
After submitting a response: score, strengths, improvements, actionable advice.

![Evaluation card showing 3/5 score with feedback](./images/training_evaluation_card_1770985950475.png)

---

### Details — Marker Accordion + Transcript
Full breakdown of all 9 markers with evaluations and 145-segment transcript.

![Details view with accordion markers](./images/details_tab_view_1770985788538.png)

## Recordings

![Dashboard navigation test](./records/dashboard_recording.webp)

![Training simulation flow test](./records/training_recording.webp)

## Verification Results

| Test | Result |
|---|---|
| Dev server starts (Vite + Express) | ✅ No errors |
| Dashboard renders (radar, stats, markers) | ✅ All elements visible |
| Training starts + client responds | ✅ Mock AI responds contextually |
| User submits pitch → evaluation appears | ✅ Score 3/5 + feedback |
| Details accordion + transcript | ✅ 9 markers + 145 segments |
| Console errors | ✅ None (only favicon 404) |

## How to Run

```bash
npm install
npm run dev
# → Vite: http://localhost:5173
# → API:  http://localhost:3001
```

For AI-powered simulation, add `OPENAI_API_KEY=sk-...` to `.env`.
