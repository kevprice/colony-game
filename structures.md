# Structures (v0.1)

Structures represent permanent changes to the colony.

- All structures are known to players at the start.
- Each structure is aligned to Red or Green.
- Each build shifts the game state and win condition.

---

## Red-Aligned Structures

### Logging

**Effect:**

- Enables access to the system log via powers.

**Log Entries Include:**

- executor, or who used the power
- source, or whose power was used
- power name
- corruption status of the executor
- progressor status of the executor

**Design Notes:**

- Log access must be mediated by powers.
- Players do not see the full log by default.

---

### Security

**Effect:**

- The facilitator may announce: `An action has occurred`.

**Design Notes:**

- Does not reveal who or what.
- Increases tension and timing awareness.

---

### Detention

**Effect:**

- The progressor may restrict a player from receiving powers temporarily.

**Design Notes:**

- Duration should be short, such as 2 to 3 minutes.
- Must not fully remove a player from the game.

---

## Green-Aligned Structures

### Diplomacy

**Effect:**

- Progression requires:
  - the progressor
  - and one additional approving player

**Design Notes:**

- Creates a multi-party trust requirement.
- Slows down progression.

---

### Encryption

**Effect:**

- Log queries return incomplete data:
  - one field is hidden or obscured

**Design Notes:**

- Should not fully block log access.
- Creates ambiguity in interpretation.

---

## Structure Design Guidelines

Each structure should:

- shift the balance toward a faction
- modify how information flows or actions resolve
- create new player decisions or tensions

Avoid:

- neutral structures
- purely passive effects
- effects that remove player agency

---

## Future Expansion

Possible future structures:

- Advanced Logging, for full traceability
- Distributed Control, for multiple progressors
- Immunity Layers, for temporary protection from effects

These should be introduced cautiously and tested incrementally.
