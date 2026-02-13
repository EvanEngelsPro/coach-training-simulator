/**
 * Chat Bubble Component
 * Creates DOM elements for chat messages.
 */

/**
 * Creates a chat bubble element.
 * @param {'user'|'client'|'system'} role
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createChatBubble(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;

    const labels = {
        user: '🎯 Commercial (vous)',
        client: '👤 Client (IA)',
        system: '📋 Coach',
    };

    const label = document.createElement('div');
    label.className = 'chat-bubble-label';
    label.textContent = labels[role] || '';

    const content = document.createElement('div');
    content.className = 'chat-bubble-text';
    content.textContent = text;

    if (role !== 'system') {
        bubble.appendChild(label);
    }
    bubble.appendChild(content);

    return bubble;
}

/**
 * Creates a typing indicator bubble.
 * @returns {HTMLElement}
 */
export function createTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble client';
    bubble.id = 'typing-indicator';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';

    bubble.appendChild(indicator);
    return bubble;
}

/**
 * Removes the typing indicator if present.
 */
export function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}
