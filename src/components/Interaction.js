export const Interaction = 'Interaction';

/**
 * @param {Object} interactions - Map of interaction types (e.g., 'touch') to results.
 * Example result: { type: 'modify_feeling', amount: { peaceful: -1 } }
 */
export function createInteraction(interactions = {}) {
    return {
        interactions
    };
}
