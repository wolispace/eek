import { System } from '../ecs.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Collidable } from '../components/Collidable.js';
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
        const entities = world.query(Position, Renderable, Velocity, Collidable);
        
        // 1. Insert all collidable entities into the spatial hash grid
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const pos = world.getComponent(entity, Position);
            const renderable = world.getComponent(entity, Renderable);
            
            this.grid.insert(entity, pos.x, pos.y, renderable.width, renderable.height);
        }

        // Reusable array to prevent allocation per frame/entity
        if (!this.nearbyBuffer) this.nearbyBuffer = [];

        // 2. Query grid for potential collisions and resolve
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const pos1 = world.getComponent(entity, Position);
            const vel1 = world.getComponent(entity, Velocity);
            const render1 = world.getComponent(entity, Renderable);
            
            // Get nearby entities into our buffer
            this.grid.findNear(pos1.x, pos1.y, render1.width, render1.height, this.nearbyBuffer);

            for (let j = 0; j < this.nearbyBuffer.length; j++) {
                const other = this.nearbyBuffer[j];

                // Only evaluate each pair once! 
                // Because each pair is composed of two distinct integer IDs, 
                // processing only when entity < other guarantees exactly one check.
                if (entity >= other) continue;

                const pos2 = world.getComponent(other, Position);
                const vel2 = world.getComponent(other, Velocity);
                const render2 = world.getComponent(other, Renderable);

                // Simple AABB overlap check
                if (
                    pos1.x < pos2.x + render2.width &&
                    pos1.x + render1.width > pos2.x &&
                    pos1.y < pos2.y + render2.height &&
                    pos1.y + render1.height > pos2.y
                ) {
                    // Very simple bouncy elastic collision approximation: 
                    // To prevent sticking, separate them slightly, then swap velocities.
                    
                    // Finding the axis of least penetration
                    const overlapLeft = (pos1.x + render1.width) - pos2.x;
                    const overlapRight = (pos2.x + render2.width) - pos1.x;
                    const overlapTop = (pos1.y + render1.height) - pos2.y;
                    const overlapBottom = (pos2.y + render2.height) - pos1.y;

                    const minOverlap = Math.min(Math.abs(overlapLeft), Math.abs(overlapRight), Math.abs(overlapTop), Math.abs(overlapBottom));

                    if (minOverlap === Math.abs(overlapLeft)) {
                        pos1.x -= minOverlap / 2;
                        pos2.x += minOverlap / 2;
                        let tempDx = vel1.dx;
                        vel1.dx = vel2.dx;
                        vel2.dx = tempDx;
                    } else if (minOverlap === Math.abs(overlapRight)) {
                        pos1.x += minOverlap / 2;
                        pos2.x -= minOverlap / 2;
                        let tempDx = vel1.dx;
                        vel1.dx = vel2.dx;
                        vel2.dx = tempDx;
                    } else if (minOverlap === Math.abs(overlapTop)) {
                        pos1.y -= minOverlap / 2;
                        pos2.y += minOverlap / 2;
                        let tempDy = vel1.dy;
                        vel1.dy = vel2.dy;
                        vel2.dy = tempDy;
                    } else if (minOverlap === Math.abs(overlapBottom)) {
                        pos1.y += minOverlap / 2;
                        pos2.y -= minOverlap / 2;
                        let tempDy = vel1.dy;
                        vel1.dy = vel2.dy;
                        vel2.dy = tempDy;
                    }
                }
            }
        }
    }
}
