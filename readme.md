# Simple experiment with ECS

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

Happy     [#######--] (6)
Energetic [###-+----] (2)
Couragous [#---+----] (0)
Peaceful  [########-] (7)

This can be encoed and stored as a 4 digit number 6207, its 'state'.

They 'decay' to neutral over time when the player is idle ie: 4444, however some 'buffs' will not decay eg a biome gives Couragous-2 (scary forrest) or carrying a stick raises courage +1.

Every entity (tree, rock, animal, player even biome) has the same 4 values.

A table of Interactions indicates what happens when an entity is interacted with:

Entity, Interaction, RequiredEntity, RequiredStates, ResultState, ResultEntity
Tree  , Bump       , Axe           , Energetic+2   , Happy-1 Peaceful-1 Courage+1, Wood,
Wood  , Carry      , Backpack      , ''            , Energetic-1 Courage+1, ''
Pond  , Sit        , ''            , ''            , Happy+1 Energetic+1 Courage+1, ''
Gate01, Move past  , ''            , Courage+2     , Courage-2, ''
Shrine, Sit        , ''            , ''            , Peaceful+4, ''
Frog01, Touch      , ''            , Peaceful+4    , Peaceful-2, 'QUEST COMPLETE'

Some entities share the same interactions eg: all trees do the same thing, but others are one-off like the Gate and Frog that is a specific quest relying on a Shrine being in a field behind a gate of courage.

So maybe there are two lists, one being th deault natural interactions of entities, the other being one-off unqie quest interactions/conditions.




