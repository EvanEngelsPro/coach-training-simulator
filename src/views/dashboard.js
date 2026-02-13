/**
 * Dashboard View
 * Displays meeting performance overview with radar chart, stat cards,
 * gap analysis, and marker score cards.
 */

import { renderRadarChart } from '../components/radarChart.js';
import { createMarkerCard } from '../components/markerCard.js';
import { getMarkers } from '../modules/planLoader.js';
import {
  getPerformanceSummary,
  getEvaluationMap,
  getTrainingPriorities,
  getMeetingFeedback,
} from '../modules/meetingAnalyzer.js';

/**
 * Renders the dashboard view into the given container.
 * @param {HTMLElement} container
 */
export function renderDashboard(container) {
  const summary = getPerformanceSummary();
  const markers = getMarkers();
  const evalMap = getEvaluationMap();
  const priorities = getTrainingPriorities();

  container.innerHTML = `
    <div class="dashboard-grid">
      <!-- Stats Row -->
      <div class="full-width stats-row" id="stats-row">
        <div class="stat-card">
          <div class="stat-value gradient-text">${summary.averageGrade}</div>
          <div class="stat-label">Moyenne / ${summary.maxGrade}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-success)">${summary.completionRate}%</div>
          <div class="stat-label">Complétion</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-danger)">${summary.missedMarkers}</div>
          <div class="stat-label">Marqueurs manqués</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-warning)">${summary.weakMarkers}</div>
          <div class="stat-label">À améliorer</div>
        </div>
      </div>

      <!-- Radar Chart -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Performance Radar</div>
            <div class="card-subtitle">${summary.category} — ${summary.meetingTitle}</div>
          </div>
        </div>
        <div class="radar-container">
          <canvas id="radar-chart"></canvas>
        </div>

        <!-- Post-Training Radar (Hidden by default) -->
        <div id="post-training-container" style="display: none; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border-subtle);">
            <div class="card-header">
              <div>
                <div class="card-title" style="font-size: 1rem; color: var(--text-accent);">Après Entraînement</div>
                <div class="card-subtitle" id="post-training-date"></div>
              </div>
            </div>
            <div class="radar-container">
              <canvas id="post-training-radar-chart"></canvas>
            </div>
        </div>
      </div>

      <!-- Gap Analysis -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Analyse des écarts</div>
            <div class="card-subtitle">Priorités d'entraînement</div>
          </div>
        </div>
        <div class="markers-list" id="gap-analysis-list"></div>
      </div>

      <!-- Full Marker Breakdown -->
      <div class="card full-width">
        <div class="card-header">
          <div>
            <div class="card-title">Détail des marqueurs</div>
            <div class="card-subtitle">${summary.evaluatedMarkers} évalués sur ${summary.totalMarkers}</div>
          </div>
        </div>
        <div class="markers-list" id="markers-list"></div>
      </div>
    </div>
  `;

  // Render radar chart
  const radarCanvas = container.querySelector('#radar-chart');
  if (radarCanvas) {
    const radarData = markers.map((m) => {
      const ev = evalMap.get(m.title);
      return {
        label: m.title,
        value: ev ? ev.grade : 0,
        maxValue: 5,
      };
    });
    renderRadarChart(radarCanvas, radarData, { size: 420 });
  }

  // Render gap analysis (top priorities only)
  const gapList = container.querySelector('#gap-analysis-list');
  if (gapList) {
    const topPriorities = priorities.filter(
      (p) => p.priority === 'missed' || p.priority === 'weak'
    );

    if (topPriorities.length === 0) {
      gapList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--color-success);">
          ✅ Aucun écart critique détecté. Excellent travail !
        </div>
      `;
    } else {
      topPriorities.forEach((p) => {
        gapList.appendChild(
          createMarkerCard(p.marker, p.evaluation, p.priority)
        );
      });
    }
  }

  // Render all markers
  const markersList = container.querySelector('#markers-list');
  if (markersList) {
    priorities.forEach((p) => {
      markersList.appendChild(
        createMarkerCard(p.marker, p.evaluation, p.priority)
      );
    });
  }

  // Render Post-Training Radar
  const savedData = localStorage.getItem('training_radar_data');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      const postContainer = container.querySelector('#post-training-container');
      if (postContainer) {
        postContainer.style.display = 'block';

        const dateElem = container.querySelector('#post-training-date');
        const date = new Date(parsed.date);
        if (dateElem) {
          dateElem.textContent = `Simulé le ${date.toLocaleDateString()} à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        const postCanvas = container.querySelector('#post-training-radar-chart');
        if (postCanvas) {
          renderRadarChart(postCanvas, parsed.data, { size: 420 });
        }
      }
    } catch (e) {
      console.error('Failed to load training data', e);
    }
  }
}
