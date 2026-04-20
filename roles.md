# Roles (v0.1)

Each player is assigned:

- 1 faction, Red or Green
- 1 role

Faction and role are assigned independently. A player may receive any role with either faction.

All roles provide a **power** that must be given to another player to execute.

Global targeting rule:

- Players may not target themselves with any power.
- All powers must target another player unless a role explicitly states otherwise.

---

## Starting Information Roles

These roles receive information during setup, before open discussion begins.

### Witness

**Faction:** Variable, assigned during setup

**Count:** Exactly 2 copies when in play

**Starting Information:**

- Both Witnesses open their eyes during setup.
- Each Witness learns who the other Witness is.
- Neither Witness learns the other Witness's faction.
- While all other players keep their eyes closed, Witnesses also observe which Census players are Green and which Census players are Red.

**Power:**

- Select 2 players.
- Learn: `Are they on the same faction? (Yes / No)`

**Design Notes:**

- This role creates an immediate social anchor without creating a confirmed alliance.
- The tension comes from knowing a role match while still having to infer that player's faction.
- Witnesses also begin with partial faction knowledge about Census players, giving them real but incomplete setup information.
- The active power is relational rather than self-referential, so it does not duplicate Sentinel.

---

### Census

**Faction:** Variable, assigned during setup

**Starting Information:**

- Census players keep their eyes closed during setup.
- When instructed by the facilitator, Census players in the Green faction raise their hands, then lower them.
- When instructed again, Census players in the Red faction raise their hands, then lower them.
- Census players gain **no information** from this process.

**Power:**

- Select a player.
- Learn that player's role.

**Design Notes:**

- Census is an information source for Witness during setup, not an information receiver.
- Census still needs a strong standard gameplay power so the role remains desirable to pass and use.

---

## Disruption Roles

### Saboteur

**Faction:** Variable, assigned during setup

**Power:**

- Learn the role of a target player.

**Corruption Rules:**

- Saboteur and Purifier contest control of a single corruption line.
- Saboteur begins the game controlling corruption.
- If Saboteur currently controls corruption when this power is executed, the executor becomes **corrupted**.
- If a player is currently corrupted when this power is executed, corruption returns from that player to Saboteur's control after the power resolves.

**Design Notes:**

- Corruption applies to the **executor**, not the target.
- This power should appear useful and desirable.
- Saboteur is defined by starting with corruption, not by having a unique corruption mechanic.

---

### Obfuscator

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- The next time they appear in the log, one field is incorrect:
  - identity
  - source
  - or corruption status

**Design Notes:**

- Must not remove the log entry entirely.
- Should create doubt, not erase information.

---

### Controller

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Their next power use has no effect.

**Design Notes:**

- The facilitator should return: `No effect` or `Action failed`.
- The result should not reveal that blocking occurred.

---

## Control Roles

### Redirector

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- The next time that player executes a power, the target of that power becomes the progressor.

**Resolution Rules:**

- The effect is delayed and persists until that player executes a power.
- The effect applies once, then expires.
- Because players may not target themselves, the affected executor cannot make themselves progressor through this effect.
- If the executed power has multiple targets, the facilitator selects which target becomes the progressor.

**Design Notes:**

- This role changes progression indirectly through player behavior rather than by naming the new progressor outright.
- It creates uncertainty, social pressure, and counterplay around who receives powers and who they choose to target.
- Include at most 1 Redirector in a test setup.

---

## Information Roles

### Sentinel

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Are they on your faction? (Yes / No)`

---

### Tracker

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Are they the current progressor? (Yes / No)`

---

### Diagnostician

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Are they currently corrupted? (Yes / No)`

---

## Recovery Roles

### Purifier

**Faction:** Variable, assigned during setup

**Power:**

- Learn the faction of a target player.

**Corruption Rules:**

- Saboteur and Purifier contest control of a single corruption line.
- Purifier does not begin the game controlling corruption.
- If Purifier currently controls corruption when this power is executed, the executor becomes **corrupted**.
- If a player is currently corrupted when this power is executed, corruption returns from that player to Purifier's control after the power resolves.

**Design Notes:**

- Purifier has a game-useful information power even when not controlling corruption.
- Purifier can steal corruption back and then function as the active corruption role.
- The difference between Saboteur and Purifier is primarily who begins with control of corruption.
- Include at most 1 Purifier in a test setup.

---

## Special Roles

### Advocate (Endgame Role)

**Faction:** Variable, assigned during setup

**Power:**

- Initiate endgame.

**Conditions:**

- Can only be used after a minimum number of structures are built. Recommended: 3.

**Effect:**

- Triggers the final phase of the game.
- Remaining structures determine the outcome.

**Design Notes:**

- Must remain hidden.
- Becomes a high-value target if revealed.

---

## Role Design Guidelines

When adding new roles, each role should:

- answer a key question
- distort a key question
- or block access to a key question

Roles should not assume faction alignment. Faction should remain a separate assignment unless a specific variant explicitly says otherwise.

Avoid:

- weak or redundant roles
- roles that provide vague or non-actionable information
- too many control or corruption-moving roles in the same setup

All powers must:

- be desirable enough to be passed
- create meaningful decisions when used

Rare systemic roles such as **Saboteur**, **Purifier**, and **Redirector** should usually appear at most once each in a test setup.
