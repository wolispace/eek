export const Area = 'Area';

export function createArea(happy = 4, optimistic = 4, peaceful = 4, energetic = 4, name = 'Area') {
    return {
        happy,
        optimistic,
        peaceful,
        energetic,
        name
    };
}
