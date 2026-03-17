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

        // Scroll-wheel / trackpad pinch zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
            const newZoom = Math.max(
                world.minZoom,
                Math.min(world.maxZoom, world.cameraZoom * zoomFactor)
            );

            // Zoom toward the cursor position
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // World-space point under the cursor before zoom
            const worldX = (mouseX / world.cameraZoom) + world.cameraX;
            const worldY = (mouseY / world.cameraZoom) + world.cameraY;

            world.cameraZoom = newZoom;

            // Adjust camera so the same world point stays under cursor
            world.cameraX = worldX - mouseX / newZoom;
            world.cameraY = worldY - mouseY / newZoom;
        }, { passive: false });
    }

    update(world, deltaTime) {
        const zoom = world.cameraZoom;

        // Clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply zoom transform
        this.ctx.save();
        this.ctx.scale(zoom, zoom);

        const entities = world.query(Position, Renderable);

        // Viewport bounds in world-space for culling
        const vpLeft   = world.cameraX;
        const vpTop    = world.cameraY;
        const vpRight  = world.cameraX + this.canvas.width  / zoom;
        const vpBottom = world.cameraY + this.canvas.height / zoom;

        for (const entity of entities) {
            const pos = world.getComponent(entity, Position);
            const renderable = world.getComponent(entity, Renderable);

            // Frustum Culling: skip drawing if entirely outside viewport
            if (
                pos.x + renderable.width  < vpLeft  ||
                pos.x                     > vpRight  ||
                pos.y + renderable.height < vpTop    ||
                pos.y                     > vpBottom
            ) {
                continue;
            }

            // Apply camera offset (in world-space, then scaled by zoom)
            const drawX = pos.x - world.cameraX;
            const drawY = pos.y - world.cameraY;

            this.ctx.fillStyle = renderable.color;
            this.ctx.fillRect(drawX, drawY, renderable.width, renderable.height);
        }

        this.ctx.restore();
    }
}
