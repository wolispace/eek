import { System } from '../ecs.js';
import { Feeling } from '../components/Feeling.js';
import { Buff } from '../components/Buff.js';
import { Position } from '../components/Position.js';

export class BuffSystem extends System {
    update(world, deltaTime) {
        const entities = world.query(Feeling, Position, Buff);
        
        const cellW = world.width / world.gridCols;
        const cellH = world.height / world.gridRows;
        
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const feelings = world.getComponent(entity, Feeling);
            const buffComp = world.getComponent(entity, Buff);
            const pos = world.getComponent(entity, Position);
            
            // Start with base values
            let h = feelings.baseHappy;
            let o = feelings.baseOptimistic;
            let p = feelings.basePeaceful;
            let e = feelings.baseEnergetic;

            buffComp.active = [];

            // Get grid cell coordinates
            const col = Math.floor(pos.x / cellW);
            const row = Math.floor(pos.y / cellH);

            if (col >= 0 && col < world.gridCols && row >= 0 && row < world.gridRows) {
                const gridIdx = row * world.gridCols + col;
                const area = world.grid[gridIdx];

                if (area) {
                    buffComp.active.push(area);
                    
                    h += (area.happy - 4);
                    o += (area.optimistic - 4);
                    p += (area.peaceful - 4);
                    e += (area.energetic - 4);
                }
            }

            // 3. Update effective feelings based on base + all active buffs
            const prevH = feelings.happy;
            const prevO = feelings.optimistic;
            const prevP = feelings.peaceful;
            const prevE = feelings.energetic;

            feelings.happy = Math.max(0, Math.min(8, h));
            feelings.optimistic = Math.max(0, Math.min(8, o));
            feelings.peaceful = Math.max(0, Math.min(8, p));
            feelings.energetic = Math.max(0, Math.min(8, e));

            // If effective feelings changed (e.g., entered/left an area), reset decay timer
            if (prevH !== feelings.happy || prevO !== feelings.optimistic || 
                prevP !== feelings.peaceful || prevE !== feelings.energetic) {
                feelings.decayTimer = 0;
            }
        }
    }
}
