º/**
 * Main Entry Point
 * Initializes the app, sets up tab navigation, and renders initial view.
 */

import { renderDashboard } from './views/dashboard.js';
import { renderTraining } from './views/training.js';
import { renderDetails } from './views/details.js';
import { isApiAvailable } from './services/aiService.js';

// Tab management
const tabMap = {
    dashboard: renderDashboard,
    training: renderTraining,
    details: renderDetails,
};

let activeTab = 'dashboard';

/**
 * Switches to a tab and renders its content.
 */
function switchTab(tabName) {
    if (!tabMap[tabName]) return;

    activeTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach((pane) => {
        pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });

    // Render content
    const container = document.getElementById(`tab-${tabName}`);
    tabMap[tabName](container);
}

/**
 * Initialize app
 */
async function init() {
    // Setup tab navigation
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Check API status
    const apiStatus = document.getElementById('api-status');
    try {
        const available = await isApiAvailable();
        apiStatus.innerHTML = available
            ? '<span class="status-dot online"></span> IA connect√©e'
            : '<span class="status-dot offline"></span> Mode d√©mo';
    } catch {
        apiStatus.innerHTML = '<span class="status-dot offline"></span> Mode d√©mo';
    }

    // Render initial tab
    switchTab('dashboard');
}

// Boot
init().catch(console.error);
º"(996a410f24ac3af52efca0169f0bd5f23d5a6e4c2Gfile:///home/epitech/technicalTest/coach-training-simulator/src/main.js:;file:///home/epitech/technicalTest/coach-training-simulator