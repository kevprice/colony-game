# Roles (v0.1)

Each player is assigned:

- 1 faction, Red or Green
- 1 role

Faction and role are assigned independently. A player may receive any role with either faction.

All roles provide a **program** that must be loaded into another player to execute.
Each role has an associated same-named program. When ambiguity matters, these rules refer to `the <Role> role` and `the <Role> program` separately.

Global targeting rule:

- Players may not target themselves with any program.
- All programs must target another player unless a role explicitly states otherwise.

Global program-handling rules:

- A player may hold at most 1 program belonging to another player at a time.
- A program received for execution may not be transferred to a third player.
- A player may not run the same program twice in a row.
- After visiting the Operator and resolving a program, the executor must immediately return that program to its owner.

Key terms:

- **Executor**: the player currently running a program through the Operator.
- **Source**: the player who owns the program being run.
- **Target**: the player chosen by the executor to be affected by that program.

---

## Role Curation Standard

Roles should satisfy all of the following where possible:

- provide real and direct information
- affect a core question in the game
- avoid weak, partial, or statistical output
- avoid reproducing information that is already mostly available from room observation
- avoid narrow edge-case programs that rarely matter

Core questions include:

- who is on my team?
- who is the Architect?
- who is corrupted?
- what action actually happened?

Do not add roles that rely on:

- partial information such as `2+`, `one of`, or `likely`
- mirrored duplicates with no meaningful functional difference
- public revelation mechanics
- programs that mostly reproduce what players can already infer by watching who goes to the Operator

---

## Curated Active Pool

This is the current role pool worth keeping in the repository.

### Boot-Sequence Roles

#### Ghost Pair

**Faction:** Variable, assigned during setup

**Count:** Exactly 2 copies when in play

**Boot Sequence:**

- Both Ghost Pair operators open their eyes during setup.
- Each Ghost Pair operator learns who the other Ghost Pair operator is.
- Neither Ghost Pair operator learns the other operator's faction.
- While all other players keep their eyes closed, Ghost Pair operators also observe which Registry players are Green and which Registry players are Red.

**Program:**

- Select 2 players.
- Learn: `Are they on the same faction? (Yes / No)`

**Design Notes:**

- This role creates an immediate social anchor without creating a confirmed alliance.
- The tension comes from knowing a matching ghost in the network while still having to infer that operator's faction.
- Ghost Pair operators also begin with partial faction knowledge about Registry players.

---

#### Registry

**Faction:** Variable, assigned during setup

**Boot Sequence:**

- Registry players keep their eyes closed during setup.
- When instructed by the Operator, Registry players in the Green faction raise their hands, then lower them.
- When instructed again, Registry players in the Red faction raise their hands, then lower them.
- Registry players gain **no information** from this process.

**Program:**

- Select a player.
- Learn that player's role.

**Design Notes:**

- Registry is an information source for Ghost Pair during boot sequence, not an information receiver.
- Registry has a strong direct information program during normal play.

---

### Faction Truth Roles

Keep only one direct faction-check family in active use at a time.

#### Handshake

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Learn: `Are they on your faction? (Yes / No)`

**Design Notes:**

- This is the cleanest direct faction-check role in the pool.
- Do not duplicate this role family with near-identical alternatives.

---

### Architect Roles

#### Signal Trace

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Learn: `Are they the current Architect? (Yes / No)`

---

#### Rerouter

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- The next time that player runs a program, the target of that program becomes the Architect.

**Resolution Rules:**

- The effect is delayed and persists until that player runs a program.
- The effect applies once, then expires.
- Because players may not target themselves, the affected executor cannot make themselves Architect through this effect.
- If the executed program has multiple targets, the Operator selects which target becomes the Architect.

**Design Notes:**

- This role changes progression indirectly through player behavior rather than by naming the new Architect outright.
- It creates uncertainty, pressure, and counterplay around who receives programs and who they choose to target.

---

### Trace and Action Truth Roles

These roles should reveal information that is not already obvious from watching the room.

#### Trace Auditor

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Learn:
  - what program they last ran
  - whose program it was

---

#### Target Trace

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Learn who they last targeted.

---

#### Snapshot

**Faction:** Variable, assigned during setup

**Program:**

- Learn the full details of the most recent trace-log entry.

---

#### Exec Check

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Learn: `Did their last action succeed? (Yes / No)`

---

### Disruption Roles

#### Kill Switch

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Their next program use has no effect.

**Design Notes:**

- The Operator should return: `No effect` or `Action failed`.
- The result should not reveal that the run was blocked.

---

#### Scrambler

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- The next time they appear in the trace log, one field is incorrect:
  - identity
  - source
  - or corruption status

**Design Notes:**

- Must not remove the trace entry entirely.
- Should create doubt, not erase information.

---

### Corruption Roles

#### Spoofer

**Faction:** Variable, assigned during setup

**Program:**

- Learn the role of a target player.

**Hidden Effect:**

- The executor becomes **corrupted** if the Spoofer role is armed.

**Constraints:**

- Only one active corruption from this role may exist at a time.
- The Spoofer role begins the game armed.
- After corruption is applied through the Spoofer program, the Spoofer role must receive another program and access the Operator to re-arm corruption.

**Design Notes:**

- Corruption applies to the executor, not the target.
- This program should appear useful and desirable.
- Delegation and trust remain central to re-use.

---

#### Sink

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- If they are corrupted, remove corruption from them and take that corruption onto yourself.

**Design Notes:**

- This role pulls corruption off another player by acting as a dirty drain for the Grid.
- It keeps corruption in circulation rather than destroying it.
- It creates strategic risk for the user and for anyone trusting them afterward.

---

#### Purge

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- If they are currently corrupted, remove that corruption from the game entirely.

**Design Notes:**

- This is a true purge rather than a transfer.
- If used on a non-corrupted player, it fails.
- Keep this role distinct from Sink in both rules and table language.

---

#### Scanner

**Faction:** Variable, assigned during setup

**Program:**

- Select a player.
- Learn: `Are they currently corrupted? (Yes / No)`

---

### Special Roles

#### Bootstrap

**Faction:** Variable, assigned during setup

**Program:**

- Initiate endgame.

**Conditions:**

- Can only be used after a minimum number of nodes are built. Recommended: 3.

**Effect:**

- Triggers the final phase of the game.
- Remaining nodes determine the outcome.

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
- direct Architect truth
- direct corruption truth
- direct action or trace-log truth
- clear disruption of one of the above

Avoid roles that:

- duplicate another role except for setup wrapper
- reveal information already strongly visible in the room
- produce weak, partial, or statistical output
- only matter in rare edge cases

Rare systemic roles such as **Spoofer**, **Sink**, **Purge**, and **Rerouter** should usually appear at most once each in a test setup.
