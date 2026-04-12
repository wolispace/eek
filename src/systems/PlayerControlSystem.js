import { System } from '../ecs.js';
import { PlayerControl } from '../components/PlayerControl.js';
import { Velocity } from '../components/Velocity.js';
import { Position } from '../components/Position.js';
import { Renderable } from '../components/Renderable.js';

export class PlayerControlSystem extends System {
    init(world) {
        this.keys = {};
        this.pointer = { active: false, x: 0, y: 0 };

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        const updatePointer = (e) => {
            const evt = e.touches && e.touches.length > 0 ? e.touches[0] : e;
            this.pointer.x = evt.clientX;
            this.pointer.y = evt.clientY;
        };

        const onPointerDown = (e) => {
            if (e.target.closest && e.target.closest('#trade-dialog-overlay, .trade-dialog, button, #status-bar')) {
                return;
            }
            this.pointer.active = true;
            updatePointer(e);
        };

        const onPointerMove = (e) => {
            if (this.pointer.active) updatePointer(e);
        };

        const onPointerUp = () => {
            this.pointer.active = false;
        };

        // Pointer events cover both mouse and touch for modern browsers
        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
    }

    update(world, deltaTime) {
        const entities = world.query(PlayerControl, Velocity, Position, Renderable);

        for (const entity of entities) {
            const vel = world.getComponent(entity, Velocity);
            const control = world.getComponent(entity, PlayerControl);
            const pos = world.getComponent(entity, Position);
            const ren = world.getComponent(entity, Renderable);

            let inputDx = 0;
            let inputDy = 0;

            if (this.keys['ArrowUp'] || this.keys['KeyW']) inputDy -= 1;
            if (this.keys['ArrowDown'] || this.keys['KeyS']) inputDy += 1;
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) inputDx -= 1;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) inputDx += 1;

            if (this.pointer.active) {
                const playerX = pos.x + ren.width / 2;
                const playerY = pos.y + ren.height / 2;
                
                const targetX = (this.pointer.x / world.cameraZoom) + world.cameraX;
                const targetY = (this.pointer.y / world.cameraZoom) + world.cameraY;
                
                const dx = targetX - playerX;
                const dy = targetY - playerY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // A buffer radius that stops the player before they reach exactly under the pointer. 
                // Tinker with this variable to adjust how far away the player stops from the touch point!
                const TARGET_BUFFER_RADIUS = 60; 
                
                if (dist > TARGET_BUFFER_RADIUS) {
                    inputDx += dx / dist;
                    inputDy += dy / dist;
                }
            }

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
