import { System } from '../ecs.js';
import { Feeling } from '../components/Feeling.js';
import { PlayerControl } from '../components/PlayerControl.js';

export class FeelingSystem extends System {
    constructor() {
        super();
        this.decayAccumulator = 0;
        this.decayInterval = 5.0; // Decay every 5 seconds of idleness
        this.uiStatus = null;
    }

    init(world) {
        this.uiStatus = document.getElementById('status-bar');
        if (!this.uiStatus) {
            this.createUI();
        }
    }

    createUI() {
        this.uiStatus = document.createElement('div');
        this.uiStatus.id = 'status-bar';
        document.body.appendChild(this.uiStatus);
    }

    update(world, deltaTime) {
        this.decayAccumulator += deltaTime;
        const entitiesWithFeeling = world.query(Feeling);
        const shouldDecay = this.decayAccumulator >= this.decayInterval;

        for (let i = 0; i < entitiesWithFeeling.length; i++) {
            const entity = entitiesWithFeeling[i];
            const feelings = world.getComponent(entity, Feeling);

            // 1. Handle Universal Decay
            if (shouldDecay) {
                this.decayToDefault(feelings);
            }

            // 2. Update UI (only for player)
            if (world.getComponent(entity, PlayerControl)) {
                this.updateUI(feelings);
            }
        }

        if (shouldDecay) {
            this.decayAccumulator = 0;
        }
    }

    decayToDefault(feelings) {
        const keys = ['happy', 'optimistic', 'peaceful', 'energetic'];
        keys.forEach(key => {
            const baseline = feelings.default ? feelings.default[key] : 4;
            if (feelings[key] > baseline) feelings[key]--;
            else if (feelings[key] < baseline) feelings[key]++;
        });
    }

    static encode(feelings) {
        if (!feelings) return '????';
        return `${feelings.happy}${feelings.optimistic}${feelings.peaceful}${feelings.energetic}`;
    }

    static transferFeelings(from, to) {
        const keys = ['happy', 'optimistic', 'peaceful', 'energetic'];
        keys.forEach(key => {
            let needed = 4 - to[key];
            if (needed === 0) return;

            let actual = 0;
            if (needed > 0) {
                // 'to' needs positive energy (it's low)
                // 'from' gives up to all it has (down to 0)
                actual = Math.min(needed, from[key]);
            } else {
                // 'to' needs to lose energy (it's high)
                // 'from' takes up to its capacity (up to 8)
                actual = -Math.min(Math.abs(needed), 8 - from[key]);
            }

            to[key] += actual;
            from[key] -= actual;
        });
    }

    updateUI(feelings) {
        if (!this.uiStatus) return;

        const getIcons = (val, iconClass) => {
            let icons = '';
            for (let i = 0; i < 8; i++) {
                const isEmpty = i >= val;
                icons += `<i class="fa-solid ${iconClass} ${isEmpty ? 'empty-icon' : ''}"></i>`;
            }
            return `<div class="feeling-icons">${icons}</div>`;
        };

        // HOPE: Happy, Optimistic, Peaceful, Energetic
        this.uiStatus.innerHTML = `
            <div class="feeling-item" title="Happy">${getIcons(feelings.happy, 'fa-smile')}</div>
            <div class="feeling-item" title="Optimistic">${getIcons(feelings.optimistic, 'fa-glass-water')}</div>
            <div class="feeling-item" title="Peaceful">${getIcons(feelings.peaceful, 'fa-peace')}</div>
            <div class="feeling-item" title="Energetic">${getIcons(feelings.energetic, 'fa-bolt')}</div>
        `;
    }
}
