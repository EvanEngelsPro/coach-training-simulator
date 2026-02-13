/**
 * Evaluator
 * Builds prompts for AI evaluation and provides fallback mock evaluation.
 */

/**
 * Generates the system prompt for evaluating a user response against a marker.
 * @param {object} marker - The marker definition from the sales plan
 * @returns {string}
 */
export function buildEvaluationPrompt(marker) {
    return `Tu es un coach commercial expert. Tu dois évaluer la performance d'un commercial 
lors d'un exercice d'entraînement.

ÉTAPE À ÉVALUER : "${marker.title}"

CRITÈRES D'ÉVALUATION :
${marker.description}

CONSIGNES :
- Note de 1 à 5 (1 = très insuffisant, 5 = excellent)
- Identifie 1-3 points forts concrets
- Identifie 1-3 axes d'amélioration concrets  
- Donne un conseil actionnable pour le prochain rendez-vous
- Sois direct, constructif et pragmatique

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "score": <number 1-5>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "advice": "..."
}`;
}

/**
 * Generates the system prompt for simulating a realistic client.
 * @param {object} marker - Current marker being practiced
 * @param {Array} conversationHistory - Previous exchanges
 * @returns {string}  
 */
export function buildSimulationPrompt(marker, conversationHistory = []) {
    const historyText = conversationHistory
        .map((h) => `${h.role === 'user' ? 'Commercial' : 'Client'}: ${h.text}`)
        .join('\n');

    return `Tu joues le rôle d'un prospect/client réaliste dans un rendez-vous commercial B2B.

CONTEXTE : Le commercial est à l'étape "${marker.title}" de son plan de vente.

DESCRIPTION DE L'ÉTAPE :
${marker.short_description}

${historyText ? `HISTORIQUE DE LA CONVERSATION :\n${historyText}\n` : ''}
CONSIGNES POUR TON JEU DE RÔLE :
- Réagis de manière naturelle et réaliste
- Pose des questions pertinentes si le commercial est vague
- Montre de l'intérêt si le commercial fait bien son travail
- Soulève des objections légères si c'est réaliste pour cette étape
- Reste professionnel mais humain (hésitations, relances)
- Réponds en 2-4 phrases maximum
- NE SORS PAS du rôle de client

Réponds uniquement avec ta réplique de client, sans préfixe ni guillemets.`;
}

/**
 * Parses an AI evaluation response into a structured object.
 * @param {string} rawResponse
 * @returns {object}
 */
export function parseEvaluationResponse(rawResponse) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                score: Math.max(1, Math.min(5, Number(parsed.score) || 3)),
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
                advice: parsed.advice || 'Continue à pratiquer cette étape.',
            };
        }
    } catch (e) {
        // Fall through to mock
    }
    return generateMockEvaluation();
}

/**
 * Generates a mock evaluation for when AI is unavailable.
 * @returns {object}
 */
export function generateMockEvaluation() {
    return {
        score: 3,
        strengths: [
            'Bonne tentative de structuration du discours',
            'Approche professionnelle maintenue',
        ],
        improvements: [
            'Approfondir les questions de découverte',
            'Créer plus de lien personnel avec le client',
        ],
        advice:
            'Essaie de poser au moins 3 questions ouvertes avant de passer à la présentation. Cela montre un vrai intérêt pour le client.',
    };
}

/**
 * Generates a mock client response for when AI is unavailable.
 * @param {object} marker
 * @returns {string}
 */
export function generateMockClientResponse(marker) {
    const responses = {
        'Introduction personnelle':
            'Bonjour, ravi de vous rencontrer. J\'ai vu votre profil, c\'est un parcours intéressant. Mais dites-moi, concrètement, qu\'est-ce qui vous a amené à créer cette solution ?',
        'Présentation client':
            'On est une PME de 45 personnes, avec une équipe commerciale de 12 personnes. On fait du B2B dans le secteur industriel. Nos commerciaux sont plutôt terrain.',
        'Découverte client':
            'Notre problème principal, c\'est qu\'on n\'a aucune visibilité sur ce qui se passe sur le terrain. Les managers n\'ont pas le temps de faire des doubles visites, et les reportings CRM sont rarement remplis.',
        'Reformulation besoin':
            'Oui, c\'est exactement ça. Si vous arrivez à résoudre ce problème de visibilité terrain, ça changerait beaucoup de choses pour nous.',
        'Problématiques du secteur':
            'Effectivement, on observe les mêmes choses chez nos concurrents. C\'est un vrai sujet dans notre industrie. Mais comment vous vous différenciez des autres solutions ?',
        'Présentation Coach':
            'C\'est intéressant cette approche avant/pendant/après. Mais concrètement, comment ça se passe quand un commercial est chez un client ? Il doit manipuler son téléphone ?',
        'Cas Pratique':
            'C\'est impressionnant comme résultats. Vous avez d\'autres cas dans notre secteur ? On est assez spécifiques dans l\'industrie.',
        'Collecte d\'informations clés':
            'On utilise Salesforce comme CRM. Nos commerciaux font en moyenne 4 rendez-vous par semaine. Le panier moyen est autour de 25K€. On a deux managers pour les 12 commerciaux.',
        'Clôture et planification prochain rdv':
            'Oui, ça m\'intéresse. Il faudrait qu\'on en reparle avec mon directeur général. Est-ce que vous seriez disponible la semaine prochaine ?',
    };

    return (
        responses[marker.title] ||
        'Intéressant. Pouvez-vous m\'en dire plus sur ce point ?'
    );
}
