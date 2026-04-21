# Nodes (v0.1)

Nodes represent permanent changes to the network.

- All nodes are known to players at the start.
- Each node is aligned to Red or Green.
- Each build shifts the game state and win condition.

---

## Red-Aligned Nodes

### Trace Archive

**Effect:**

- Enables access to the trace log via programs.

**Trace Entries Include:**

- executor, or who ran the program
- source, or whose program was run
- program name
- corruption status of the executor
- Architect status of the executor

**Design Notes:**

- Trace-log access must be mediated by programs.
- Players do not see the full trace log by default.

---

### Alarm Mesh

**Effect:**

- The Operator may announce: `An action has occurred`.

**Design Notes:**

- Does not reveal who or what.
- Increases tension and timing awareness across the network.

---

### Lockout

**Effect:**

- The Architect may restrict a player from receiving programs temporarily.

**Design Notes:**

- Duration should be short, such as 2 to 3 minutes.
- Must not fully remove a player from the game.

---

## Green-Aligned Nodes

### Consensus Patch

**Effect:**

- Progression requires:
  - the Architect
  - and one additional approving player

**Design Notes:**

- Creates a multi-party trust requirement.
- Slows down progression in exchange for shared control.

---

### Cipher Veil

**Effect:**

- Trace-log queries return incomplete data:
  - one field is hidden or obscured

**Design Notes:**

- Should not fully block trace-log access.
- Creates ambiguity in interpretation while preserving access.

---

## Node Design Guidelines

Each node should:

- shift the balance toward a faction
- modify how information flows or actions resolve
- create new player decisions or tensions

Avoid:

- neutral nodes
- purely passive effects
- effects that remove player agency

---

## Future Expansion

Possible future nodes:

- Deep Archive, for full traceability
- Distributed Core, for multiple Architects
- Shield Layers, for temporary protection from effects

These should be introduced cautiously and tested incrementally.
