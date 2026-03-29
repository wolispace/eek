import { System } from '../ecs.js';
import { Feeling } from '../components/Feeling.js';
import { FEELING_CONFIG } from '../utils/FeelingColors.js';

export class TradeSystem extends System {
    constructor() {
        super();
        this.overlay = null;
        this.activeEntity = null;
        this.activePlayer = null;
    }

    init(world) {
        this.createUI(world);
    }

    createUI(world) {
        this.overlay = document.createElement('div');
        this.overlay.id = 'trade-dialog-overlay';
        this.overlay.innerHTML = `
            <div class="trade-dialog" id="trade-dialog-inner">
                <div class="dialog-header">
                   <button class="trade-close-square" id="trade-close-btn">&times;</button>
                </div>   
                <div class="trade-section" id="player-section">
                    <h3>Your Feelings</h3>
                    <div id="player-rows"></div>
                </div>
                <div class="trade-section" id="target-section">
                    <h3>Entity Feelings</h3>
                    <div id="target-rows"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) {
                this.close(world);
            }
        };

        document.getElementById('trade-close-btn').onclick = () => {
            this.close(world);
        };
    }

    show(world, player, target) {
        this.activePlayer = player;
        this.activeEntity = target;
        this.overlay.style.display = 'flex';
        this.render(world);
    }

    close(world) {
        this.overlay.style.display = 'none';
        world.isPaused = false;
        world.activeTrade = null;
        this.activeEntity = null;
        this.activePlayer = null;
    }

    render(world) {
        if (!this.activeEntity || !this.activePlayer) return;

        const pFeelings = world.getComponent(this.activePlayer, Feeling);
        const tFeelings = world.getComponent(this.activeEntity, Feeling);

        const targetRows = document.getElementById('target-rows');
        const playerRows = document.getElementById('player-rows');

        const keys = ['happy', 'optimistic', 'peaceful', 'energetic'];
        const labels = ['H', 'O', 'P', 'E'];

        targetRows.innerHTML = '';
        playerRows.innerHTML = '';

        keys.forEach((key, i) => {
            playerRows.appendChild(this.createRow(key, labels[i], pFeelings[key], false, world));
            targetRows.appendChild(this.createRow(key, labels[i], tFeelings[key], true, world));
        });
    }

    createRow(key, label, value, isTarget, world) {

        const labelIcons = {
            'H': '<i class="fa-solid fa-smile "></i>',
            'O': '<i class="fa-solid fa-sun "></i>',
            'P': '<i class="fa-solid fa-dove "></i>',
            'E': '<i class="fa-solid fa-bolt "></i>'
        };


        const row = document.createElement('div');
        row.className = 'trade-row';

        const labelEl = document.createElement('div');
        labelEl.className = 'trade-label';
        labelEl.innerHTML = labelIcons[label];
        row.appendChild(labelEl);

        const barContainer = document.createElement('div');
        barContainer.className = 'trade-bar-container';

        const fill = document.createElement('div');
        fill.className = 'trade-segment-fill';
        const colorKey = label; // H, O, P, E
        const color = value >= 4 ? FEELING_CONFIG[colorKey].bright : FEELING_CONFIG[colorKey].dull;
        fill.style.backgroundColor = color;
        fill.style.width = `${(value / 8) * 100}%`;

        const empty = document.createElement('div');
        empty.className = 'trade-segment-empty';

        barContainer.appendChild(fill);
        barContainer.appendChild(empty);
        row.appendChild(barContainer);

        if (!isTarget) {
            const controls = document.createElement('div');
            controls.className = 'trade-controls';

            const minusBtn = document.createElement('button');
            minusBtn.className = 'trade-btn';
            minusBtn.textContent = '+';
            minusBtn.onclick = () => this.trade(world, key, -1);

            const plusBtn = document.createElement('button');
            plusBtn.className = 'trade-btn';
            plusBtn.textContent = '-';
            plusBtn.onclick = () => this.trade(world, key, 1);

            controls.appendChild(minusBtn);
            controls.appendChild(plusBtn);
            row.appendChild(controls);
        }

        return row;
    }

    trade(world, key, delta) {
        const pFeelings = world.getComponent(this.activePlayer, Feeling);
        const tFeelings = world.getComponent(this.activeEntity, Feeling);

        if (delta > 0) {
            // Give to entity (remove from player)
            if (pFeelings[key] > 0 && tFeelings[key] < 8) {
                pFeelings[key]--;
                tFeelings[key]++;
            }
        } else {
            // Take from entity (give to player)
            if (tFeelings[key] > 0 && pFeelings[key] < 8) {
                tFeelings[key]--;
                pFeelings[key]++;
            }
        }
        this.render(world);
    }

    update(world, deltaTime) {
        if (world.activeTrade && !this.activeEntity) {
            this.show(world, world.activeTrade.player, world.activeTrade.target);
        }
    }
}
