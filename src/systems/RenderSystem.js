import { System } from '../ecs.js';
import { Position } from '../components/Position.js';
import { Renderable } from '../components/Renderable.js';

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

        const entities = world.query(Position, Renderable);

        for (const entity of entities) {
            const pos = world.getComponent(entity, Position);
            const renderable = world.getComponent(entity, Renderable);

            this.ctx.fillStyle = renderable.color;
            this.ctx.fillRect(pos.x, pos.y, renderable.width, renderable.height);
        }
    }
}
