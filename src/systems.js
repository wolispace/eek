import { System } from './ecs.js';
import { Components } from './components.js';

export class MovementSystem extends System {
    update(world, deltaTime) {
        const entities = world.query(Components.Position, Components.Velocity);

        for (const entity of entities) {
            const pos = world.getComponent(entity, Components.Position);
            const vel = world.getComponent(entity, Components.Velocity);
            const renderable = world.getComponent(entity, Components.Renderable);

            // Update position
            pos.x += vel.dx * deltaTime;
            pos.y += vel.dy * deltaTime;

            // Simple Screen bounce if it has a renderable component to know its size
            if (renderable) {
                if (pos.x < 0) {
                    pos.x = 0;
                    vel.dx *= -1;
                } else if (pos.x + renderable.width > window.innerWidth) {
                    pos.x = window.innerWidth - renderable.width;
                    vel.dx *= -1;
                }

                if (pos.y < 0) {
                    pos.y = 0;
                    vel.dy *= -1;
                } else if (pos.y + renderable.height > window.innerHeight) {
                    pos.y = window.innerHeight - renderable.height;
                    vel.dy *= -1;
                }
            }
        }
    }
}

export class PlayerControlSystem extends System {
    init(world) {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    update(world, deltaTime) {
        const entities = world.query(Components.PlayerControl, Components.Velocity);

        for (const entity of entities) {
            const vel = world.getComponent(entity, Components.Velocity);
            const control = world.getComponent(entity, Components.PlayerControl);

            let inputDx = 0;
            let inputDy = 0;

            if (this.keys['ArrowUp'] || this.keys['KeyW']) inputDy -= 1;
            if (this.keys['ArrowDown'] || this.keys['KeyS']) inputDy += 1;
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) inputDx -= 1;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) inputDx += 1;

            // Normalize diagonal movement
            if (inputDx !== 0 || inputDy !== 0) {
                const length = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
                inputDx /= length;
                inputDy /= length;
            }

            vel.dx = inputDx * control.speed;
            vel.dy = inputDy * control.speed;
        }
    }
}

export class RenderSystem extends System {
    init(world) {
        // The canvas and context might be passed in, or we can grab it globally
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Handle resize
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize(); // Initial sizing
    }

    update(world, deltaTime) {
        // Clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const entities = world.query(Components.Position, Components.Renderable);

        for (const entity of entities) {
            const pos = world.getComponent(entity, Components.Position);
            const renderable = world.getComponent(entity, Components.Renderable);

            this.ctx.fillStyle = renderable.color;
            this.ctx.fillRect(pos.x, pos.y, renderable.width, renderable.height);
        }
    }
}
