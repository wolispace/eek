import { System } from '../ecs.js';
import { Position } from '../components/Position.js';
import { Renderable } from '../components/Renderable.js';
import { Feeling } from '../components/Feeling.js';
import { Area } from '../components/Area.js';
import { FEELING_CONFIG } from '../utils/FeelingColors.js';

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
        const vpLeft = world.cameraX;
        const vpTop = world.cameraY;
        const vpRight = world.cameraX + this.canvas.width / zoom;
        const vpBottom = world.cameraY + this.canvas.height / zoom;

        // Two passes: Areas FIRST (background), then Others
        const areaEntities = [];
        const otherEntities = [];

        for (let i = 0; i < entities.length; i++) {
            const ent = entities[i];
            if (world.hasComponent(ent, Area)) areaEntities.push(ent);
            else otherEntities.push(ent);
        }

        const renderPass = (list, isAreaPass) => {
            for (const entity of list) {
                const pos = world.getComponent(entity, Position);
                const renderable = world.getComponent(entity, Renderable);

                // Frustum Culling
                if (
                    pos.x + renderable.width < vpLeft ||
                    pos.x > vpRight ||
                    pos.y + renderable.height < vpTop ||
                    pos.y > vpBottom
                ) {
                    continue;
                }

                const drawX = pos.x - world.cameraX;
                const drawY = pos.y - world.cameraY;

                this.ctx.save();
                this.ctx.fillStyle = renderable.color;

                if (isAreaPass) {
                    // Render area with a lighter touch / dashed border or overlay
                    this.ctx.globalAlpha = 0.3;
                    this.ctx.fillRect(drawX, drawY, renderable.width, renderable.height);
                    
                    // Draw name/label for area
                    const area = world.getComponent(entity, Area);
                    this.ctx.globalAlpha = 1.0;
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.font = '24px sans-serif';
                    this.ctx.fillText(area.name.toUpperCase(), drawX + 10, drawY + 30);
                } else {
                    if (renderable.radius > 0) {
                        this.ctx.beginPath();
                        this.ctx.roundRect(drawX, drawY, renderable.width, renderable.height, renderable.radius);
                        this.ctx.fill();
                    } else {
                        this.ctx.fillRect(drawX, drawY, renderable.width, renderable.height);
                    }

                    // Draw HOPE bars if the entity has feelings
                    const feelings = world.getComponent(entity, Feeling);
                    if (feelings) {
                        this.renderFeelingBars(this.ctx, drawX, drawY, renderable.width, renderable.height, feelings);
                    }
                }
                this.ctx.restore();
            }
        };

        renderPass(areaEntities, true);
        renderPass(otherEntities, false);

        this.ctx.restore();
    }

    renderFeelingBars(ctx, x, y, width, height, feelings) {
        const config = FEELING_CONFIG;
        const wScale = config.widthScale || 0.9;
        const hScale = config.heightScale || 0.6;
        const thickness = config.thickness || 1;

        // Total rows/bars = 4 (H, O, P, E)
        const barRows = 4;
        const totalUnits = config.segments + 1; // 1 letter + 8 steps
        const gap = config.gap || 0.5;

        const chartWidth = width * wScale;
        const chartHeight = height * hScale;

        // Separate width and height for bars
        const unitWidth = chartWidth / totalUnits;
        const baseUnitHeight = (chartHeight - (barRows - 1) * gap) / barRows;
        const unitHeight = baseUnitHeight * thickness;

        const rowKeys = [
            { key: 'happy', color: 'H', label: config.icons.happy },
            { key: 'optimistic', color: 'O', label: config.icons.optimistic },
            { key: 'peaceful', color: 'P', label: config.icons.peaceful },
            { key: 'energetic', color: 'E', label: config.icons.energetic }
        ];

        ctx.save();

        // Start from top-left with margins
        const offsetX = 1;
        const offsetY = 5; // User requested 5

        rowKeys.forEach((row, rowIndex) => {
            const rowY = y + offsetY + rowIndex * (unitHeight + gap);
            const value = feelings[row.key];
            const colors = config[row.color];

            // 1. Draw Letter in Black
            ctx.fillStyle = config.iconColor || '#000000';
            ctx.font = `bold ${Math.floor(unitHeight)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const labelX = x + offsetX + unitWidth / 2;
            const labelY = rowY + unitHeight / 2;
            ctx.fillText(row.label, labelX, labelY);

            // 2. Draw Solid Bar
            const barStartX = x + offsetX + unitWidth;
            const maxBarWidth = 8 * unitWidth;

            // Value portion width
            const feelingWidth = (value / 8) * maxBarWidth;
            const remainingWidth = maxBarWidth - feelingWidth;

            // Color logic: < 4 dull, >= 4 bright
            const feelingColor = value >= 4 ? colors.bright : colors.dull;

            // Draw feeling part
            if (feelingWidth > 0) {
                ctx.fillStyle = feelingColor;
                ctx.fillRect(barStartX, rowY, feelingWidth, unitHeight);
            }

            // Draw grey part
            if (remainingWidth > 0) {
                ctx.fillStyle = config.emptyBar;
                ctx.fillRect(barStartX + feelingWidth, rowY, remainingWidth, unitHeight);
            }
        });

        ctx.restore();
    }
}
