export const Collidable = 'Collidable';

export function createCollidable() {
    return {
        activeInteractions: new Set()
    };
}
