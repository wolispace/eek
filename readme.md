# EEK - Experiment with ECS

https://wolispace.com/eek/

## Features
- ECS architecture
- Basic physics (movement, collision)
- Camera focus
- Zoom
- Frustum culling
- Collision detection
- FPS overlay with live entity count
- Dynamic entity spawning (+/- keys)

## Controls
| Key | Action |
|-----|--------|
| `W A S D` | Move player |
| Scroll wheel | Zoom in / out |
| `+` / `=` | Spawn 100 bouncers |
| `-` | Remove 100 bouncers |

## Entity state
Every entity has 4 'feelings' default to neutral but can go negative or positive.
Represented by a number 0 - 8 where 4 = newtral, 0 is max negative and 8 is max positive.

Happy      [#######--] (6)
Optomistic [###------] (3)
Peaceful   [#########] (8)
Energetic  [---------] (0)

This can be encoded and stored as a 4 digit number HOPE = 6380.

They 'decay' to neutral over time when the player is idle ie: 4444, however some 'buffs' will not decay eg an area gives Optomistic -2 (scary forrest) or carrying a stick raises Optomistic +1.

Every entity (tree, rock, animal, player even area) has the same 4 values.

A table of Interactions indicates what happens when an entity is interacted with:

Entity, Interaction, RequiredEntity, RequiredStates, ResultState, ResultEntity
Tree  , Bump       , Axe           , Energetic+2   , Happy-1 Peaceful-1 Optimistic+1, Wood,
Wood  , Carry      , Backpack      , ''            , Energetic-1 Optimistic+1, ''
Pond  , Sit        , ''            , ''            , Happy+1 Energetic+1 Optimistic+1, ''
Gate01, Move past  , ''            , Optimistic+2     , Optimistic-2, ''
Shrine, Sit        , ''            , ''            , Peaceful+4, ''
Frog01, Touch      , ''            , Peaceful+4    , Peaceful-2, 'QUEST COMPLETE'

Some entities share the same interactions eg: all trees do the same thing, but others are one-off like the Gate and Frog that is a specific quest relying on a Shrine being in a field behind a gate of Optimistic.

So maybe there are two lists, one being the default natural interactions of entities, the other being one-off unique quest interactions/conditions.


## Passing feelings
Happy      [#######--] (6) <i class="fa-solid fa-face-smile"></i>
Optomistic [#---+----] (0) <i class="fa-solid fa-glass-water"></i>
Peaceful  [########-] (7) <i class="fa-solid fa-peace"></i>
Energetic  [###-+----] (2) <i class="fa-solid fa-bolt-lightning"></i>

HOPE.

Every entity has a defautt HOPE, the player is 4444. Negative things like flying rocks can be 1144. Positive things like trees can be 5564.

Bumping into another entity will auto-trade feelings. +1 if the stat is > 4, -1 if the stat is < 4.

So if the player is 6244 and bump into a tree 5654, we calculate the impact of each:
H player 6 is +2 so tree 5 is 5 + 1 = 6
O player 2 is -2 so tree 6 is 6 - 1 = 5
P player 4 is 0 so tree 5 is 5 + 0 = 5
E player 4 is 0 so tree 4 is 4 + 0 = 4

And for the player, using the initial values 6244 and 5654:
H tree is 5 is +1 so player 6 is 6 + 1 = 7
O tree is 6 is +2 so player 2 is 2 + 1 = 3
P tree is 5 is +1 so player 4 is 4 + 1 = 5
E tree is 4 is 0 so player 4 is 4 + 0 = 4

So the player is now 7354 and the tree is 6554.

Another example: player is 2222 and bumps into a rock 2345.
H player 2 is -2 so rock 2 is 2 - 1 = 1
O player 2 is -2 so rock 3 is 3 - 1 = 2
P player 2 is -2 so rock 4 is 4 - 1 = 3
E player 2 is -2 so rock 5 is 5 - 1 = 4

And for the player, using the initial values 2222 and 2345:
H rock is 2 is -2 so player 2 is 2 - 1 = 1
O rock is 3 is -1 so player 2 is 2 - 1 = 1
P rock is 4 is 0 so player 2 is 2 + 0 = 2
E rock is 5 is +1 so player 2 is 2 + 1 = 3

So the player is now 1123 and the rock is 1234.


## Buffs
Each entrity can have zero, one or more buffs applied to their feelings

Player: 6628
Buff (ring of happiness) : 6444 [happy is +2 from avg 4] 
Player now: 8628
Buff (cursed hat of sadness) : 0444 [happy -4 from avg 4]
Player now: 2628
Remove hat and player back to 8628

So buffs are attached to other entities, disconnect the entry from the player the buff is removed.

We do not need random entities (rings, hats etc..) just yet, we will only use areas as the way for adding a buff for now.

## Areas
The world is divided into areas 5x5 grid, and each cell has a chance of being an area that applies a buff. eg a calming beach may increase happines, peace and energy by one = 5455.

The areas buff is applied and removed when the moving entity (player or bouncer  etc..) is over the area or not, like other stackable buffs.

## Walls
Areas (not every cell in the grid) are surrounded by rectangular walls on all 4 side (unless at the edge of the world).

Each wall has one entrance that is a gap in the wall that is twice the size of the playet so easy to get thought.

The position of the entrance will be random along the length of the wall, no more than 2 player widths from either end

To cross the wall via the entrance a specific valie of HOPE muct be met or exceeded.

A wall with requirement to pass of 6444 would allow entties through that are 6 or more happy, and 4 or more for the others.

This number should be shown on the wallm, in the same way the areas are named and show their HOPE values.

The walls will ultimatly be like inpassable dense forests or pile of immovable stones so they should be about 2 player widths thick.  

## Movement
I think the touch controls are a bit slippery on mobile, so ples add yet nother form of input that is a semi-transparent joystick (bottom left) that consistes of a stick (circle) within a larger circle and depending on how far you mive the stick from the centre dictates velocity, and the direction dictates the movement vector.

It should be configurable so I can easiy turn it on or off in code for now.





