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







