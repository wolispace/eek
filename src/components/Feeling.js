export const Feeling = 'Feeling';

export function createFeeling(happy = 4, optimistic = 4, peaceful = 4, energetic = 4) {
    return {
        happy: Math.min(8, Math.max(0, happy)),
        optimistic: Math.min(8, Math.max(0, optimistic)),
        peaceful: Math.min(8, Math.max(0, peaceful)),
        energetic: Math.min(8, Math.max(0, energetic))
    };
}
