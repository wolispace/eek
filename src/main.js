import { World } from './ecs.js';
import { Components, createPosition, createVelocity, createRenderable, createPlayerControl } from './components.js';
import { MovementSystem, PlayerControlSystem, RenderSystem } from './systems.js';

const world = new World();

// Add systems (Order matters: Input -> Logic -> Render)
world.addSystem(new PlayerControlSystem());
world.addSystem(new MovementSystem());
world.addSystem(new RenderSystem());

// Create Player Entity
const player = world.createEntity();
world.addComponent(player, Components.Position, createPosition(window.innerWidth / 2, window.innerHeight / 2));
world.addComponent(player, Components.Velocity, createVelocity(0, 0));
world.addComponent(player, Components.Renderable, createRenderable(40, 40, '#00ffcc')); // Cyan player
world.addComponent(player, Components.PlayerControl, createPlayerControl(300)); // 300px per second

// Create Bouncing Entities
const numBouncers = 20;
const colors = ['#ff3366', '#ff9933', '#cc33ff', '#33ccff', '#ffeb3b'];

for (let i = 0; i < numBouncers; i++) {
    const bouncer = world.createEntity();
    const x = Math.random() * (window.innerWidth - 30);
    const y = Math.random() * (window.innerHeight - 30);

    // Random direction and speed
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 150; // 100-250px per second
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;

    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 20 + Math.random() * 20;

    world.addComponent(bouncer, Components.Position, createPosition(x, y));
    world.addComponent(bouncer, Components.Velocity, createVelocity(dx, dy));
    world.addComponent(bouncer, Components.Renderable, createRenderable(size, size, color));
}

// Game Loop
let lastTime = performance.now();

function gameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Cap deltaTime to prevent huge jumps if tab is inactive
    const safeDelta = Math.min(deltaTime, 0.1);

    world.update(safeDelta);

    requestAnimationFrame(gameLoop);
}

// Start loop
requestAnimationFrame(gameLoop);
