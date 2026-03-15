export const Components = {
    Position: 'Position',       // { x, y }
    Velocity: 'Velocity',       // { dx, dy }
    Renderable: 'Renderable',   // { width, height, color }
    PlayerControl: 'PlayerControl' // { speed }
};

// Factory functions for creating component data easily
export const createPosition = (x = 0, y = 0) => ({ x, y });
export const createVelocity = (dx = 0, dy = 0) => ({ dx, dy });
export const createRenderable = (width = 30, height = 30, color = 'red') => ({ width, height, color });
export const createPlayerControl = (speed = 200) => ({ speed });
