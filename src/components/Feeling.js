export const Feeling = 'Feeling';

export function createFeeling(happy = 4, energetic = 4, courageous = 4, peaceful = 4) {
    return {
        happy: Math.min(8, Math.max(0, happy)),
        energetic: Math.min(8, Math.max(0, energetic)),
        courageous: Math.min(8, Math.max(0, courageous)),
        peaceful: Math.min(8, Math.max(0, peaceful))
    };
}
