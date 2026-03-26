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
    { color: '#4ade80', hope: '6666' }, // Green - Peaceful/Positive
    { color: '#facc15', hope: '8844' }, // Yellow - Joyful
    { color: '#fb7185', hope: '4488' }, // Rose - Loving/Serene
    { color: '#a78bfa', hope: '7557' }, // Purple - Dreamy
    { color: '#34d399', hope: '5785' }, // Emerald - Optimistic
    { color: '#fbbf24', hope: '8448' }, // Amber - Energetic/Happy
    { color: '#818cf8', hope: '6776' }, // Indigo - Deeply Peaceful
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
