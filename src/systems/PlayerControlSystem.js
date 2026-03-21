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

            // Normalize diagonal input
            if (inputDx !== 0 || inputDy !== 0) {
                const length = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
                inputDx /= length;
                inputDy /= length;

                // Move toward target velocity (input * maxSpeed)
                const targetVelX = inputDx * control.maxSpeed;
                const targetVelY = inputDy * control.maxSpeed;

                // acceleration here is "responsiveness", higher = faster to reach target
                const weight = 1 - Math.exp(-control.acceleration * deltaTime / 1000); // normalized unit
                // Using a simpler lerp-like approach for directness:
                vel.dx += (targetVelX - vel.dx) * (control.acceleration / 100) * deltaTime;
                vel.dy += (targetVelY - vel.dy) * (control.acceleration / 100) * deltaTime;
            } else {
                // Move toward zero velocity
                vel.dx += (0 - vel.dx) * (control.friction / 100) * deltaTime;
                vel.dy += (0 - vel.dy) * (control.friction / 100) * deltaTime;
            }

            // Still clamp to max speed just in case of overshoot
            const currentSpeedSq = vel.dx * vel.dx + vel.dy * vel.dy;
            if (currentSpeedSq > control.maxSpeed * control.maxSpeed) {
                const currentSpeed = Math.sqrt(currentSpeedSq);
                vel.dx = (vel.dx / currentSpeed) * control.maxSpeed;
                vel.dy = (vel.dy / currentSpeed) * control.maxSpeed;
            }

            // If velocity is very small, just set to zero to avoid jitter
            if (Math.abs(vel.dx) < 0.1) vel.dx = 0;
            if (Math.abs(vel.dy) < 0.1) vel.dy = 0;
        }
    }
}
