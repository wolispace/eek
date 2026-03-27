export const FEELING_CONFIG = {
    // Colors
    H: { bright: '#facc15', dull: '#facc15' }, // Yellow
    O: { bright: '#60a5fa', dull: '#60a5fa' }, // Blue
    P: { bright: '#f472b6', dull: '#f472b6' }, // Pink
    E: { bright: '#4ade80', dull: '#4ade80' }, // Green

    // H: { bright: '#facc15', dull: '#713f12' }, // Yellow
    // O: { bright: '#60a5fa', dull: '#1e3a8a' }, // Blue
    // P: { bright: '#f472b6', dull: '#831843' }, // Pink
    // E: { bright: '#4ade80', dull: '#064e3b' }, // Green

    emptyBar: '#444444',
    iconColor: '#000000',

    // Layout
    gap: 0.5, // Very thin gap between bars
    segments: 8, // 0-8 scale
    widthScale: 0.9, // Most of the width
    heightScale: 0.6, // 2/3 of the height (approx)
    thickness: 1.1, // Overall bar thickness (1 = default, 1.1 = 10% larger)

    // Icons (Now just letters as requested)
    icons: {
        happy: 'H',
        optimistic: 'O',
        peaceful: 'P',
        energetic: 'E'
    }
};
