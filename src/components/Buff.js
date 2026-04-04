export const Buff = 'Buff';

export function createBuff() {
    return {
        /**
         * @type {Array<{id: string, name: string, happy: number, optimistic: number, peaceful: number, energetic: number}>}
         */
        active: []
    };
}
