Ä/**
 * Sales Plan Loader
 * Parses and structures the sales plan markers into a usable format.
 */

import salesPlan from '../../sales-plan.json';

const markers = salesPlan.markers
    .slice()
    .sort((a, b) => a.display_order - b.display_order);

/**
 * Returns all markers sorted by display_order.
 * @returns {Array<{title: string, display_order: number, description: string, short_description: string}>}
 */
export function getMarkers() {
    return markers;
}

/**
 * Returns a single marker by title (case-insensitive).
 * @param {string} title
 */
export function getMarkerByTitle(title) {
    return markers.find(
        (m) => m.title.toLowerCase() === title.toLowerCase()
    ) || null;
}

/**
 * Returns ordered marker titles.
 * @returns {string[]}
 */
export function getMarkerTitles() {
    return markers.map((m) => m.title);
}

/**
 * Returns the sales plan category.
 * @returns {string}
 */
export function getPlanCategory() {
    return salesPlan.category;
}

/**
 * Returns total number of markers.
 */
export function getMarkerCount() {
    return markers.length;
}
Ä"(996a410f24ac3af52efca0169f0bd5f23d5a6e4c2Ufile:///home/epitech/technicalTest/coach-training-simulator/src/modules/planLoader.js:;file:///home/epitech/technicalTest/coach-training-simulator