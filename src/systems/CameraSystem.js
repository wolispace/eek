import { System } from '../ecs.js';
import { Position } from '../components/Position.js';
import { CameraFocus } from '../components/CameraFocus.js';
import { Renderable } from '../components/Renderable.js';

export class CameraSystem extends System {
    constructor() {
        super();
        this.edgeThreshold = 100; // px from edge before scrolling starts
    }

    update(world, deltaTime) {
        const focusEntities = world.query(Position, CameraFocus);
        
        // Assume single camera focus for now (the player)
        if (focusEntities.length === 0) return;
        
        const focusEntity = focusEntities[0];
        const pos = world.getComponent(focusEntity, Position);
        const renderable = world.getComponent(focusEntity, Renderable);

        // Center point of the focused entity
        const entityX = pos.x + (renderable ? renderable.width / 2 : 0);
        const entityY = pos.y + (renderable ? renderable.height / 2 : 0);

        // Calculate entity position on screen given current camera
        const screenX = entityX - world.cameraX;
        const screenY = entityY - world.cameraY;

        // Check horizontal boundaries
        if (screenX < this.edgeThreshold) {
            world.cameraX -= (this.edgeThreshold - screenX);
        } else if (screenX > window.innerWidth - this.edgeThreshold) {
            world.cameraX += (screenX - (window.innerWidth - this.edgeThreshold));
        }

        // Check vertical boundaries
        if (screenY < this.edgeThreshold) {
            world.cameraY -= (this.edgeThreshold - screenY);
        } else if (screenY > window.innerHeight - this.edgeThreshold) {
            world.cameraY += (screenY - (window.innerHeight - this.edgeThreshold));
        }

        // Clamp camera to world bounds (accounting for zoom)
        const zoom = world.cameraZoom;
        const visW = window.innerWidth  / zoom;
        const visH = window.innerHeight / zoom;
        world.cameraX = Math.max(0, Math.min(world.cameraX, world.width  - visW));
        world.cameraY = Math.max(0, Math.min(world.cameraY, world.height - visH));
    }
}
