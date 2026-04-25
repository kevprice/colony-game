# Installed Effects (v0.1)

Installed effects are persistent Grid modifications created by the Architect.

- Effects are not aligned to Red or Green.
- When an Architect installs an effect, that Architect's faction gains **1 point**.
- Effects remain active until game end unless an effect explicitly says otherwise.
- Installed effects are publicly highlighted by the **faction that installed them**.
- If an effect is targeted to an individual, the recipient remains hidden by default.
- Effects are split into:
  - **Capability effects**: granted to a specific player
  - **System effects**: global Grid rule changes

---

## Unlock Tiers

The effect catalog is staged across 3 tiers.

- **Tier 1**: available from game start
- **Tier 2**: unlocks after **2 total installed effects**
- **Tier 3**: unlocks after **4 total installed effects**

If multiple global effects would create incompatible rules, the **newest installed effect overrides the older one**.

A player should hold at most **2 installed capability effects** at a time.

---

## Tier 1 Effects

### Deep Log Access

**Scope:** Targeted capability

**Effect:**

- The target player gains:
  - `Whenever you run a program, you may view the last 5 trace-log entries.`

**Design Notes:**

- Strong private information tool.
- Best when the Architect trusts the recipient.

---

### Faction Insight

**Scope:** Targeted capability

**Effect:**

- The target player gains:
  - `Whenever you run a program, you may also learn whether your target is Red.`

**Design Notes:**

- Direct faction truth with strong downstream social value.
- Dangerous if gifted to the wrong person.

---

### Corruption Detection

**Scope:** Targeted capability

**Effect:**

- The target player gains:
  - `Whenever you run a program, you learn whether you are currently corrupted.`

**Design Notes:**

- Gives players a way to confirm personal risk without exposing it publicly.
- Useful when corruption is active but uncertain.

---

### Untrusted Actor

**Scope:** Targeted capability

**Effect:**

- The target becomes **untrusted**.
- If that player is currently an Architect and chooses a Grid effect to install:
  - the install does not resolve immediately
  - the next player to use the Terminal must approve or disallow it before running their own program

**Design Notes:**

- This creates pressure around a specific player instead of slowing the whole table.
- It is stronger than a generic approval tax because it points suspicion somewhere concrete.
- Best used when the Architect does not trust a likely rival, but does not yet know how to expose them directly.

---

## Tier 2 Effects

### Corruption Immunity

**Scope:** Targeted capability

**Effect:**

- The target player cannot become corrupted.

**Design Notes:**

- Highly political protective effect.
- Should remain rare and visible only to the Architect and recipient.

---

### Private Ownership Map

**Scope:** Targeted capability

**Effect:**

- The target player may see who owns each installed capability effect.

**Design Notes:**

- This is the private exception to hidden targeted ownership.
- It should create asymmetrical knowledge without making ownership public.

---

### Redirect Amplification

**Scope:** Targeted capability

**Effect:**

- The target player gains:
  - `Whenever you run a program, you may choose a different valid target for that program.`

**Design Notes:**

- Strong control piece that can create subtle table chaos.
- Needs playtesting against Failover and trace roles.

---

### Enhanced Diplomacy

**Scope:** Global system

**Effect:**

- The next Architect install requires approval from 2 additional players.

**Design Notes:**

- A stronger brake on unilateral Architect momentum.
- The newest global approval rule overrides older approval rules.

---

### Architect Instability

**Scope:** Global system

**Effect:**

- After each Architect install, Architect control is reassigned randomly.

**Design Notes:**

- Destabilizes control-heavy play.
- Should sit in Tier 2 or later because it changes the game's political center of gravity.

---

## Tier 3 Effects

### Duplicate Architect

**Scope:** Global system

**Effect:**

- There are now 2 Architects.
- Each Architect installs separately and scores for their own faction.

**Design Notes:**

- High-chaos escalation effect.
- The table should feel like control has become contested at the structural level.

---

### Public Ownership Map

**Scope:** Global system

**Effect:**

- Ownership of installed capability effects becomes public to everyone.

**Design Notes:**

- This is the public exception to hidden targeted ownership.
- It should be late enough that the reveal feels dramatic rather than routine.

---

### Full Transparency

**Scope:** Global system

**Effect:**

- The trace log becomes permanently visible to all players.
- All future actions are publicly recorded.

**Design Notes:**

- Late-game pressure release valve.
- Should not arrive too early or it risks flattening deception.

---

## Effect Design Guidance

Prefer effects that:

- create ongoing political pressure
- reward trust without guaranteeing safety
- change how information flows
- give the Architect a meaningful decision between private risk and public control

Avoid effects that:

- behave like one-shot role programs
- resolve instantly and disappear
- create irreversible lock states too early
- add bookkeeping without new decisions

---

## Future Expansion

Possible future effects:

- Shared Trace Access
- Temporary Corruption Shield
- Delayed Install Queue
- Public Architect Challenge

Introduce new effects cautiously and test them before expanding the main catalog.
