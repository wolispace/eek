import { System } from '../ecs.js';
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';

export class MovementSystem extends System {
    update(world, deltaTime) {
        const entities = world.query(Position, Velocity);

        for (const entity of entities) {
            const pos = world.getComponent(entity, Position);
            const vel = world.getComponent(entity, Velocity);
            const renderable = world.getComponent(entity, Renderable);

            // Update position
            pos.x += vel.dx * deltaTime;
            pos.y += vel.dy * deltaTime;

            // Simple Screen bounce if it has a renderable component to know its size
            if (renderable) {
                if (pos.x < 0) {
                    pos.x = 0;
                    vel.dx *= -1;
                } else if (pos.x + renderable.width > world.width) {
                    pos.x = world.width - renderable.width;
                    vel.dx *= -1;
                }

                if (pos.y < 0) {
                    pos.y = 0;
                    vel.dy *= -1;
                } else if (pos.y + renderable.height > world.height) {
                    pos.y = world.height - renderable.height;
                    vel.dy *= -1;
                }
            }
        }
    }
}
