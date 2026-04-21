# Roles (v0.1)

Each player is assigned:

- 1 faction, Red or Green
- 1 role

Faction and role are assigned independently. A player may receive any role with either faction.

All roles provide a **power** that must be given to another player to execute.

Global targeting rule:

- Players may not target themselves with any power.
- All powers must target another player unless a role explicitly states otherwise.

Global power-handling rules:

- A player may hold at most 1 power belonging to another player at a time.
- A power received for execution may not be transferred to a third player.
- After visiting the facilitator and resolving a power, the executor must immediately return that power to its owner.

---

## Role Curation Standard

Roles should satisfy all of the following where possible:

- provide real and direct information
- affect a core question in the game
- avoid weak, partial, or statistical output
- avoid reproducing information that is already mostly available from room observation
- avoid narrow edge-case powers that rarely matter

Core questions include:

- who is on my team?
- who is the progressor?
- who is corrupted?
- what action actually happened?

Do not add roles that rely on:

- partial information such as `2+`, `one of`, or `likely`
- mirrored duplicates with no meaningful functional difference
- public revelation mechanics
- powers that mostly reproduce what players can already infer by watching who goes to the facilitator

---

## Curated Active Pool

This is the current role pool worth keeping in the repository.

### Setup Information Roles

#### Witness

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
- Witnesses also begin with partial faction knowledge about Census players.

---

#### Census

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
- Census has a strong direct information power during normal play.

---

### Faction Truth Roles

Keep only one direct faction-check family in active use at a time.

#### Sentinel

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Are they on your faction? (Yes / No)`

**Design Notes:**

- This is the simplest direct faction-check role.
- Do not duplicate this role family with near-identical alternatives.

---

### Progressor Roles

#### Tracker

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Are they the current progressor? (Yes / No)`

---

#### Redirector

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

---

### Log and Action Truth Roles

These roles should reveal information that is not already obvious from watching the room.

#### Full Auditor

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn:
  - what power they last used
  - whose power it was

---

#### Target Revealer

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn who they last targeted.

---

#### Log Snapshot

**Faction:** Variable, assigned during setup

**Power:**

- Learn the full details of the most recent log entry.

---

#### Action Confirmation

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Did their last action succeed? (Yes / No)`

---

### Disruption Roles

#### Controller

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Their next power use has no effect.

**Design Notes:**

- The facilitator should return: `No effect` or `Action failed`.
- The result should not reveal that blocking occurred.

---

#### Obfuscator

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

### Corruption Roles

#### Saboteur

**Faction:** Variable, assigned during setup

**Power:**

- Learn the role of a target player.

**Hidden Effect:**

- The executor becomes **corrupted** if the Saboteur is armed.

**Constraints:**

- Only one active corruption from this role may exist at a time.
- Saboteur begins the game armed.
- After corruption is applied, Saboteur must receive another power and access the facilitator to re-arm corruption.

**Design Notes:**

- Corruption applies to the executor, not the target.
- This power should appear useful and desirable.
- Delegation and trust remain central to re-use.

---

#### Purifier

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- If they are corrupted, remove corruption from them and take that corruption onto yourself.

**Design Notes:**

- This role removes corruption from another player by taking it onto its own user.
- It keeps corruption in circulation rather than destroying it.
- It creates strategic risk for the user and for anyone trusting them.

---

#### Exorcist

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- If they are currently corrupted, remove that corruption from the game entirely.

**Design Notes:**

- This is a true purge rather than a transfer.
- If used on a non-corrupted player, it fails.
- Keep this role distinct from Purifier in both rules and play language.

---

#### Diagnostician

**Faction:** Variable, assigned during setup

**Power:**

- Select a player.
- Learn: `Are they currently corrupted? (Yes / No)`

---

### Special Roles

#### Advocate (Endgame Role)

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

## Deprecated or Removed Role Families

These role ideas should not be kept in the active pool.

- `Inverter`: duplicate of direct faction-checking in practice
- `Cluster Analyst`: partial or statistical output
- `Load Monitor`: too niche and indirect
- `Progress Verifier`: too situational and unclear in normal play
- `Source Revealer`: too weak because room observation already gives much of this value
- `Exposure`: relies on public revelation mechanics
- `Split Vision`: resolves too easily in practice
- `Known Anchor`, `Opposition Anchor`, and similar comparator overlaps: treat as one family and keep only the strongest version

---

## Role Design Guidance

When proposing new roles, prefer roles that give:

- direct faction truth
- direct progressor truth
- direct corruption truth
- direct action or log truth
- clear disruption of one of the above

Avoid roles that:

- duplicate another role except for setup wrapper
- reveal information already strongly visible in the room
- produce weak, partial, or statistical output
- only matter in rare edge cases

Rare systemic roles such as **Saboteur**, **Purifier**, **Exorcist**, and **Redirector** should usually appear at most once each in a test setup.
