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

So maybe there are two lists, one being the default natural interactions of entities, the other being one-off unique quest interactions/conditions.

## Naming



## Passing feelings
Happy      [#######--] (6) <i class="fa-solid fa-face-smile"></i>
Optomistic [#---+----] (0) <i class="fa-solid fa-glass-water"></i>
Peaceful  [########-] (7) <i class="fa-solid fa-peace"></i>
Energetic  [###-+----] (2) <i class="fa-solid fa-bolt-lightning"></i>

HOPE.

A frog is HOPE=4441, It has no energy.
When you bump into it you only xfer your emoptions to make then nutral 4444.

So your HOPE=7246. So the frog is now up to 4443, one more to go.
You are down to 7244.  Do you dip down to 7243 and you give as much energy as you can to the frog. I think so. The Frog is now 4444 and the quest is complete. You are now down to 7243.

If everything you bump into, you give as much as you can to make the nutral 4444. Anything bumping into you does the same.

but what if a flying rock of 1144 bumps into you? Your 7243 becomes 4044. The rocks H=1 is -3 from nutral 4. So we add 7 -3 = 4.

Does this mean the rock becomes H=4? Yes, we are making the rock nutral.

If a Bunny bumps into you and its 8448, You become 8448. The bunny becomes 4444.

So it is always a two-way interaction, bumping into something simply xfers between the two, does not matter which bumps first.

This then raises the question of a default HOPE eg 1144 for a flying rock, and it will, over time, deckay to its default.





