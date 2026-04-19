# Roles (v0.1)

Each player is assigned:

- 1 faction, Red or Green
- 1 role

All roles provide a **power** that must be given to another player to execute.

---

## Red Roles

### Saboteur

**Faction:** Red

**Power:**

- Learn the role of a target player.

**Hidden Effect:**

- The player who executes this power becomes **corrupted**.

**Corruption Rules:**

- Only one player may be corrupted by this role at a time.
- To apply corruption again:
  - the Saboteur must receive a power
  - and access the facilitator
- If corruption is removed before rearming:
  - the Saboteur loses access to corruption

**Design Notes:**

- Corruption applies to the **executor**, not the target.
- This power should appear useful and desirable.

---

### Obfuscator

**Faction:** Red

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

**Faction:** Red

**Power:**

- Select a player.
- Their next power use has no effect.

**Design Notes:**

- The facilitator should return: `No effect` or `Action failed`.
- The result should not reveal that blocking occurred.

---

### Warden

**Faction:** Red

**Power:**

- Select a player.
- They must accept the next power given to them.

**Design Notes:**

- Forces interaction.
- Can expose or trap key roles.

---

## Green Roles

### Sentinel

**Faction:** Green

**Power:**

- Select a player.
- Learn: `Are they on your faction? (Yes / No)`

---

### Tracker

**Faction:** Green

**Power:**

- Select a player.
- Learn: `Are they the current progressor? (Yes / No)`

---

### Auditor

**Faction:** Green

**Power:**

- Select a player.
- Learn: `Have they executed a power recently? (Yes / No)`

---

### Diagnostician

**Faction:** Green

**Power:**

- Select a player.
- Learn: `Are they currently corrupted? (Yes / No)`

---

### Cleanser

**Faction:** Green

**Power:**

- Remove corruption from a target player.

**Design Notes:**

- If corruption is removed before the Saboteur rearms:
  - the Saboteur loses corruption

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

Avoid:

- weak or redundant roles
- roles that provide vague or non-actionable information

All powers must:

- be desirable enough to be passed
- create meaningful decisions when used
