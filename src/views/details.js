/**
 * Details View
 * Full marker breakdown with accordion, evaluations, and transcript excerpts.
 */

import { getMarkers } from '../modules/planLoader.js';
import {
  getEvaluationMap,
  getMeetingFeedback,
  getTranscript,
  getPerformanceSummary,
} from '../modules/meetingAnalyzer.js';

/**
 * Renders the details view.
 * @param {HTMLElement} container
 */
export function renderDetails(container) {
  const markers = getMarkers();
  const evalMap = getEvaluationMap();
  const summary = getPerformanceSummary();
  const transcript = getTranscript();

  container.innerHTML = `
    <!-- Meeting Summary -->
    <div class="details-section">
      <div class="details-section-title">📋 Résumé du meeting</div>
      <div class="card">
        <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px;">
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem;">Client</span>
            <div style="font-weight: 600;">${summary.meetingTitle}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem;">Catégorie</span>
            <div style="font-weight: 600;">${summary.category}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem;">Date</span>
            <div style="font-weight: 600;">${new Date(summary.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.75rem;">Moyenne</span>
            <div style="font-weight: 600;">${summary.averageGrade} / ${summary.maxGrade}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Markers Accordion -->
    <div class="details-section">
      <div class="details-section-title">🎯 Marqueurs du plan de vente (${markers.length})</div>
      <div class="accordion" id="markers-accordion"></div>
    </div>

    <!-- Transcript -->
    <div class="details-section">
      <div class="details-section-title">🎙️ Transcript (${transcript.length} segments)</div>
      <div class="card" style="max-height: 500px; overflow-y: auto;">
        <div id="transcript-display"></div>
      </div>
    </div>
  `;

  // Build accordion
  const accordion = container.querySelector('#markers-accordion');
  accordion.innerHTML = '';
  markers.forEach((marker) => {
    const ev = evalMap.get(marker.title);
    const item = document.createElement('div');
    item.className = 'accordion-item';

    const hasEval = ev != null;
    const grade = hasEval ? ev.grade : null;
    const statusIcon = !hasEval ? '⬜' : grade >= 4 ? '🟢' : grade >= 3 ? '🔵' : grade >= 2 ? '🟡' : '🔴';
    const gradeText = hasEval ? `${grade.toFixed(1)} / 5` : 'Non détecté';

    item.innerHTML = `
      <button class="accordion-trigger">
        <span style="display: flex; align-items: center; gap: 12px;">
          <span style="min-width: 24px; text-align: center; font-size: 0.75rem; color: var(--text-muted);">${marker.display_order}</span>
          <span>${statusIcon}</span>
          <span>${marker.title}</span>
        </span>
        <span style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${gradeText}</span>
          <span class="chevron">▾</span>
        </span>
      </button>
      <div class="accordion-content">
        <div style="margin-bottom: 12px;">
          <strong style="color: var(--text-accent);">Description :</strong>
          <p style="margin-top: 4px; line-height: 1.6;">${marker.short_description}</p>
        </div>
        
        ${hasEval && ev.comment ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: var(--color-warning);">Commentaire du coach :</strong>
            <p style="margin-top: 4px; line-height: 1.6; font-style: italic;">${ev.comment}</p>
          </div>
        ` : ''}

        ${!hasEval ? `
          <div style="padding: 12px; background: var(--color-danger-bg); border-radius: 8px; color: var(--color-danger); font-size: 0.875rem;">
            ⚠️ Ce marqueur n'a pas été détecté lors du meeting. Il est recommandé de le travailler en entraînement.
          </div>
        ` : ''}
        
        <div style="margin-top: 12px;">
          <strong style="color: var(--text-muted); font-size: 0.75rem;">Détail complet :</strong>
          <div style="margin-top: 4px; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; max-height: 200px; overflow-y: auto;">
            ${marker.description.replace(/\\n/g, '<br>').replace(/•/g, '<br>•')}
          </div>
        </div>
      </div>
    `;

    // Toggle accordion
    item.querySelector('.accordion-trigger').addEventListener('click', () => {
      item.classList.toggle('open');
    });

    accordion.appendChild(item);
  });

  // Build transcript display
  const transcriptDisplay = container.querySelector('#transcript-display');
  const firstSegments = transcript.slice(0, 50); // Show first 50 segments

  firstSegments.forEach((seg) => {
    const div = document.createElement('div');
    div.className = 'transcript-segment';

    const startMin = Math.floor(seg.start_ms / 60000);
    const startSec = Math.floor((seg.start_ms % 60000) / 1000);
    const timeStr = `${startMin}:${startSec.toString().padStart(2, '0')}`;

    div.innerHTML = `
      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span class="transcript-time">${timeStr}</span>
        <span class="transcript-speaker ${seg.speaker}">${seg.speaker === 'commercial' ? 'Commercial' : 'Client'}</span>
      </div>
      <div class="transcript-text">${seg.text}</div>
    `;

    transcriptDisplay.appendChild(div);
  });

  if (transcript.length > 50) {
    const more = document.createElement('div');
    more.style.cssText = 'text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.75rem;';
    more.textContent = `… et ${transcript.length - 50} segments supplémentaires`;
    transcriptDisplay.appendChild(more);
  }
}
