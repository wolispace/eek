import { System } from '../ecs.js';
import { Feeling } from '../components/Feeling.js';
import { Buff } from '../components/Buff.js';
import { Area } from '../components/Area.js';
import { Position } from '../components/Position.js';
import { Renderable } from '../components/Renderable.js';

export class BuffSystem extends System {
    update(world, deltaTime) {
        const feelingEntities = world.query(Feeling);
        const areas = world.query(Area, Position, Renderable);
        
        // Cache area data for better performance
        const areaData = areas.map(ae => ({
            comp: world.getComponent(ae, Area),
            pos: world.getComponent(ae, Position),
            ren: world.getComponent(ae, Renderable)
        }));

        for (let i = 0; i < feelingEntities.length; i++) {
            const entity = feelingEntities[i];
            const feelings = world.getComponent(entity, Feeling);
            const buffComp = world.getComponent(entity, Buff);
            
            // Start with base values
            let h = feelings.baseHappy;
            let o = feelings.baseOptimistic;
            let p = feelings.basePeaceful;
            let e = feelings.baseEnergetic;

            // Only entities with Buff component and Position/Renderable can pick up area buffs
            if (buffComp && world.hasComponent(entity, Position) && world.hasComponent(entity, Renderable)) {
                const pos = world.getComponent(entity, Position);
                const ren = world.getComponent(entity, Renderable);

                buffComp.active = [];

                for (let j = 0; j < areaData.length; j++) {
                    const { comp, pos: aPos, ren: aRen } = areaData[j];

                    // AABB overlap check
                    if (
                        pos.x < aPos.x + aRen.width &&
                        pos.x + ren.width > aPos.x &&
                        pos.y < aPos.y + aRen.height &&
                        pos.y + ren.height > aPos.y
                    ) {
                        buffComp.active.push(comp);
                        
                        h += (comp.happy - 4);
                        o += (comp.optimistic - 4);
                        p += (comp.peaceful - 4);
                        e += (comp.energetic - 4);
                    }
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
