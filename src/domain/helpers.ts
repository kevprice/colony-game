import { ExecutionRecord, InstalledEffectId, Player, RoleId, TraceLogEntry } from "./types";

export function findPlayer(players: Player[], id: string): Player {
  const player = players.find((entry) => entry.id === id);
  if (!player) throw new Error(`Player not found: ${id}`);
  return player;
}

export function playersOnSameFaction(a: Player, b: Player): boolean {
  return a.faction === b.faction;
}

export function getRoleLabel(roleId: RoleId): string {
  return roleId;
}

export function getPlayerLabel(player: Player): string {
  return player.displayName ?? `Player ${player.seatNumber}`;
}

export function createTraceDetail(
  roleId: RoleId,
  players: Player[],
  targetPlayerIds: string[],
  success: boolean
): string {
  const targets = targetPlayerIds
    .map((id) => {
      const player = players.find((entry) => entry.id === id);
      return player ? getPlayerLabel(player) : "Player ?";
    })
    .join(", ");
  return `${roleId} | targets: ${targets || "none"} | ${success ? "success" : "failed"}`;
}

export function cipherVisibleDetail(
  trace: TraceLogEntry,
  players: Player[],
  cipherVeilEnabled: boolean
): string {
  const executor = findPlayer(players, trace.executorPlayerId);
  const source = findPlayer(players, trace.sourcePlayerId);
  const targets = trace.targetPlayerIds.map((id) => getPlayerLabel(findPlayer(players, id)));
  const hiddenField = cipherVeilEnabled ? "source" : null;
  return [
    `Executor: ${getPlayerLabel(executor)}`,
    `Source: ${hiddenField === "source" ? "[OBSCURED]" : getPlayerLabel(source)}`,
    `Program: ${trace.roleId}`,
    `Targets: ${targets.length ? targets.join(", ") : "none"}`,
    `Success: ${trace.success ? "Yes" : "No"}`,
    `Corruption: ${trace.corruptionStatus === "corrupted" ? "Corrupted" : "Clear"}`,
    `Architect: ${trace.architectStatus === "architect" ? "Yes" : "No"}`
  ].join("\n");
}

export function hasInstalledEffect(effectIds: InstalledEffectId[], effectId: InstalledEffectId): boolean {
  return effectIds.includes(effectId);
}

export function rolePoolForPlayerCount(playerCount: number, includeBootstrap: boolean): RoleId[] {
  const base: RoleId[] = [
    "Ghost Pair",
    "Ghost Pair",
    "Registry",
    "Registry",
    "Handshake",
    "Signal Trace",
    "Failover",
    "Rerouter",
    "Trace Auditor",
    "Target Trace",
    "Snapshot",
    "Kill Switch",
    "Scrambler",
    "Spoofer",
    "Sink",
    "Purge",
    "Scanner"
  ];
  const pool: RoleId[] = [...base];
  if (includeBootstrap && playerCount >= 10) {
    pool.push("Bootstrap");
    if (playerCount >= 12) {
      pool.push("Bootstrap");
    }
  }
  return pool.slice(0, playerCount);
}

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let index = arr.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
  }
  return arr;
}
