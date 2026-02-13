/**
 * AI Service
 * Wraps calls to the backend API proxy for OpenAI interactions.
 * Falls back to mock responses if API is unavailable.
 */

import {
    buildSimulationPrompt,
    buildEvaluationPrompt,
    parseEvaluationResponse,
    generateMockClientResponse,
    generateMockEvaluation,
} from '../modules/evaluator.js';

let apiAvailable = null; // null = unknown, true/false after first call

/**
 * Tests if the API is available.
 */
async function checkApiAvailability() {
    try {
        const res = await fetch('/api/health');
        apiAvailable = res.ok;
    } catch {
        apiAvailable = false;
    }
    return apiAvailable;
}

/**
 * Simulates a client response during training.
 * @param {object} marker - Current marker being practiced
 * @param {Array} conversationHistory - Previous exchanges
 * @returns {Promise<string>} Client response text
 */
export async function simulateClient(marker, conversationHistory = []) {
    if (apiAvailable === null) await checkApiAvailability();

    if (!apiAvailable) {
        // Simulate a small delay for mock responses
        await new Promise((r) => setTimeout(r, 800));
        return generateMockClientResponse(marker);
    }

    try {
        const prompt = buildSimulationPrompt(marker, conversationHistory);
        const res = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt: prompt,
                userMessage: conversationHistory.length
                    ? conversationHistory[conversationHistory.length - 1].text
                    : 'Bonjour, commençons le rendez-vous.',
            }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        return data.response;
    } catch {
        return generateMockClientResponse(marker);
    }
}

/**
 * Evaluates a user response against a marker definition.
 * @param {string} userResponse
 * @param {object} marker
 * @returns {Promise<{score: number, strengths: string[], improvements: string[], advice: string}>}
 */
export async function evaluateResponse(userResponse, marker) {
    if (apiAvailable === null) await checkApiAvailability();

    if (!apiAvailable) {
        await new Promise((r) => setTimeout(r, 600));
        return generateMockEvaluation();
    }

    try {
        const prompt = buildEvaluationPrompt(marker);
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt: prompt,
                userMessage: userResponse,
            }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        return parseEvaluationResponse(data.response);
    } catch {
        return generateMockEvaluation();
    }
}

/**
 * Returns whether the AI API is available.
 */
export async function isApiAvailable() {
    if (apiAvailable === null) await checkApiAvailability();
    return apiAvailable;
}
