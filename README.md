# Colony: A Cyberpunk Social Deduction Game

## Overview

Colony is a real-time social deduction game set in a post-apocalyptic cyberpunk ruin, built around **delegated programs **(a user's powers)**, hidden roles, and The Grid** (A game facilitator).

Players do not act directly. Instead, their programmes must be delegated to other players to be executed in the grid, creating a network of dependency, deception, and inference.

The game is resolved through:

- enacting other players powers in private interactions with the **Operator** and the **Grid**
- a shared but gated **trace log**
- a changing **network state** (win conditions) shaped by player decisions

---

## Core Principles

1. **Grid truth is absolute**
   - The Operator always provides correct information, unless corruption is applied.
   - All program results are truthful.
2. **Player communication is unverified**
   - Players may lie freely.
   - There is no mechanic to verify whether a player is telling the truth.
   - Players may lie about what program they are loading into another player.
   - The Operator does not correct false claims about a program's identity.
3. **All meaningful actions require trust**
   - Players cannot run their own programs.
   - All programs must be loaded into another player to be run.
4. **Progression is controlled but contestable**
   - A single player, the **Architect** (the player who can advance the network), can advance the network.
   - This state is hidden, persistent, and transferable.

---

## Game Loop

The game runs continuously with no fixed rounds.

1. Players discuss, negotiate, and exchange programs.
2. When Player A jacks a program into Player B:
   - Player B must immediately go to the Operator.
   - Player B must run the program.
3. The Operator resolves the program privately through the Grid.
4. If Player B is the **Architect**, they may choose to advance the network by building a node.
5. After a short delay, such as 2 to 3 minutes, the Operator announces any changes to the network state.

### Global Targeting Rule

- Players may not target themselves with any program.
- All programs must target another player unless a role explicitly states otherwise.

### Global Program-Handling Rules

- A player may hold at most 1 program belonging to another player at a time.
- A program received for execution may not be forwarded to a third player.
- A player may not run the same program twice in a row.
- After visiting the Operator and resolving a program, the executor must immediately return that program to its owner.

### Key Terms

- **Executor**: the player currently running a program through the Operator.
- **Source**: the player who owns the program being run.
- **Target**: the player chosen by the executor to be affected by that program.

---

## Roles, Programs, and Factions

Each player is assigned:

- **Faction**: Red or Green
- **Role**: defines their program and any passive abilities

Roles and factions are assigned independently. A player may receive any role with either faction.
Each role has an associated same-named program. When ambiguity matters, these rules refer to `the <Role> role` and `the <Role> program` separately.

### Factions

- **Red**: Seeks to rebuild the network through control, surveillance, lockouts, and enforcement.
- **Green**: Seeks to rebuild the network through distributed trust, shared routing, privacy, and cooperative access.

Players win if the final network state favors their faction.

---

## Progression System

### The Architect

- One player is the **current Architect**.
- The Architect:
  - remains in that role until changed
  - may advance the network when running a program

### Progress Rules

- The Architect must:
  - receive a program from another player
  - run that program
  - choose a node to build
- The Architect **cannot use the same program twice** to progress.
- The Architect may change through certain role effects, including delayed or indirect redirection effects.

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
  - 1 **Rerouter**
  - 1 **Sink**
  - 1 **Purge**
  - 1 **Bootstrap** role, if testing endgame
  - at least 1 role with **boot-sequence information**
- Roles that move progression or corruption should be rare. In most tests, include at most one of each.

### Operator

- One player acts as the **Operator** for the Grid.
- Responsibilities:
  - resolve all programs privately
  - maintain the trace log
  - track:
    - Architect
    - corruption
    - network state

### Initial State

- No nodes are built at the start.
- The trace log is **disabled** unless explicitly enabled by a node.

### Architect

- One player is secretly assigned as the **initial Architect**.

---

## Boot Sequence

1. All players receive their role and faction privately.
2. The Operator resolves any boot-sequence information for roles in play.
3. The Operator announces:
   - the Grid is live
   - players may begin discussion and program exchange
4. Players begin interacting immediately.
5. No formal rounds or turns are used.

### Boot-Sequence Information

Some roles begin the game with information revealed during setup.

Example boot sequence:

- The **Ghost Pair** open their eyes and learn who the other Ghost Pair operator is, without learning that operator's faction.
- All players close their eyes.
- The Operator asks **Registry** players in the Green faction to raise their hands, then lower them.
- The Operator then asks **Registry** players in the Red faction to raise their hands, then lower them.
- Ghost Pair operators learn which players are Registry, and whether each observed Registry player is Red or Green.
- Registry players gain no boot-sequence information from this process.

### Operator Notes

- Resolve all boot-sequence steps before open discussion begins.
- If a role receives setup information, make sure that only the intended role gains it.
- When a player receives a program:
  - they must immediately approach the Operator
  - ask them what they intend to do with the program: what they have been told the program does may not be what the program actually does
  - resolve the program according to the card they were actually given, not according to what another player claimed it was
  - a target chosen by the player is the target of what is written on the program card, not the target of what the player thinks is on the card
  - do not reveal whether a player was misled about the program they received
- Keep interactions quick to maintain flow.
- Announce network changes after a short delay, typically 2 to 3 minutes.

---

## Network Nodes

- Each node:
  - is known to all players
  - has a **Red or Green alignment**
  - modifies how the game behaves
- The game ends after a fixed number of nodes are built.
- The faction with majority alignment wins.

### Initial Node List (v0.1)

#### Red-Aligned Nodes

**Trace Archive**

- Enables access to the trace log via programs.

**Alarm Mesh**

- The Operator may announce when actions occur.

**Lockout**

- The Architect may restrict a player from receiving programs temporarily.

#### Green-Aligned Nodes

**Consensus Patch**

- Progression requires an additional player's approval.

**Cipher Veil**

- Trace-log queries return incomplete information.

### Notes

- All nodes are known to players at the start.
- Each build shifts the network toward Red or Green alignment.

---

## The Trace Log

The Grid maintains a hidden trace log of all actions.

Each trace entry contains:

- executor, or who ran the program
- source, or whose program was run
- program name
- whether the executor was **corrupted**
- whether the executor was the **Architect**

Players may gain access to the trace log via programs.

Trace-log access is:

- partial
- query-based
- socially mediated

---

## The Corruption System

Corruption is a **rare, persistent effect** applied by specific roles.

### Rules

- At the start of the game, the **Spoofer role** is armed to apply corruption.
- When the **Spoofer program** is run while the Spoofer role is armed, the executor becomes **corrupted**.
- Only one active corruption from the Spoofer role may exist at a time.
- After applying corruption, the Spoofer role must regain access to the Operator through another received program to re-arm corruption.
- The **Sink program** removes corruption from a player by taking it onto its own user.
- The **Purge program** removes corruption from the game entirely if it correctly identifies a corrupted player.

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

## The Spoofer

The Spoofer is a role that may belong to either faction.

### Program

- Provides a useful effect, such as an identity check.
- If the Spoofer role is armed, the **executor of the Spoofer program becomes corrupted**.

### Constraints

- The Spoofer role begins the game armed.
- Only one active corruption from this role may exist at a time.
- After applying corruption through the Spoofer program, the Spoofer role must receive another program and access the Operator to re-arm.

### Design Intent

- The Spoofer must participate in the trust network.
- Corruption is intentional, targeted, and contestable.

---

## The Sink

The Sink is a role that may belong to either faction.

### Program

- The Sink program removes corruption from a target player by taking it onto the user.

### Constraints

- Sink does not destroy corruption.
- If the target is not corrupted, the effect fails.

### Design Intent

- The Sink keeps corruption in circulation instead of solving it outright.
- It creates strategic risk for anyone who chooses to use it.

---

## The Purge

The Purge is a role that may belong to either faction.

### Program

- The Purge program permanently removes corruption from a target player if that target is currently corrupted.

### Constraints

- If the target is not corrupted, the effect fails.
- This role purges corruption instead of transferring it.

### Design Intent

- The Purge provides a true answer to corruption.
- It rewards correct identification rather than merely shifting risk.

---

## Core Truth Roles

These roles provide **strong, binary truth**.

### Ghost Pair

- Learns whether 2 selected players are on the same faction.

### Registry

- Learns a player's role.

### Handshake

- Learns whether a player is on the same faction.

### Signal Trace

- Learns whether a player is the Architect.

### Scanner

- Learns whether a player is corrupted.

### Rerouter

- Marks a player so that the next time they run a program, that program's target becomes the Architect.

---

## Bootstrap Role

At least one role should exist that can:

- trigger the endgame
- unlock final-tier progression

This role must:

- remain hidden
- be vulnerable to disruption

---

## Endgame (Draft)

- The game ends after a fixed number of nodes are built. Recommended: 5 to 7.
- The faction with the majority of aligned nodes wins.

### Optional Rule

- A specific role may trigger the endgame early.
- This role should remain hidden and vulnerable to disruption.

---

## Design Goals

The game is designed so that:

- truth exists, but must be **socially validated**
- trust is necessary, but **dangerous**
- control is centralized, but **contestable**
- information is strong, but **fragile**

Players should feel:

- uncertain, but not lost
- capable of deduction, but never certain
- dependent on others, but never safe

---

## Future Iteration Areas

- node effects and balance
- role distribution and count
- Architect reassignment mechanics
- trace-log query design
- endgame conditions

---

## Status

This is a **minimal playable ruleset (v0.1)** intended for testing core dynamics.

Expect iteration.
