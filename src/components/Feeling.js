export const Feeling = 'Feeling';

export function createFeeling(happy = 4, optimistic = 4, peaceful = 4, energetic = 4) {
    const f = {
        // Effective values (used by UI, other systems)
        happy: Math.min(8, Math.max(0, happy)),
        optimistic: Math.min(8, Math.max(0, optimistic)),
        peaceful: Math.min(8, Math.max(0, peaceful)),
        energetic: Math.min(8, Math.max(0, energetic)),
        // Base values (the "truer" self, before buffs, affected by decay and transfers)
        baseHappy: Math.min(8, Math.max(0, happy)),
        baseOptimistic: Math.min(8, Math.max(0, optimistic)),
        basePeaceful: Math.min(8, Math.max(0, peaceful)),
        baseEnergetic: Math.min(8, Math.max(0, energetic))
    };
    // The 'default' state that this entity decays toward
    f.default = {
        happy: f.baseHappy,
        optimistic: f.baseOptimistic,
        peaceful: f.basePeaceful,
        energetic: f.baseEnergetic
    };
    return f;
}
