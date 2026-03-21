import { System } from '../ecs.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Collidable } from '../components/Collidable.js';
import { PlayerControl } from '../components/PlayerControl.js';
import { SpatialHashGrid } from '../utils/SpatialHashGrid.js';

export class CollisionSystem extends System {
    init(world) {
        // Divide world into 100x100 pixel cells.
        // 5000 / 100 = 50 cells across and down
        this.grid = new SpatialHashGrid(
            [[0, 0], [world.width, world.height]],
            [Math.ceil(world.width / 100), Math.ceil(world.height / 100)]
        );
    }

    update(world, deltaTime) {
        this.grid.clear();

        // Moving entities (have Velocity)
        const movers = world.query(Position, Renderable, Velocity, Collidable);
        // Static entities: have Collidable but NO Velocity
        const statics = world.query(Position, Renderable, Collidable).filter(
            e => !world.getComponent(e, Velocity)
        );

        // 1. Insert all collidable entities into the spatial hash grid
        for (let i = 0; i < movers.length; i++) {
            const e = movers[i];
            const pos = world.getComponent(e, Position);
            const ren = world.getComponent(e, Renderable);
            this.grid.insert(e, pos.x, pos.y, ren.width, ren.height);
        }
        for (let i = 0; i < statics.length; i++) {
            const e = statics[i];
            const pos = world.getComponent(e, Position);
            const ren = world.getComponent(e, Renderable);
            this.grid.insert(e, pos.x, pos.y, ren.width, ren.height);
        }

        // Build a Set for fast static lookup
        const staticSet = new Set(statics);

        // Reusable array to prevent allocation per frame/entity
        if (!this.nearbyBuffer) this.nearbyBuffer = [];

        // 2. For each mover, check nearby entities
        for (let i = 0; i < movers.length; i++) {
            const entity = movers[i];
            const pos1 = world.getComponent(entity, Position);
            const vel1 = world.getComponent(entity, Velocity);
            const ren1 = world.getComponent(entity, Renderable);
            const isPlayer = !!world.getComponent(entity, PlayerControl);

            this.grid.findNear(pos1.x, pos1.y, ren1.width, ren1.height, this.nearbyBuffer);

            for (let j = 0; j < this.nearbyBuffer.length; j++) {
                const other = this.nearbyBuffer[j];
                const isOtherStatic = staticSet.has(other);

                // For mover-vs-mover: only evaluate each pair once
                if (!isOtherStatic && entity >= other) continue;

                const pos2 = world.getComponent(other, Position);
                const ren2 = world.getComponent(other, Renderable);

                // AABB overlap check
                if (
                    pos1.x < pos2.x + ren2.width &&
                    pos1.x + ren1.width > pos2.x &&
                    pos1.y < pos2.y + ren2.height &&
                    pos1.y + ren1.height > pos2.y
                ) {
                    const overlapLeft   = (pos1.x + ren1.width)  - pos2.x;
                    const overlapRight  = (pos2.x + ren2.width)  - pos1.x;
                    const overlapTop    = (pos1.y + ren1.height) - pos2.y;
                    const overlapBottom = (pos2.y + ren2.height) - pos1.y;

                    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                    if (isOtherStatic) {
                        if (isPlayer) {
                            // Player SLIDING and CORNER SLIPPING logic
                            const slideNudge = 1000; // Forceful enough to slip corners
                            
                            if (minOverlap === overlapLeft) {
                                pos1.x -= overlapLeft;
                                vel1.dx = 0;
                                // Corner Slip: nudge toward nearest Y edge
                                const relY = (pos1.y + ren1.height / 2) - pos2.y;
                                if (relY < ren2.height / 2) vel1.dy -= slideNudge * deltaTime;
                                else vel1.dy += slideNudge * deltaTime;
                            } else if (minOverlap === overlapRight) {
                                pos1.x += overlapRight;
                                vel1.dx = 0;
                                const relY = (pos1.y + ren1.height / 2) - pos2.y;
                                if (relY < ren2.height / 2) vel1.dy -= slideNudge * deltaTime;
                                else vel1.dy += slideNudge * deltaTime;
                            } else if (minOverlap === overlapTop) {
                                pos1.y -= overlapTop;
                                vel1.dy = 0;
                                // Corner Slip: nudge toward nearest X edge
                                const relX = (pos1.x + ren1.width / 2) - pos2.x;
                                if (relX < ren2.width / 2) vel1.dx -= slideNudge * deltaTime;
                                else vel1.dx += slideNudge * deltaTime;
                            } else {
                                pos1.y += overlapBottom;
                                vel1.dy = 0;
                                const relX = (pos1.x + ren1.width / 2) - pos2.x;
                                if (relX < ren2.width / 2) vel1.dx -= slideNudge * deltaTime;
                                else vel1.dx += slideNudge * deltaTime;
                            }
                        } else {
                            // Non-player static collision (BOUNCE)
                            if (minOverlap === overlapLeft) {
                                pos1.x -= overlapLeft;
                                vel1.dx = -Math.abs(vel1.dx);
                            } else if (minOverlap === overlapRight) {
                                pos1.x += overlapRight;
                                vel1.dx = Math.abs(vel1.dx);
                            } else if (minOverlap === overlapTop) {
                                pos1.y -= overlapTop;
                                vel1.dy = -Math.abs(vel1.dy);
                            } else {
                                pos1.y += overlapBottom;
                                vel1.dy = Math.abs(vel1.dy);
                            }
                        }
                    } else {
                        // Mover vs mover: split separation and swap velocities
                        const vel2 = world.getComponent(other, Velocity);
                        if (minOverlap === overlapLeft) {
                            pos1.x -= minOverlap / 2;
                            pos2.x += minOverlap / 2;
                            let tmp = vel1.dx; vel1.dx = vel2.dx; vel2.dx = tmp;
                        } else if (minOverlap === overlapRight) {
                            pos1.x += minOverlap / 2;
                            pos2.x -= minOverlap / 2;
                            let tmp = vel1.dx; vel1.dx = vel2.dx; vel2.dx = tmp;
                        } else if (minOverlap === overlapTop) {
                            pos1.y -= minOverlap / 2;
                            pos2.y += minOverlap / 2;
                            let tmp = vel1.dy; vel1.dy = vel2.dy; vel2.dy = tmp;
                        } else {
                            pos1.y += minOverlap / 2;
                            pos2.y -= minOverlap / 2;
                            let tmp = vel1.dy; vel1.dy = vel2.dy; vel2.dy = tmp;
                        }
                    }
                }
            }
        }
    }
}
