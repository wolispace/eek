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
        const playerEntities = world.query(Feeling, PlayerControl);
        if (playerEntities.length === 0) return;

        const player = playerEntities[0];
        const feelings = world.getComponent(player, Feeling);

        // 1. Handle Decay
        // For simplicity: if player is roughly stationary, decay to neutral (4)
        const vel = world.getComponent(player, 'Velocity');
        const isIdle = vel ? (Math.abs(vel.dx) < 1 && Math.abs(vel.dy) < 1) : true;

        if (isIdle) {
            this.decayAccumulator += deltaTime;
            if (this.decayAccumulator >= this.decayInterval) {
                this.decayAccumulator = 0;
                this.decayToNeutral(feelings);
            }
        } else {
            this.decayAccumulator = 0;
        }

        // 2. Update UI
        this.updateUI(feelings);
    }

    decayToNeutral(feelings) {
        const keys = ['happy', 'energetic', 'courageous', 'peaceful'];
        keys.forEach(key => {
            if (feelings[key] > 4) feelings[key]--;
            else if (feelings[key] < 4) feelings[key]++;
        });
    }

    updateUI(feelings) {
        if (!this.uiStatus) return;

        const getBar = (val) => {
            const filled = '#'.repeat(val);
            const empty = '-'.repeat(8 - val);
            return `[${filled}${empty}] (${val})`;
        };

        this.uiStatus.innerHTML = `
            <div class="feeling-item">Happy ${getBar(feelings.happy)}</div>
            <div class="feeling-item">Energetic ${getBar(feelings.energetic)}</div>
            <div class="feeling-item">Courageous ${getBar(feelings.courageous)}</div>
            <div class="feeling-item">Peaceful ${getBar(feelings.peaceful)}</div>
        `;
    }
}
