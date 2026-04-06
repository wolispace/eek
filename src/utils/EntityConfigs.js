export const BOUNCER_CONFIGS = [
    { color: '#ef4444', hope: '2111' }, // Red - Sad/Tired
    { color: '#f97316', hope: '1211' }, // Orange - Frustrated
    { color: '#8b5cf6', hope: '1121' }, // Violet - Gloomy
    { color: '#0ea5e9', hope: '1112' }, // Sky - Cold
    { color: '#64748b', hope: '2200' }, // Slate - Burnt out
    { color: '#78716c', hope: '0022' }, // Stone - Empty/numb
    { color: '#ec4899', hope: '3113' }, // Pink - Anxious
    { color: '#06b6d4', hope: '1331' }  // Cyan - Restless
];

export const STATIC_CONFIGS = [
    { color: 'green', hope: '6666', tradable: true }, // Green - Peaceful/Positive
    { color: '#facc15', hope: '8844' }, // Yellow - Joyful
    { color: 'red', hope: '4488', tradable: true }, // Rose - Loving/Serene
    { color: '#a78bfa', hope: '7557' }, // Purple - Dreamy
    { color: 'blue', hope: '5785', tradable: true }, // Emerald - Optimistic
    { color: '#fbbf24', hope: '8448' }, // Amber - Energetic/Happy
    { color: 'black', hope: '6776', tradable: true }, // Indigo - Deeply Peaceful
    { color: '#2dd4bf', hope: '4884' }  // Teal - Calmly Optimistic
];

/**
 * Converts a 4-character HOPE string (e.g. '2441') into a feeling object arguments.
 * @param {string} hopeString 
 * @returns {number[]} [happy, optimistic, peaceful, energetic]
 */
export function decodeHope(hopeString) {
    if (!hopeString || hopeString.length !== 4) return [4, 4, 4, 4];
    return hopeString.split('').map(char => parseInt(char, 10));
}
