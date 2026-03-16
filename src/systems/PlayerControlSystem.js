import { System } from '../ecs.js';
import { PlayerControl } from '../components/PlayerControl.js';
import { Velocity } from '../components/Velocity.js';

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
        const entities = world.query(PlayerControl, Velocity);

        for (const entity of entities) {
            const vel = world.getComponent(entity, Velocity);
            const control = world.getComponent(entity, PlayerControl);

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
