# Colony: A Cyberpunk Social Deduction Game

## Overview

Colony is a real-time social deduction game set in a post-apocalyptic cyberpunk ruin, built around **delegated programs**, hidden roles, and a hidden **Architect state** that can reshape the Grid over time.

Players do not act directly. Instead, they jack their programs into other players to be run through the **Terminal**, creating a network of dependency, deception, and inference.

The game is resolved through:

- enacting other players' programs at the **Terminal**
- a hidden but queryable **trace log**
- a growing catalog of **installed effects** that permanently change how the Grid behaves
- a faction race to install enough effects to win

---

## Core Principles

1. **Grid truth is absolute**
   - The Terminal always gives the correct result unless corruption changes the output.
   - All resolved program results are truthful to the actual program that was run.
2. **Player communication is unverified**
   - Players may lie freely.
   - Players may lie about what program they are loading into another player.
   - The Terminal does not correct false claims about a program's identity.
3. **All meaningful actions require trust**
   - Players cannot run their own programs.
   - All programs must be loaded into another player to be run.
   - The Architect cannot assign a targeted installed effect to themselves.
4. **Progression is controlled but contestable**
   - A hidden **Architect** can install new persistent effects into the Grid.
   - Architect control is hidden, persistent, and transferable.
   - Factions race through Architect-driven installs rather than through pre-aligned map control.

---

## Game Loop

The game runs continuously with no fixed rounds.


1. Players discuss, negotiate, and exchange programs. Their aim is to identify and control the Architect power and build the network in their own image.
2. When Player A 'jacks' a program into Player B:
   - Player B must immediately go to the Operator.
   - Player B must run the program.
3. The Operator resolves the program privately and logs it.
4. If Player B is the **Architect**, they may choose to advance the network by building a node.
5. After a short delay, such as 2 to 3 minutes, the Operator announces any changes to the network state.


### Global Targeting Rule

- Players may not target themselves with any program.
- All programs must target another player or role unless a role explicitly states otherwise.

### Global Program-Handling Rules

- Physical program cards are anonymous on their face and may be handed directly between players.
- A player may hold at most 1 program belonging to another player at a time.
- A program received for execution may not be forwarded to a third player.
- A player may not run the same program twice in a row.
- After visiting the Terminal and resolving a program, the executor must immediately return that program to its owner.

### Key Terms

- **Executor**: the player currently running a program through the Terminal.
- **Source**: the player who owns the program being run.
- **Target**: the player chosen by the executor to be affected by that program.
- **Architect**: a hidden role state. A player learns they are currently an Architect either because the Terminal tells them after they run a received program, or because a role program reveals that information.
- **Grid effect**: an additional persistent rule created by an Architect. Grid effects are not role programs.

### What to Find Out

- other players' roles, so you can understand their programs
- other players' factions, so you know who is on your team
- who is currently an Architect, so you can stop them from scoring or move that state
- where the corruption currently is

---

## Roles, Programs, and Factions

Each player is assigned:

- **Faction**: Red or Green
- **Role**: defines their program and any passive abilities

Roles and factions are assigned independently. A player may receive any role with either faction.
Each role has an associated same-named program. When ambiguity matters, these rules refer to `the <Role> role` and `the <Role> program` separately.

### Factions

- **Red**: seeks to seize momentum through aggressive control of Architect access and effect timing.
- **Green**: seeks to seize momentum through coordinated trust, information, and safer long-term installs.

Factions do not win through pre-tagged effects. Instead, a faction scores when one of its Architects installs an effect.

---

## Architect Progression System

### The Architect


- One player is the **current Architect**. This is a state seperate to the player's role and must be discovered.
- The Architect:
  - remains in that role until changed
  - may advance the network when running a program


### Install Rules

- To install an effect, the Architect must:
  - receive a program from another player
  - run that program
  - choose one available effect from the current unlock tier
- The Architect **cannot use the same program twice to install a Grid effect**.
- An Architect may still run that same program later under the normal rules of the game, but it cannot be the program used for their next install.
- Installed effects are persistent until the game ends unless an effect explicitly says otherwise.
- Targeted installed effects may not target the Architect themselves.
- If multiple Architects exist, each Architect installs and scores for their own faction.

### Visibility Rules

- Installs are announced after a short delay so the table is not given an immediate Architect confirmation.
- Installed effects are publicly highlighted for the faction that installed them.
- If an effect is **targeted**, the table does not learn who received it by default.
- Only the Architect and the recipient know who received a targeted effect unless a later ownership-reveal effect changes that.
- If an effect is **global**, the whole table learns that it has been installed once the delay ends.

---

## Unlock Race and Winning

### Faction Score

Each time an Architect installs an effect, that Architect's faction gains **1 point**.

Recommended victory thresholds:

- **6 to 7 players:** first faction to **4** points wins
- **8 to 10 players:** first faction to **5** points wins
- **11 to 12 players:** first faction to **6** points wins

The game ends immediately when a faction reaches its threshold.

### Unlock Tiers

The Architect does not have access to the full effect catalog at all times.

- **Tier 1**: available from game start
- **Tier 2**: unlocks after **2 total installed effects**
- **Tier 3**: unlocks after **4 total installed effects**

This keeps the early game readable and allows the Grid to become stranger over time.

---

## Setup

### Player Count

- Recommended: **8 to 10 players**
- Minimum: 6, not yet tested
- Maximum: 12, not yet tested

### Roles

- Each player is assigned:
  - 1 faction, Red or Green
  - 1 role, with an associated program
- Role cards and faction cards are dealt separately.
- Roles should include:
  - at least 2 to 3 **information roles**
  - at least 2 **disruption roles**
  - 1 **Spoofer**
  - 1 **Failover**
  - optionally 1 **Rerouter** if you want more chaotic Architect movement
  - 1 **Sink**
  - 1 **Purge**
  - at least 1 role with **boot-sequence information**
- **Bootstrap** should only appear in larger games. In the biggest tests, consider 2 Bootstrap roles if you are manually curating factions.
- Roles that move progression or corruption should be rare. In most tests, include at most one of each.

### Terminal and Host

- The **Terminal** resolves all programs and tracks hidden game state.
- The host uses the admin console to oversee the Grid.
- Responsibilities:
  - resolve all programs privately
  - maintain the trace log
  - track:
    - Architect control
    - corruption
    - installed effects
    - faction scores
    - unlock tiers

### Initial State

- No persistent effects are installed at the start.
- Faction scores start at **0 - 0**.
- The trace log is hidden unless accessed by a role program or later effect.

### Architect

- One player is secretly assigned as the **initial Architect**.

---

## Boot Sequence

1. All players receive their role and faction privately.
2. The host resolves any boot-sequence information for roles in play.
3. The host announces:
   - the Grid is live
   - players may begin discussion and program exchange
4. Players begin interacting immediately.
5. No formal rounds or turns are used.

### Boot-Sequence Information

Some roles begin the game with information revealed during setup.

Example boot sequence:

- The **Ghost Pair** open their eyes and learn who the other Ghost Pair player is, without learning that player's faction.
- All players close their eyes.
- The host asks **Registry** players in the Green faction to raise their hands, then lower them.
- The host then asks **Registry** players in the Red faction to raise their hands, then lower them.
- Ghost Pair players learn which players are Registry, and whether each observed Registry player is Red or Green.
- Registry players gain no boot-sequence information from this process.

### Terminal Notes

- Resolve all boot-sequence steps before open discussion begins.
- If a role receives setup information, make sure that only the intended role gains it.
- When a player receives a program:
  - they must immediately approach the Terminal, or wait and resolve it as soon as the Terminal is free
  - they may not keep that program with the intention of not using it
  - the program card itself remains anonymous; only the Grid reveals what it really is
  - ask them what they intend to do with the program: what they have been told the program does may not be what the program actually does
  - resolve the program according to the card they were actually given, not according to what another player claimed it was
  - a target chosen by the player is the target of what is written on the program card, not the target of what the player thinks is on the card
  - do not reveal whether a player was misled about the program they received
- When an Architect installs an effect:
  - apply the effect immediately
  - record the point for that Architect's faction immediately
  - delay the public announcement slightly so the Architect is not automatically identified
- Keep interactions quick to maintain flow.

---

## Installed Effects

Installed effects are persistent Grid changes created by the Architect.

- Effects are **not faction-aligned**
- Effects come in 2 families:
  - **Capability effects**: granted to a specific player and triggered during play
  - **System effects**: change how the whole Grid behaves
- If 2 global effects would create incompatible rules, the **newest installed effect overrides the older one**
- A player should hold at most **2 installed capability effects** at a time

The current effect catalog lives in [effects.md](C:\Users\kevpr\workspace\colony-game\effects.md).

---

## The Trace Log

The Grid maintains a hidden trace log of all actions.

Each trace entry contains:

- executor, or who ran the program
- source, or whose program was run
- program name
- whether the executor was **corrupted**
- whether the executor was an **Architect**

Players may gain access to the trace log via programs or later installed effects.

Trace-log access is:

- partial
- query-based
- socially mediated

---

## The Corruption System

Corruption is a **rare, persistent effect** applied by specific roles.

### Rules

- At the start of the game, the **Spoofer role** holds armed corruption.
- **Spoofer** and **Sink** are mirror roles around the same corruption line.
- If either role currently holds armed corruption, that role's card behaves as the **Spoofer program**:
  - select a player
  - learn that player's role
  - the executor becomes **corrupted**
- If either role does **not** currently hold armed corruption, that role's card behaves as the **Sink program**:
  - select a player
  - if they are corrupted, remove corruption from them
  - corruption returns to the source role of that card and becomes armed
- The **Purge program** removes corruption from the game entirely if it correctly identifies a corrupted player.
- Once corruption is no longer in the game, the **Purge program** changes state and may instead select a player to become the Architect.
- A corrupted player receives **false information** from the Terminal.
- Binary outputs are inverted where possible, such as `Yes` becoming `No` and `No` becoming `Yes`.
- Trace-log outputs become corrupted and cannot be trusted while the executor is corrupted.
- If a corrupted Architect installs a new Grid effect, the point for that install is scored by the **other faction**.

### Effects

Examples include:

- trace identity distortion
- action outcome distortion

### Design Intent

Corruption should:

- create doubt
- be traceable through reasoning
- not overwhelm the game

---

## Core Truth Roles

These roles provide **strong, binary truth** returning either True or False from the Operator.

### Ghost Pair

- Learns whether 2 selected players are on the same faction.

### Registry

- Learns a player's role.

### Handshake

- Learns whether a player is on the same faction.

### Signal Trace

- Learns whether a player is an Architect.

### Scanner

- Learns whether a player is corrupted.

### Failover

- Selects 2 players and moves the Architect state between them if exactly 1 of them currently holds it.
- Only reveals whether a transfer happened.

### Rerouter

- Marks a player so that the next time they run a program, that program's target becomes the Architect.
- Pushes Architect control through a delayed social chain rather than an immediate swap.

---

## Design Goals

The game is designed so that:

- truth exists, but must be **socially validated**
- trust is necessary, but **dangerous**
- control is centralized, but **contestable**
- information is strong, but **fragile**
- system power accumulates over time instead of resolving in isolated bursts

Players should feel:

- uncertain, but not lost
- capable of deduction, but never certain
- dependent on others, but never safe
- aware that the Grid is being reshaped around them as the game continues

---

## Future Iteration Areas

- effect balance and tier placement
- role distribution and count
- Architect reassignment mechanics
- trace-log query design
- duplicate-Architect pacing
- victory threshold tuning

---

## Status

This is a **minimal playable ruleset (v0.2)** intended for testing the unlock-race model.

Expect iteration.

---

## Deployment Notes

- The app is deployable to Railway.
- Railway builds on Linux, so build scripts must stay cross-platform.
- If you want SQLite data to persist across deploys and restarts, mount a Railway volume and set `COLONY_DB_PATH` to a file on that volume, for example `/data/colony.sqlite`.
