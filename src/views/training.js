/**
 * Training View
 * Interactive chat-based training simulation.
 * Steps through markers, prompts user for sales pitch,
 * gets AI client responses, and evaluates each marker.
 */

import {
  createSession,
  startSession,
  beginTraining,
  getCurrentMarker,
  submitResponse,
  addClientResponse,
  recordEvaluation,
  nextMarker,
  getProgress,
  getSessionSummary,
  STATES,
} from '../modules/trainingEngine.js';

import { getMarkers } from '../modules/planLoader.js';
import { getTrainingPriorities, getEvaluationMap } from '../modules/meetingAnalyzer.js';
import { renderRadarChart } from '../components/radarChart.js';

import { simulateClient, evaluateResponse } from '../services/aiService.js';
import {
  createChatBubble,
  createTypingIndicator,
  removeTypingIndicator,
} from '../components/chatBubble.js';

let session = null;

/**
 * Renders the training view into the given container.
 * @param {HTMLElement} container
 */
export function renderTraining(container) {
  // Session is created on start, not render
  // session = createSession();

  container.innerHTML = `
    <div class="training-container">
      <div class="training-header">
        <h2>🎯 Simulateur d'Entraînement</h2>
        <p>Pratiquez votre argumentaire commercial contre un client simulé par IA</p>
      </div>

      <!-- Start State -->
      <div id="training-start" style="text-align: center; padding: 48px 0;">
        <div style="font-size: 4rem; margin-bottom: 16px;">🏋️</div>
        <h3 style="margin-bottom: 8px; font-size: 1.25rem;">Prêt à vous entraîner ?</h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto;">
          L'entraînement suit votre plan de vente et priorise les marqueurs où vous avez le plus besoin de progresser.
          Un client virtuel répondra à vos arguments.
        </p>
        <button class="btn btn-primary" id="btn-start-training" style="margin-right: 16px;">
          Commencer l'entraînement complet
        </button>
        <button class="btn btn-secondary" id="btn-start-weak-training">
          S'entraîner sur les points faibles
        </button>
      </div>

      <!-- Active Training State (hidden initially) -->
      <div id="training-active" style="display: none;">
        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-bar-label">
            <span id="progress-label">Étape 1 / 9</span>
            <span id="progress-pct">0%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" id="progress-fill" style="width: 0%"></div>
          </div>
        </div>

        <!-- Current Marker Context -->
        <div class="marker-context" id="marker-context"></div>

        <!-- Chat area -->
        <div class="chat-area" id="chat-area"></div>

        <!-- Input -->
        <div class="chat-input-container" id="chat-input-container">
          <textarea
            class="chat-input"
            id="chat-input"
            placeholder="Tapez votre argumentaire commercial ici..."
            rows="2"
          ></textarea>
          <button class="btn-send" id="btn-send">Envoyer</button>
        </div>

        <!-- Evaluation + Next Controls (hidden) -->
        <div id="eval-controls" style="display: none; text-align: center; margin-top: 16px;">
          <button class="btn btn-primary" id="btn-next-marker">
            Marqueur suivant →
          </button>
        </div>
      </div>

      <!-- Complete State (hidden) -->
      <div id="training-complete" style="display: none;"></div>
    </div>
  `;

  // Event listeners
  container.querySelector('#btn-start-training').addEventListener('click', () => {
    handleStart({ filter: 'all' });
  });

  const btnWeak = container.querySelector('#btn-start-weak-training');
  const weakCount = getTrainingPriorities().filter(
    (p) => p.priority === 'missed' || p.priority === 'weak'
  ).length;

  if (weakCount === 0) {
    btnWeak.disabled = true;
    btnWeak.title = "Aucun point faible détecté ! Bravo !";
    btnWeak.style.opacity = "0.5";
    btnWeak.style.cursor = "not-allowed";
  }

  btnWeak.addEventListener('click', () => {
    handleStart({ filter: 'weak_only' });
  });

  container.querySelector('#btn-send').addEventListener('click', () => {
    handleSend();
  });

  container.querySelector('#chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  container.querySelector('#btn-next-marker').addEventListener('click', () => {
    handleNextMarker();
  });
}

function handleStart(options = {}) {
  session = createSession(options);
  startSession(session);
  beginTraining(session);

  document.getElementById('training-start').style.display = 'none';
  document.getElementById('training-active').style.display = 'block';

  renderCurrentMarker();
  addSystemMessage('L\'entraînement commence. Répondez comme si vous étiez en rendez-vous client.');
  showClientOpener();
}

function renderCurrentMarker() {
  const current = getCurrentMarker(session);
  if (!current) return;

  const progress = getProgress(session);
  document.getElementById('progress-label').textContent =
    `Étape ${progress.current} / ${progress.total}`;
  document.getElementById('progress-pct').textContent =
    `${progress.percentage}%`;
  document.getElementById('progress-fill').style.width =
    `${progress.percentage}%`;

  const ctx = document.getElementById('marker-context');
  const priorityColors = {
    missed: 'var(--priority-missed)',
    weak: 'var(--priority-weak)',
    ok: 'var(--priority-ok)',
    strong: 'var(--priority-strong)',
  };
  const priorityLabels = {
    missed: '🔴 Non détecté',
    weak: '🟡 À améliorer',
    ok: '🔵 Correct',
    strong: '🟢 Maîtrisé',
  };

  ctx.innerHTML = `
    <div class="marker-context-title">
      <span style="color: ${priorityColors[current.priority]}">
        ${priorityLabels[current.priority]}
      </span>
      <span>—</span>
      <span>${current.marker.title}</span>
    </div>
    <div class="marker-context-desc">${current.marker.short_description}</div>
  `;

  // Reset input state
  document.getElementById('chat-input-container').style.display = 'flex';
  document.getElementById('eval-controls').style.display = 'none';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-input').focus();
}

async function showClientOpener() {
  const current = getCurrentMarker(session);
  if (!current) return;

  // Show typing indicator
  const chatArea = document.getElementById('chat-area');
  chatArea.appendChild(createTypingIndicator());
  scrollChatToBottom();

  // Get AI client opener
  const clientResponse = await simulateClient(current.marker, []);
  removeTypingIndicator();

  addClientResponse(session, clientResponse);

  const bubble = createChatBubble('client', clientResponse);
  chatArea.appendChild(bubble);
  scrollChatToBottom();
}

async function handleSend() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  if (session.state !== STATES.ACTIVE_MARKER) return;

  input.value = '';

  // Add user bubble
  const chatArea = document.getElementById('chat-area');
  chatArea.appendChild(createChatBubble('user', text));
  scrollChatToBottom();

  // Submit to engine
  submitResponse(session, text);

  // Disable input while evaluating
  input.disabled = true;
  document.getElementById('btn-send').disabled = true;

  // Show typing indicator for AI evaluation
  chatArea.appendChild(createTypingIndicator());
  scrollChatToBottom();

  // Evaluate
  const current = getCurrentMarker(session);
  const evaluation = await evaluateResponse(text, current.marker);
  removeTypingIndicator();

  // Record evaluation
  recordEvaluation(session, evaluation);

  // Show evaluation card
  showEvaluation(evaluation);

  // Show next button or complete
  if (session.state === STATES.COMPLETE) {
    setTimeout(() => showComplete(), 1500);
  } else {
    document.getElementById('chat-input-container').style.display = 'none';
    document.getElementById('eval-controls').style.display = 'block';
  }
}

function showEvaluation(evaluation) {
  const chatArea = document.getElementById('chat-area');

  const evalCard = document.createElement('div');
  evalCard.className = 'evaluation-card';

  const scoreColor = evaluation.score >= 4
    ? 'var(--color-success)'
    : evaluation.score >= 3
      ? 'var(--color-info)'
      : evaluation.score >= 2
        ? 'var(--color-warning)'
        : 'var(--color-danger)';

  evalCard.innerHTML = `
    <div class="evaluation-header">
      <div class="evaluation-score" style="color: ${scoreColor}">${evaluation.score}/5</div>
      <div class="evaluation-score-label">Évaluation de cette étape</div>
    </div>
    
    <div class="evaluation-section strengths">
      <h4>✅ Points forts</h4>
      <ul>
        ${evaluation.strengths.map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div class="evaluation-section improvements">
      <h4>⚡ Axes d'amélioration</h4>
      <ul>
        ${evaluation.improvements.map((i) => `<li>${i}</li>`).join('')}
      </ul>
    </div>

    <div class="evaluation-advice">
      💡 ${evaluation.advice}
    </div>
  `;

  chatArea.appendChild(evalCard);
  scrollChatToBottom();
}

function handleNextMarker() {
  nextMarker(session);

  // Clear chat
  const chatArea = document.getElementById('chat-area');
  chatArea.innerHTML = '';

  // Re-enable input
  const input = document.getElementById('chat-input');
  input.disabled = false;
  document.getElementById('btn-send').disabled = false;

  renderCurrentMarker();
  addSystemMessage('Passons au marqueur suivant. Continuez votre argumentaire.');
  showClientOpener();
}

function showComplete() {
  document.getElementById('training-active').style.display = 'none';
  const completeDiv = document.getElementById('training-complete');
  completeDiv.style.display = 'block';

  const summary = getSessionSummary(session);

  // Prepare data for Radar Chart (Merge original + new scores)
  const allMarkers = getMarkers();
  const originalEvalMap = getEvaluationMap();

  const radarData = allMarkers.map(marker => {
    // 1. Try to find score from THIS session
    const sessionResult = session.results.find(r => r.marker.title === marker.title);

    let score = 0;
    if (sessionResult && sessionResult.evaluation) {
      score = sessionResult.evaluation.score;
    } else {
      // 2. Fallback to original meeting score
      const originalEval = originalEvalMap.get(marker.title);
      score = originalEval ? originalEval.grade : 0;
    }

    return {
      label: marker.title,
      value: score,
      maxValue: 5
    };
  });

  completeDiv.innerHTML = `
    <div class="session-complete">
      <div style="font-size: 4rem; margin-bottom: 16px;">🏆</div>
      <h2>Entraînement terminé !</h2>
      <div class="big-score">${summary.averageScore}/5</div>
      <p style="color: var(--text-secondary); margin-bottom: 8px;">
        Score moyen sur ${summary.completedMarkers} marqueurs
      </p>
      
      <div class="results-grid">
        ${summary.results
      .map((r) => {
        const score = r.evaluation ? r.evaluation.score : 0;
        const scoreColor =
          score >= 4
            ? 'var(--color-success)'
            : score >= 3
              ? 'var(--color-info)'
              : score >= 2
                ? 'var(--color-warning)'
                : 'var(--color-danger)';
        return `
              <div class="card" style="padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <div class="score-badge score-${Math.round(score)}">${score}</div>
                  <div style="font-weight: 600; font-size: 0.875rem;">${r.marker.title}</div>
                </div>
                <div class="priority-badge ${r.priority}" style="margin-bottom: 8px;">
                  ${r.priority === 'missed' ? 'Était absent' : r.priority === 'weak' ? 'Était faible' : r.priority === 'ok' ? 'Était correct' : 'Était fort'}
                </div>
                ${r.evaluation ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${r.evaluation.advice}</div>` : ''}
              </div>
            `;
      })
      .join('')}
      </div>

      <div style="margin-top: 32px;">
        <!-- Bottom: Global Radar Chart (Centered) -->
        <div style="max-width: 600px; margin: 0 auto; width: 100%;">
            <div class="card">
                <div class="card-header">
                    <div>
                         <div class="card-title">Progression Globale</div>
                         <div class="card-subtitle">Scores mis à jour</div>
                    </div>
                </div>
                <div class="radar-container" style="padding: 0; display: flex; justify-content: center;">
                    <canvas id="completion-radar-chart"></canvas>
                </div>
                 <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
                     <div class="stat-value gradient-text">${summary.averageScore}/5</div>
                     <div class="stat-label">Moyenne session</div>
                 </div>
            </div>
            
             <div style="margin-top: 32px; text-align: center;">
                <button class="btn btn-primary" id="btn-restart" style="width: 100%;">
                  🔄 Recommencer l'entraînement
                </button>
             </div>
        </div>
      </div>
    </div>
  `;

  // Render Radar Chart with larger size
  const canvas = completeDiv.querySelector('#completion-radar-chart');
  renderRadarChart(canvas, radarData, { size: 480 });

  completeDiv.querySelector('#btn-restart').addEventListener('click', () => {
    const trainingContainer = document.getElementById('tab-training');
    renderTraining(trainingContainer);
  });
}

function addSystemMessage(text) {
  const chatArea = document.getElementById('chat-area');
  chatArea.appendChild(createChatBubble('system', text));
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const chatArea = document.getElementById('chat-area');
  chatArea.scrollTop = chatArea.scrollHeight;
}
