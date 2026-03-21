export const PlayerControl = 'PlayerControl';
export const createPlayerControl = (maxSpeed = 300, acceleration = 900, friction = 8) =>
    ({ maxSpeed, acceleration, friction });
