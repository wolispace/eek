import { System } from '../ecs.js';
import { Feeling } from '../components/Feeling.js';
import { Buff } from '../components/Buff.js';
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
                <div class="trade-row-combined" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 16px;">
                    <div class="trade-label"></div> <!-- Spacer for H/O/P/E -->
                    <div class="trade-header-title">You</div>
                    <div class="trade-controls" style="visibility: hidden;">
                        <button class="trade-btn">&lt;</button>
                        <button class="trade-btn">&gt;</button>
                    </div>
                    <div class="trade-header-title">Them</div>
                </div>
                <div id="trade-rows"></div>
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

        const rowsContainer = document.getElementById('trade-rows');
        const keys = ['happy', 'optimistic', 'peaceful', 'energetic'];
        const labels = ['H', 'O', 'P', 'E'];

        rowsContainer.innerHTML = '';
        keys.forEach((key, i) => {
            const baseKey = 'base' + key.charAt(0).toUpperCase() + key.slice(1);
            // Display EFFECTIVE feelings in the bars
            rowsContainer.appendChild(this.createCombinedRow(baseKey, labels[i], pFeelings[key], tFeelings[key], world));
        });
    }

    createCombinedRow(baseKey, label, pValue, tValue, world) {
        const row = document.createElement('div');
        row.className = 'trade-row-combined';

        const labelEl = document.createElement('div');
        labelEl.className = 'trade-label';
        labelEl.textContent = label; // "H", "O", "P", "E"
        row.appendChild(labelEl);

        // Player Bar
        row.appendChild(this.createBar(label, pValue));

        // Controls
        const controls = document.createElement('div');
        controls.className = 'trade-controls';

        const takeBtn = document.createElement('button');
        takeBtn.className = 'trade-btn';
        takeBtn.textContent = '<';
        takeBtn.onclick = () => this.trade(world, baseKey, -1); // Give to Player (Them -> You)
        takeBtn.title = "Take feeling from them";

        const giveBtn = document.createElement('button');
        giveBtn.className = 'trade-btn';
        giveBtn.textContent = '>';
        giveBtn.onclick = () => this.trade(world, baseKey, 1); // Give to Target (You -> Them)
        giveBtn.title = "Give feeling to them";

        controls.appendChild(takeBtn);
        controls.appendChild(giveBtn);
        row.appendChild(controls);

        // Target Bar
        row.appendChild(this.createBar(label, tValue));

        return row;
    }

    createBar(label, value) {
        const bar = document.createElement('div');
        bar.className = 'trade-bar-container';

        const fill = document.createElement('div');
        fill.className = 'trade-segment-fill';
        const color = value >= 4 ? FEELING_CONFIG[label].bright : FEELING_CONFIG[label].dull;
        fill.style.backgroundColor = color;
        fill.style.width = `${(value / 8) * 100}%`;

        const empty = document.createElement('div');
        empty.className = 'trade-segment-empty';

        bar.appendChild(fill);
        bar.appendChild(empty);
        return bar;
    }

    trade(world, baseKey, delta) {
        const pFeelings = world.getComponent(this.activePlayer, Feeling);
        const tFeelings = world.getComponent(this.activeEntity, Feeling);

        if (delta > 0) {
            // Give to entity (remove from player)
            if (pFeelings[baseKey] > 0 && tFeelings[baseKey] < 8) {
                pFeelings[baseKey]--;
                tFeelings[baseKey]++;
            }
        } else {
            // Take from entity (give to player)
            if (tFeelings[baseKey] > 0 && pFeelings[baseKey] < 8) {
                tFeelings[baseKey]--;
                pFeelings[baseKey]++;
            }
        }
        // Force evaluation of effective feelings immediately so UI reflects change
        this.evaluateEffective(pFeelings, world.getComponent(this.activePlayer, Buff));
        this.evaluateEffective(tFeelings, world.getComponent(this.activeEntity, Buff));
        
        this.render(world);
    }

    evaluateEffective(feelings, buffComp) {
        let h = feelings.baseHappy;
        let o = feelings.baseOptimistic;
        let p = feelings.basePeaceful;
        let e = feelings.baseEnergetic;

        if (buffComp) {
            for (const b of buffComp.active) {
                h += (b.happy - 4);
                o += (b.optimistic - 4);
                p += (b.peaceful - 4);
                e += (b.energetic - 4);
            }
        }

        feelings.happy = Math.max(0, Math.min(8, h));
        feelings.optimistic = Math.max(0, Math.min(8, o));
        feelings.peaceful = Math.max(0, Math.min(8, p));
        feelings.energetic = Math.max(0, Math.min(8, e));
    }

    update(world, deltaTime) {
        if (world.activeTrade && !this.activeEntity) {
            this.show(world, world.activeTrade.player, world.activeTrade.target);
        }
    }
}
