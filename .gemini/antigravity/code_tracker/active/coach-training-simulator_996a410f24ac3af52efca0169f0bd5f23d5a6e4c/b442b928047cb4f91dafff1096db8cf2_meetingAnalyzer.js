�//**
 * Meeting Analyzer
 * Cross-references meeting evaluations against the sales plan to identify
 * performance gaps, missed markers, and generate training recommendations.
 */

import meetingData from '../../meeting-details.json';
import { getMarkers } from './planLoader.js';

const meeting = meetingData.meeting;
const evaluations = meetingData.evaluations;
const transcript = meetingData.transcript;

/**
 * Returns evaluations mapped by marker title.
 * @returns {Map<string, {marker: string, grade: number, comment: string|null}>}
 */
export function getEvaluationMap() {
    const map = new Map();
    evaluations.forEach((ev) => {
        map.set(ev.marker, ev);
    });
    return map;
}

/**
 * Returns markers that were NOT evaluated (missed during the meeting).
 * @returns {Array<{title: string, display_order: number, description: string, short_description: string}>}
 */
export function getMissedMarkers() {
    const evalMap = getEvaluationMap();
    return getMarkers().filter((m) => !evalMap.has(m.title));
}

/**
 * Returns markers with scores at or below the given threshold.
 * @param {number} threshold - Maximum grade to consider "weak" (inclusive), default 2
 * @returns {Array<{marker: object, evaluation: object}>}
 */
export function getWeakMarkers(threshold = 2) {
    const evalMap = getEvaluationMap();
    return getMarkers()
        .filter((m) => {
            const ev = evalMap.get(m.title);
            return ev && ev.grade <= threshold;
        })
        .map((m) => ({
            marker: m,
            evaluation: evalMap.get(m.title),
        }));
}

/**
 * Returns markers with scores above the threshold (strong areas).
 * @param {number} threshold
 * @returns {Array<{marker: object, evaluation: object}>}
 */
export function getStrongMarkers(threshold = 3) {
    const evalMap = getEvaluationMap();
    return getMarkers()
        .filter((m) => {
            const ev = evalMap.get(m.title);
            return ev && ev.grade >= threshold;
        })
        .map((m) => ({
            marker: m,
            evaluation: evalMap.get(m.title),
        }));
}

/**
 * Returns a prioritized list of markers for training.
 * Order: missed markers → weak markers → remaining evaluated markers.
 * @returns {Array<{marker: object, evaluation: object|null, priority: 'missed'|'weak'|'ok'|'strong'}>}
 */
export function getTrainingPriorities() {
    const evalMap = getEvaluationMap();
    const allMarkers = getMarkers();
    const priorities = [];

    // First: missed markers (highest priority)
    allMarkers.forEach((m) => {
        if (!evalMap.has(m.title)) {
            priorities.push({
                marker: m,
                evaluation: null,
                priority: 'missed',
            });
        }
    });

    // Second: weak markers (≤ 2)
    allMarkers.forEach((m) => {
        const ev = evalMap.get(m.title);
        if (ev && ev.grade <= 2) {
            priorities.push({
                marker: m,
                evaluation: ev,
                priority: 'weak',
            });
        }
    });

    // Third: medium markers (3)
    allMarkers.forEach((m) => {
        const ev = evalMap.get(m.title);
        if (ev && ev.grade > 2 && ev.grade < 4) {
            priorities.push({
                marker: m,
                evaluation: ev,
                priority: 'ok',
            });
        }
    });

    // Fourth: strong markers (≥ 4)
    allMarkers.forEach((m) => {
        const ev = evalMap.get(m.title);
        if (ev && ev.grade >= 4) {
            priorities.push({
                marker: m,
                evaluation: ev,
                priority: 'strong',
            });
        }
    });

    return priorities;
}

/**
 * Returns a performance summary object.
 */
export function getPerformanceSummary() {
    const allMarkers = getMarkers();
    const evalMap = getEvaluationMap();
    const missed = getMissedMarkers();
    const weak = getWeakMarkers(2);
    const strong = getStrongMarkers(4);

    const grades = evaluations.map((e) => e.grade);
    const avgGrade = grades.length
        ? grades.reduce((a, b) => a + b, 0) / grades.length
        : 0;

    return {
        meetingTitle: meeting.title,
        category: meeting.category,
        date: meeting.created_at,
        totalMarkers: allMarkers.length,
        evaluatedMarkers: evaluations.length,
        missedMarkers: missed.length,
        weakMarkers: weak.length,
        strongMarkers: strong.length,
        averageGrade: Math.round(avgGrade * 10) / 10,
        maxGrade: 5,
        completionRate: Math.round((evaluations.length / allMarkers.length) * 100),
    };
}

/**
 * Returns structured meeting feedback by parsing the markdown content.
 * @returns {{summary: string|null, nextSteps: string|null, raw: string}}
 */
export function getMeetingFeedback() {
    const raw = meeting.feedback;

    const extractSection = (title) => {
        // Match content after "## Title" until the next "##" or end of string
        const regex = new RegExp(`## ${title}\\n([\\s\\S]*?)(?=\\n##|$)`);
        const match = raw.match(regex);
        return match ? match[1].trim() : null;
    };

    return {
        summary: extractSection('Résumé exécutif'),
        nextSteps: extractSection('Prochaines étapes'),
        raw: raw
    };
}

/**
 * Returns the full transcript.
 */
export function getTranscript() {
    return transcript;
}

/**
 * Returns all evaluations.
 */
export function getEvaluations() {
    return evaluations;
}

/**
 * Extracts transcript segments relevant to a given marker title by searching
 * for keyword matches in the transcript text.
 * @param {string} markerTitle
 * @param {number} maxSegments
 */
export function getTranscriptForMarker(markerTitle, maxSegments = 5) {
    const keywords = markerTitle.toLowerCase().split(/\s+/);
    return transcript
        .filter((seg) => {
            const text = seg.text.toLowerCase();
            return keywords.some((kw) => kw.length > 3 && text.includes(kw));
        })
        .slice(0, maxSegments);
}
�/"(996a410f24ac3af52efca0169f0bd5f23d5a6e4c2Zfile:///home/epitech/technicalTest/coach-training-simulator/src/modules/meetingAnalyzer.js:;file:///home/epitech/technicalTest/coach-training-simulator