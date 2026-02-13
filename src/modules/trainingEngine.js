/**
 * Training Engine
 * Orchestrates the simulation session as a state machine.
 * 
 * States: IDLE → BRIEFING → ACTIVE_MARKER → EVALUATING → NEXT_MARKER → COMPLETE
 */

import { getTrainingPriorities } from './meetingAnalyzer.js';

export const STATES = {
    IDLE: 'IDLE',
    BRIEFING: 'BRIEFING',
    ACTIVE_MARKER: 'ACTIVE_MARKER',
    EVALUATING: 'EVALUATING',
    NEXT_MARKER: 'NEXT_MARKER',
    COMPLETE: 'COMPLETE',
};

/**
 * Creates a new training session instance.
 * @returns {TrainingSession}
 */
export function createSession() {
    const priorities = getTrainingPriorities();

    const session = {
        state: STATES.IDLE,
        markers: priorities,
        currentIndex: 0,
        results: [],             // { marker, userResponse, evaluation, score }
        conversationHistory: [], // { role: 'user'|'client'|'system', text, markerTitle }
        startedAt: null,
        completedAt: null,
    };

    return session;
}

/**
 * Starts the session → moves to BRIEFING.
 */
export function startSession(session) {
    session.state = STATES.BRIEFING;
    session.startedAt = new Date().toISOString();
    session.currentIndex = 0;
    session.results = [];
    session.conversationHistory = [];
    return session;
}

/**
 * Moves from BRIEFING to the first marker.
 */
export function beginTraining(session) {
    session.state = STATES.ACTIVE_MARKER;
    return session;
}

/**
 * Returns the current marker to practice.
 */
export function getCurrentMarker(session) {
    if (session.currentIndex >= session.markers.length) return null;
    return session.markers[session.currentIndex];
}

/**
 * Records a user response for the current marker.
 */
export function submitResponse(session, userResponse) {
    const current = getCurrentMarker(session);
    if (!current) return session;

    session.conversationHistory.push({
        role: 'user',
        text: userResponse,
        markerTitle: current.marker.title,
    });

    session.state = STATES.EVALUATING;
    return session;
}

/**
 * Records a simulated client response.
 */
export function addClientResponse(session, clientResponse) {
    const current = getCurrentMarker(session);
    if (!current) return session;

    session.conversationHistory.push({
        role: 'client',
        text: clientResponse,
        markerTitle: current.marker.title,
    });

    return session;
}

/**
 * Records evaluation result for the current marker and advances.
 */
export function recordEvaluation(session, evaluation) {
    const current = getCurrentMarker(session);
    if (!current) return session;

    session.results.push({
        marker: current.marker,
        priority: current.priority,
        evaluation,
    });

    session.currentIndex++;

    if (session.currentIndex >= session.markers.length) {
        session.state = STATES.COMPLETE;
        session.completedAt = new Date().toISOString();
    } else {
        session.state = STATES.NEXT_MARKER;
    }

    return session;
}

/**
 * Advances from NEXT_MARKER to ACTIVE_MARKER.
 */
export function nextMarker(session) {
    session.state = STATES.ACTIVE_MARKER;
    return session;
}

/**
 * Returns session progress info.
 */
export function getProgress(session) {
    return {
        current: session.currentIndex + 1,
        total: session.markers.length,
        completed: session.results.length,
        percentage: Math.round((session.results.length / session.markers.length) * 100),
        state: session.state,
    };
}

/**
 * Returns a summary of session results.
 */
export function getSessionSummary(session) {
    if (session.results.length === 0) return null;

    const scores = session.results
        .filter((r) => r.evaluation && r.evaluation.score != null)
        .map((r) => r.evaluation.score);

    const avgScore = scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;

    return {
        totalMarkers: session.markers.length,
        completedMarkers: session.results.length,
        averageScore: avgScore,
        maxScore: 5,
        results: session.results,
        duration: session.startedAt && session.completedAt
            ? new Date(session.completedAt) - new Date(session.startedAt)
            : null,
    };
}
