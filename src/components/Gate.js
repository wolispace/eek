export const Gate = 'Gate';

export function createGate(happy = 0, optimistic = 0, peaceful = 0, energetic = 0) {
    return {
        happy,
        optimistic,
        peaceful,
        energetic,
        hopeStr: `${happy}${optimistic}${peaceful}${energetic}`
    };
}
