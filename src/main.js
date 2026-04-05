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
import { Buff, createBuff } from './components/Buff.js';
import { createArea } from './components/Area.js';
import { Gate, createGate } from './components/Gate.js';
import { BuffSystem } from './systems/BuffSystem.js';
import { BOUNCER_CONFIGS, STATIC_CONFIGS, decodeHope } from './utils/EntityConfigs.js';

const worldX = 10000;
const worldY = 10000;
const world = new World(worldX, worldY);

// Add systems (Order matters: Input -> Logic -> Collision -> Camera -> Render)
world.addSystem(new PlayerControlSystem());
world.addSystem(new MovementSystem());
world.addSystem(new CollisionSystem());
world.addSystem(new BuffSystem());
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
world.addComponent(player, Buff, createBuff());

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
    world.addComponent(bouncer, Buff, createBuff());

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

// Initialize Grid Areas
const areaConfigs = [
    { name: 'Calm Beach', color: 'rgba(30, 144, 255, 0.3)', hope: '5465' },
    { name: 'Scary Forest', color: 'rgba(47, 79, 79, 0.3)', hope: '3323' },
    { name: 'Sunny Meadow', color: 'rgba(144, 238, 144, 0.3)', hope: '6556' },
    { name: 'Crystal Cave', color: 'rgba(224, 255, 255, 0.3)', hope: '4574' },
    { name: 'Volcano', color: 'rgba(255, 69, 0, 0.3)', hope: '2217' }
];

const WALL_THICKNESS = 80;
const GATE_SIZE = 80;

function createWallEntity(x, y, w, h) {
    const wall = world.createEntity();
    world.addComponent(wall, Position, createPosition(x, y));
    world.addComponent(wall, Renderable, createRenderable(w, h, '#4b5563')); // Slate grey
    world.addComponent(wall, Collidable, createCollidable());
}

function createGateEntity(x, y, w, h, hreq, oreq, preq, ereq) {
    const gate = world.createEntity();
    world.addComponent(gate, Position, createPosition(x, y));
    world.addComponent(gate, Renderable, createRenderable(w, h, 'rgba(255, 255, 255, 0.1)')); // Subtle glass effect
    world.addComponent(gate, Collidable, createCollidable());
    world.addComponent(gate, Gate, createGate(hreq, oreq, preq, ereq));
}

function spawnWallSegment(x1, y1, x2, y2) {
    const isHorizontal = y1 === y2;
    const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);

    // Entrance must be at least 2 player widths (80) from ends.
    // Gate is 80 wide.
    const minPos = 160;
    const maxPos = length - 160 - GATE_SIZE;
    const gateStart = minPos + Math.random() * (maxPos - minPos);

    // Random HOPE requirement for the wall (one stat 5-7, others 4)
    const reqs = [0, 0, 0, 0];
    reqs[Math.floor(Math.random() * 4)] = 2 + Math.floor(Math.random() * 4);
    const [gh, go, gp, ge] = reqs;

    if (isHorizontal) {
        // Piece 1
        createWallEntity(x1, y1 - WALL_THICKNESS / 2, gateStart, WALL_THICKNESS);
        // Gate
        createGateEntity(x1 + gateStart, y1 - WALL_THICKNESS / 2, GATE_SIZE, WALL_THICKNESS, gh, go, gp, ge);
        // Piece 2
        createWallEntity(x1 + gateStart + GATE_SIZE, y1 - WALL_THICKNESS / 2, length - gateStart - GATE_SIZE, WALL_THICKNESS);
    } else {
        // Piece 1
        createWallEntity(x1 - WALL_THICKNESS / 2, y1, WALL_THICKNESS, gateStart);
        // Gate
        createGateEntity(x1 - WALL_THICKNESS / 2, y1 + gateStart, WALL_THICKNESS, GATE_SIZE, gh, go, gp, ge);
        // Piece 2
        createWallEntity(x1 - WALL_THICKNESS / 2, y1 + gateStart + GATE_SIZE, WALL_THICKNESS, length - gateStart - GATE_SIZE);
    }
}

const cellW = worldX / world.gridCols;
const cellH = worldY / world.gridRows;

// Fill random grid cells with areas
for (let r = 0; r < world.gridRows; r++) {
    for (let c = 0; c < world.gridCols; c++) {
        const i = r * world.gridCols + c;
        // 30% chance for a cell to have an area
        if (Math.random() < 0.3) {
            const config = areaConfigs[Math.floor(Math.random() * areaConfigs.length)];
            const [fh, fo, fp, fe] = decodeHope(config.hope);
            world.grid[i] = {
                ...createArea(fh, fo, fp, fe, config.name),
                color: config.color,
                hopeStr: config.hope
            };

            // Create walls around this area
            const x = c * cellW;
            const y = r * cellH;

            // Top
            if (r > 0) spawnWallSegment(x, y, x + cellW, y);
            // Bottom
            if (r < world.gridRows - 1) spawnWallSegment(x, y + cellH, x + cellW, y + cellH);
            // Left
            if (c > 0) spawnWallSegment(x, y, x, y + cellH);
            // Right
            if (c < world.gridCols - 1) spawnWallSegment(x + cellW, y, x + cellW, y + cellH);
        }
    }
}

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
