import { World } from './ecs.js';
import { Position, createPosition } from './components/Position.js';
import { Velocity, createVelocity } from './components/Velocity.js';
import { Renderable, createRenderable } from './components/Renderable.js';
import { PlayerControl, createPlayerControl } from './components/PlayerControl.js';
import { CameraFocus, createCameraFocus } from './components/CameraFocus.js';
import { Collidable, createCollidable } from './components/Collidable.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { PlayerControlSystem } from './systems/PlayerControlSystem.js';
import { CameraSystem } from './systems/CameraSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { Feeling, createFeeling } from './components/Feeling.js';
import { Interaction, createInteraction } from './components/Interaction.js';
import { FeelingSystem } from './systems/FeelingSystem.js';
import { TradeSystem } from './systems/TradeSystem.js';
import { createTradable } from './components/Tradable.js';
import { BOUNCER_CONFIGS, STATIC_CONFIGS, decodeHope } from './utils/EntityConfigs.js';

const worldX = 10000;
const worldY = 10000;
const world = new World(worldX, worldY);

// Add systems (Order matters: Input -> Logic -> Collision -> Camera -> Render)
world.addSystem(new PlayerControlSystem());
world.addSystem(new MovementSystem());
world.addSystem(new CollisionSystem());
world.addSystem(new FeelingSystem());
world.addSystem(new TradeSystem());
world.addSystem(new CameraSystem());
world.addSystem(new RenderSystem());

// Create Player Entity
const player = world.createEntity();
world.addComponent(player, Position, createPosition(window.innerWidth / 2, window.innerHeight / 2));
world.addComponent(player, Velocity, createVelocity(0, 0));
world.addComponent(player, Renderable, createRenderable(40, 40, 'white', 5)); // Rounded square player
world.addComponent(player, PlayerControl, createPlayerControl(1000, 200, 1000)); // maxSpeed, acceleration, friction
world.addComponent(player, CameraFocus, createCameraFocus());
world.addComponent(player, Collidable, createCollidable());
world.addComponent(player, Feeling, createFeeling(4, 4, 4, 4));

// Variations now handled in EntityConfigs.js
const bouncerIds = [];

function spawnBouncer() {
    const bouncer = world.createEntity();
    const x = Math.random() * (worldX - 30);
    const y = Math.random() * (worldY - 30);
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 150;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    const config = BOUNCER_CONFIGS[Math.floor(Math.random() * BOUNCER_CONFIGS.length)];
    const color = config.color;
    const size = 20 + Math.random() * 20;
    world.addComponent(bouncer, Position, createPosition(x, y));
    world.addComponent(bouncer, Velocity, createVelocity(dx, dy));
    world.addComponent(bouncer, Renderable, createRenderable(size, size, color));
    world.addComponent(bouncer, Collidable, createCollidable());

    // Apply curated HOPE values
    const [h, o, p, e] = decodeHope(config.hope);
    world.addComponent(bouncer, Feeling, createFeeling(h, o, p, e));

    bouncerIds.push(bouncer);
}

function spawnStatic() {
    const entity = world.createEntity();
    const x = Math.random() * worldX;
    const y = Math.random() * worldY;
    
    const config = STATIC_CONFIGS[Math.floor(Math.random() * STATIC_CONFIGS.length)];
    const color = config.color;
    const size = 15 + Math.random() * 45;
    world.addComponent(entity, Position, createPosition(x, y));
    world.addComponent(entity, Renderable, createRenderable(size, size, color));
    world.addComponent(entity, Collidable, createCollidable());

    // Apply curated HOPE values
    const [h, o, p, e] = decodeHope(config.hope);
    world.addComponent(entity, Feeling, createFeeling(h, o, p, e));

    if (config.tradable) {
        world.addComponent(entity, 'Tradable', createTradable());
    }
}

const numBouncers = 500;
for (let i = 0; i < numBouncers; i++) spawnBouncer();

const numStatics = 1000;
for (let i = 0; i < numStatics; i++) spawnStatic();

// +/- key controls
window.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') {
        for (let i = 0; i < 100; i++) spawnBouncer();
    } else if (e.key === '-') {
        const toRemove = Math.min(100, bouncerIds.length);
        for (let i = 0; i < toRemove; i++) {
            world.destroyEntity(bouncerIds.pop());
        }
    }
});

// FPS overlay
const fpsEl = document.getElementById('fps');
let fpsFrames = 0;
let fpsElapsed = 0;

// Game Loop
let lastTime = performance.now();

function gameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Cap deltaTime to prevent huge jumps if tab is inactive
    const safeDelta = Math.min(deltaTime, 0.1);

    world.update(safeDelta);

    // FPS counter
    fpsFrames++;
    fpsElapsed += deltaTime;
    if (fpsElapsed >= 1) {
        fpsEl.textContent = `FPS: ${fpsFrames}  |  Entities: ${bouncerIds.length}`;
        fpsFrames = 0;
        fpsElapsed -= 1;
    }

    requestAnimationFrame(gameLoop);
}

// Start loop
requestAnimationFrame(gameLoop);
