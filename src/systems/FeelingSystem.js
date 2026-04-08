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
        const entitiesWithFeeling = world.query(Feeling);

        for (let i = 0; i < entitiesWithFeeling.length; i++) {
            const entity = entitiesWithFeeling[i];
            const feelings = world.getComponent(entity, Feeling);

            // 1. Handle Individual Decay
            feelings.decayTimer += deltaTime;
            if (feelings.decayTimer >= this.decayInterval) {
                this.decayToDefault(feelings);
                feelings.decayTimer = 0;
            }

            // 2. Update UI (only for player)
            if (world.getComponent(entity, PlayerControl)) {
                this.updateUI(feelings);
            }
        }
    }

    decayToDefault(feelings) {
        const keys = ['happy', 'optimistic', 'peaceful', 'energetic'];
        keys.forEach(key => {
            const baseKey = 'base' + key.charAt(0).toUpperCase() + key.slice(1);
            const baseline = feelings.default ? feelings.default[key] : 4;
            if (feelings[baseKey] > baseline) feelings[baseKey]--;
            else if (feelings[baseKey] < baseline) feelings[baseKey]++;
        });
    }

    static encode(feelings) {
        if (!feelings) return '????';
        return `${feelings.baseHappy}${feelings.baseOptimistic}${feelings.basePeaceful}${feelings.baseEnergetic}`;
    }

    static transferFeelings(feelings1, feelings2) {
        const keys = ['happy', 'optimistic', 'peaceful', 'energetic'];
        
        // Cache initial states so both are calculated from the same baseline
        const initial1 = {};
        const initial2 = {};
        
        keys.forEach(key => {
            const baseKey = 'base' + key.charAt(0).toUpperCase() + key.slice(1);
            initial1[baseKey] = feelings1[baseKey];
            initial2[baseKey] = feelings2[baseKey];
        });

        keys.forEach(key => {
            const baseKey = 'base' + key.charAt(0).toUpperCase() + key.slice(1);
            
            // +1 if > 4, -1 if < 4, 0 if = 4
            const impactOn2 = Math.sign(initial1[baseKey] - 4);
            const impactOn1 = Math.sign(initial2[baseKey] - 4);

            // Apply impact and restrict to range 0-8
            feelings1[baseKey] = Math.max(0, Math.min(8, initial1[baseKey] + impactOn1));
            feelings2[baseKey] = Math.max(0, Math.min(8, initial2[baseKey] + impactOn2));
        });

        // Reset decay timers on both entities because feelings were modified
        feelings1.decayTimer = 0;
        feelings2.decayTimer = 0;
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
