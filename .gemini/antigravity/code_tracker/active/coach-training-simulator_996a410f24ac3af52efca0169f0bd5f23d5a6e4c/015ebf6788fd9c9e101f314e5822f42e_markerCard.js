�/**
 * Marker Card Component
 * Displays a marker's score, status, and quick feedback.
 */

/**
 * Creates a marker card element.
 * @param {object} marker - The marker definition
 * @param {object|null} evaluation - The evaluation data (null if missed)
 * @param {string} priority - 'missed' | 'weak' | 'ok' | 'strong'
 * @returns {HTMLElement}
 */
export function createMarkerCard(marker, evaluation, priority) {
    const item = document.createElement('div');
    item.className = 'marker-item';

    // Order number
    const order = document.createElement('div');
    order.className = 'marker-order';
    order.textContent = marker.display_order;

    // Info
    const info = document.createElement('div');
    info.className = 'marker-info';

    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'center';
    titleRow.style.gap = '8px';
    titleRow.style.marginBottom = '4px';

    const title = document.createElement('div');
    title.className = 'marker-title';
    title.textContent = marker.title;

    const badge = document.createElement('span');
    badge.className = `priority-badge ${priority}`;
    const priorityLabels = {
        missed: 'Non détecté',
        weak: 'À améliorer',
        ok: 'Correct',
        strong: 'Maîtrisé',
    };
    badge.textContent = priorityLabels[priority] || priority;

    titleRow.appendChild(title);
    titleRow.appendChild(badge);

    const desc = document.createElement('div');
    desc.className = 'marker-description';
    desc.textContent = marker.short_description;

    info.appendChild(titleRow);
    info.appendChild(desc);

    // Comment if available
    if (evaluation && evaluation.comment) {
        const comment = document.createElement('div');
        comment.className = 'marker-comment';
        comment.textContent = evaluation.comment;
        info.appendChild(comment);
    }

    // Score badge
    const scoreContainer = document.createElement('div');
    if (evaluation) {
        const scoreBadge = document.createElement('div');
        const grade = Math.round(evaluation.grade);
        scoreBadge.className = `score-badge score-${grade}`;
        scoreBadge.textContent = evaluation.grade.toFixed(1);
        scoreContainer.appendChild(scoreBadge);
    } else {
        const noScore = document.createElement('div');
        noScore.className = 'score-badge score-1';
        noScore.textContent = '—';
        noScore.style.fontSize = '16px';
        scoreContainer.appendChild(noScore);
    }

    item.appendChild(order);
    item.appendChild(info);
    item.appendChild(scoreContainer);

    return item;
}
�"(996a410f24ac3af52efca0169f0bd5f23d5a6e4c2Xfile:///home/epitech/technicalTest/coach-training-simulator/src/components/markerCard.js:;file:///home/epitech/technicalTest/coach-training-simulator