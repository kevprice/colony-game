# Colony: A Social Deduction Game

## Overview

Colony is a real-time social deduction game built around **delegated actions, hidden roles, and system-mediated truth**.

Players do not act directly. Instead, they must **trust other players to execute powers on their behalf**, creating a network of dependency, deception, and inference.

The game is resolved through:

- private interactions with a facilitator (the System)
- a shared but gated log of actions
- a changing colony state shaped by player decisions

---

## Core Principles

1. **System truth is absolute**
   - The facilitator always provides correct information, unless corruption is applied.
   - All power results are truthful.
2. **Player communication is unverified**
   - Players may lie freely.
   - There is no mechanic to verify whether a player is telling the truth.
3. **All meaningful actions require trust**
   - Players cannot use their own powers.
   - All powers must be given to another player to execute.
4. **Progression is controlled but contestable**
   - A single player, the *progressor*, can advance the colony.
   - This role is hidden, persistent, and transferable.

---

## Game Loop

The game runs continuously with no fixed rounds.

1. Players discuss, negotiate, and exchange powers.
2. When Player A gives a power to Player B:
   - Player B must immediately go to the facilitator.
   - Player B must use the power.
3. The facilitator resolves the power privately.
4. If Player B is the **progressor**, they may choose to advance the colony.
5. After a short delay, such as 2 to 3 minutes, the facilitator announces any changes to the colony.

---

## Roles, Powers, and Factions

Each player is assigned:

- **Faction**: Red or Green
- **Role**: defines their power and any passive abilities

Roles and factions are assigned independently. A player may receive any role with either faction.

### Factions

- **Red**: Seeks to build a control-oriented colony through surveillance, restriction, and enforcement.
- **Green**: Seeks to build a decentralized, cooperative colony through privacy, trust, and shared control.

Players win if the final colony state favors their faction.

---

## Progression System

### The Progressor

- One player is the **current progressor**.
- The progressor:
  - remains in that role until changed
  - may advance the colony when executing a power

### Progress Rules

- The progressor must:
  - receive a power from another player
  - use that power
  - choose a structure to build
- The progressor **cannot use the same power twice** to progress.
- The progressor may be reassigned by certain powers, including role-based reassignment effects.

---

## Setup

### Player Count

- Recommended: **8 to 10 players**
- Minimum: 6, not yet tested
- Maximum: 12, not yet tested

### Roles

- Each player is assigned:
  - 1 faction, Red or Green
  - 1 role, with an associated power
- Role cards and faction cards are dealt separately.
- Roles should include:
  - at least 2 to 3 **information roles**
  - at least 2 **disruption roles**
  - 1 **Saboteur**
  - 1 **Reallocator**
  - 1 **Purifier**
  - 1 **Endgame role**, if testing endgame
  - at least 1 role with **starting information**
- Roles that move progression or corruption should be rare. In most tests, include at most one of each.

### Facilitator

- One player acts as the **facilitator**, or the System.
- Responsibilities:
  - resolve all powers privately
  - maintain the log
  - track:
    - progressor
    - corruption
    - colony state

### Initial State

- No structures are built at the start.
- Logging is **disabled** unless explicitly enabled by a structure.

### Progressor

- One player is secretly assigned as the **initial progressor**.

---

## Starting the Game

1. All players receive their role and faction privately.
2. The facilitator resolves any starting knowledge for roles in play.
3. The facilitator announces:
   - the game has begun
   - players may begin discussion and power exchange
4. Players begin interacting immediately.
5. No formal rounds or turns are used.

### Starting Information

Some roles begin the game with information revealed during setup.

Example setup sequence:

- The **Witnesses** open their eyes and learn who the other Witness is, without learning that Witness's faction.
- All players close their eyes.
- The facilitator asks **Census** players in the Green faction to raise their hands, then lower them.
- The facilitator then asks **Census** players in the Red faction to raise their hands, then lower them.
- Witnesses learn which players are Census, and whether each observed Census player is Red or Green.
- Census players gain no starting information from this process.

### Facilitator Notes

- Resolve all starting-information steps before open discussion begins.
- If a role receives setup information, make sure that only the intended role gains it.
- When a player receives a power:
  - they must immediately approach the facilitator
  - ask them what they intend to do with the power: what they have been told the power does may not be what the power does.
  - A target that is chosen by the player is the target of what is written on the power card not the target of what the player thinks is on the power card
- Keep interactions quick to maintain flow.
- Announce colony changes after a short delay, typically 2 to 3 minutes.

---

## Colony Structures

- Each structure:
  - is known to all players
  - has a **Red or Green alignment**
  - modifies how the game behaves
- The game ends after a fixed number of structures are built.
- The faction with majority alignment wins.

### Initial Structure List (v0.1)

#### Red-Aligned Structures

**Logging**

- Enables access to the system log via powers.

**Security**

- The facilitator may announce when actions occur.

**Detention**

- The progressor may restrict a player from receiving powers temporarily.

#### Green-Aligned Structures

**Diplomacy**

- Progression requires an additional player's approval.

**Encryption**

- Log queries return incomplete information.

### Notes

- All structures are known to players at the start.
- Each build shifts the colony toward Red or Green alignment.

---

## The Log System

The system maintains a hidden log of all actions.

Each log entry contains:

- executor, or who used the power
- source, or whose power was used
- power name
- whether the executor was **corrupted**
- whether the executor was the **progressor**

Players may gain access to the log via powers.

Log access is:

- partial
- query-based
- socially mediated

---

## Corruption System

Corruption is a **rare, persistent effect** applied by specific roles.

### Rules

- There is a single corruption line in the game.
- At the start of the game, **Saboteur** controls corruption.
- Corruption alternates between being controlled by a role and being attached to a corrupted player.
- If the role currently controlling corruption has its power executed, the executor becomes **corrupted**.
- If a player is currently corrupted and either **Saboteur** or **Purifier** has its power executed, corruption returns from that player to that role's control after the power resolves.

### Effects

Examples include:

- log identity distortion
- action outcome distortion

### Design Intent

Corruption should:

- create doubt
- be traceable through reasoning
- not overwhelm the game

---

## The Saboteur

The Saboteur is a role that may belong to either faction.

### Power

- Provides a useful effect, such as an identity check.
- If Saboteur currently controls corruption, the **executor becomes corrupted**.

### Constraints

- Saboteur begins the game controlling corruption.
- If a player is currently corrupted and Saboteur's power is used, Saboteur reclaims control of corruption after resolving its effect.

### Design Intent

- The Saboteur must participate in the trust network.
- Corruption is intentional, targeted, and contestable.

---

## The Purifier

The Purifier is a role that may belong to either faction.

### Power

- Provides a useful effect, such as an exact faction check.
- If Purifier currently controls corruption, the **executor becomes corrupted**.

### Constraints

- Purifier does not begin the game controlling corruption.
- If a player is currently corrupted and Purifier's power is used, Purifier reclaims control of corruption after resolving its effect.

### Design Intent

- The Purifier is not a simple counter to Saboteur.
- It competes with Saboteur to control when and how corruption re-enters the game.

---

## Core Information Roles

These roles provide **strong, binary truth**.

### Witness

- Learns whether 2 selected players are on the same faction.

### Census

- Learns a player's role.

### Sentinel

- Learns whether a player is on the same faction.

### Tracker

- Learns whether a player is the progressor.

### Diagnostician

- Learns whether a player is corrupted.

---

## Endgame Role

At least one role should exist that can:

- trigger the endgame
- unlock final-tier progression

This role must:

- remain hidden
- be vulnerable to disruption

---

## Endgame (Draft)

- The game ends after a fixed number of structures are built. Recommended: 5 to 7.
- The faction with the majority of aligned structures wins.

### Optional Rule

- A specific role may trigger the endgame early.
- This role should remain hidden and vulnerable to disruption.

---

## Design Goals

The game is designed so that:

- truth exists, but must be **socially validated**
- trust is necessary, but **dangerous**
- power is centralized, but **contestable**
- information is strong, but **fragile**

Players should feel:

- uncertain, but not lost
- capable of deduction, but never certain
- dependent on others, but never safe

---

## Future Iteration Areas

- structure effects and balance
- role distribution and count
- progressor reassignment mechanics
- log query design
- endgame conditions

---

## Status

This is a **minimal playable ruleset (v0.1)** intended for testing core dynamics.

Expect iteration.
