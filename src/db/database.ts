import Database from "better-sqlite3";
import crypto from "node:crypto";
import path from "node:path";
import {
  AdminRepairInput,
  AuditEvent,
  BeginExecutionInput,
  ExecutionRecord,
  Faction,
  FactionScoreState,
  InstallEffectInput,
  InstalledEffect,
  InstalledEffectDefinition,
  InstalledEffectId,
  PendingEffect,
  PendingInstallApproval,
  Player,
  ProgramCard,
  RegisterPlayerInput,
  ResolveInstallApprovalInput,
  ResolveExecutionInput,
  RoleId,
  Session,
  StartSessionInput,
  TraceLogEntry,
  VisibleInstalledEffect
} from "../domain/types";
import { rolePoolForPlayerCount, shuffle } from "../domain/helpers";
import { resolveExecution } from "../domain/engine";
import { PROGRAM_DEFINITIONS } from "../domain/catalog";
import {
  createInitialFactionScoreState,
  getAvailableEffects,
  getCurrentUnlockTier,
  INSTALLED_EFFECT_DEFINITIONS
} from "../domain/effects";

const dbPath = process.env.COLONY_DB_PATH
  ? path.resolve(process.env.COLONY_DB_PATH)
  : path.join(process.cwd(), "colony.sqlite");
export const db = new Database(dbPath);
const UNASSIGNED_VALUE = "__UNASSIGNED__";

db.pragma("journal_mode = WAL");

export function initializeDatabase() {
  db.exec(`
    create table if not exists sessions (
      id text primary key,
      name text not null,
      status text not null,
      player_count integer not null,
      include_bootstrap integer not null,
      active_role_ids text not null,
      architect_player_ids text not null default '[]',
      corrupted_player_id text,
      spoofer_armed integer not null,
      armed_corruption_role_id text,
      red_points integer not null default 0,
      green_points integer not null default 0,
      victory_threshold integer not null default 5,
      last_architect_install_programs text not null default '{}',
      pending_install_approval text,
      lockout_player_id text,
      lockout_until text,
      created_at text not null
    );
    create table if not exists players (
      id text primary key,
      session_id text not null,
      seat_number integer not null,
      join_token text not null unique,
      qr_token text not null unique,
      display_name text,
      registered_at text,
      faction text not null,
      role_id text not null
    );
    create table if not exists program_cards (
      id text primary key,
      session_id text not null,
      qr_token text not null unique,
      role_id text not null,
      source_player_id text not null,
      envelope_label text not null
    );
    create table if not exists executions (
      id text primary key,
      session_id text not null,
      executor_player_id text not null,
      source_player_id text not null,
      program_card_id text not null,
      role_id text not null,
      input_json text not null,
      result_text text not null,
      success integer not null,
      installed_effect_id text,
      installed_target_player_id text,
      approval_player_id text,
      created_at text not null,
      invalidated_at text
    );
    create table if not exists installed_effects (
      id text primary key,
      session_id text not null,
      effect_id text not null,
      tier integer not null,
      scope text not null,
      effect_type text not null,
      owner_architect_player_id text not null,
      owner_faction text not null,
      target_player_id text,
      installed_at text not null,
      public_announcement_text text not null
    );
    create table if not exists trace_log_entries (
      id text primary key,
      session_id text not null,
      execution_id text not null,
      executor_player_id text not null,
      source_player_id text not null,
      role_id text not null,
      target_player_ids text not null,
      success integer not null,
      corruption_status text not null,
      architect_status text not null,
      detail_text text not null,
      scrambled_field text,
      created_at text not null
    );
    create table if not exists pending_effects (
      id text primary key,
      session_id text not null,
      effect_type text not null,
      target_player_id text not null,
      payload_json text not null,
      created_at text not null
    );
    create table if not exists audit_events (
      id text primary key,
      session_id text not null,
      action text not null,
      detail_json text not null,
      created_at text not null
    );
  `);
  ensureColumn("sessions", "architect_player_ids", "text not null default '[]'");
  ensureColumn("sessions", "architect_player_id", "text");
  ensureColumn("sessions", "built_nodes", "text not null default '[]'");
  ensureColumn("sessions", "last_architect_build_program", "text");
  ensureColumn("sessions", "armed_corruption_role_id", "text");
  ensureColumn("sessions", "red_points", "integer not null default 0");
  ensureColumn("sessions", "green_points", "integer not null default 0");
  ensureColumn("sessions", "victory_threshold", "integer not null default 5");
  ensureColumn("sessions", "last_architect_install_programs", "text not null default '{}'");
  ensureColumn("sessions", "pending_install_approval", "text");
  ensureColumn("executions", "installed_effect_id", "text");
  ensureColumn("executions", "installed_target_player_id", "text");
}

function id(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function now(): string {
  return new Date().toISOString();
}

export function createSession(input: StartSessionInput) {
  const sessionId = id("sess");
  const roles = rolePoolForPlayerCount(input.playerCount, input.includeBootstrap);
  const shuffledRoles = shuffle(roles);

  const session: Session = {
    id: sessionId,
    name: input.name,
    status: "registration",
    playerCount: input.playerCount,
    includeBootstrap: input.includeBootstrap,
    activeRoleIds: shuffledRoles,
    architectPlayerIds: [],
    corruptedPlayerId: null,
    spooferArmed: true,
    armedCorruptionRoleId: "Spoofer",
    ...createInitialFactionScoreState(input.playerCount),
    lastArchitectInstallPrograms: {},
    pendingInstallApproval: null,
    lockoutPlayerId: null,
    lockoutUntil: null,
    createdAt: now()
  };

  const sessionColumns = [
    "id",
    "name",
    "status",
    "player_count",
    "include_bootstrap",
    "active_role_ids",
    "architect_player_id",
    "architect_player_ids",
    "corrupted_player_id",
    "spoofer_armed",
    "armed_corruption_role_id",
    "built_nodes",
    "last_architect_build_program",
    "red_points",
    "green_points",
    "victory_threshold",
    "last_architect_install_programs",
    "pending_install_approval",
    "lockout_player_id",
    "lockout_until",
    "created_at"
  ];
  const sessionValues: unknown[] = [
    session.id,
    session.name,
    session.status,
    session.playerCount,
    session.includeBootstrap ? 1 : 0,
    JSON.stringify(session.activeRoleIds),
    null,
    JSON.stringify(session.architectPlayerIds),
    session.corruptedPlayerId,
    session.spooferArmed ? 1 : 0,
    session.armedCorruptionRoleId,
    JSON.stringify([]),
    null,
    session.redPoints,
    session.greenPoints,
    session.victoryThreshold,
    JSON.stringify(session.lastArchitectInstallPrograms),
    null,
    session.lockoutPlayerId,
    session.lockoutUntil,
    session.createdAt
  ];
  db.prepare(`
    insert into sessions (${sessionColumns.join(", ")})
    values (${sessionColumns.map(() => "?").join(", ")})
  `).run(...sessionValues);

  const playersInsert = db.prepare(`
    insert into players (id, session_id, seat_number, join_token, qr_token, display_name, registered_at, faction, role_id)
    values (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const cardsInsert = db.prepare(`
    insert into program_cards (id, session_id, qr_token, role_id, source_player_id, envelope_label)
    values (?, ?, ?, ?, ?, ?)
  `);

  const players: Player[] = [];
  shuffledRoles.forEach((roleId, index) => {
    const player: Player = {
      id: id("player"),
      sessionId,
      seatNumber: index + 1,
      joinToken: id("join"),
      qrToken: `player:${id("qr")}`,
      displayName: null,
      registeredAt: null,
      faction: null,
      roleId: null
    };
    players.push(player);
    playersInsert.run(
      player.id,
      player.sessionId,
      player.seatNumber,
      player.joinToken,
      player.qrToken,
      player.displayName,
      player.registeredAt,
      UNASSIGNED_VALUE,
      UNASSIGNED_VALUE
    );
  });

  players.forEach((player) => {
    cardsInsert.run(
      id("card"),
      sessionId,
      `program:${id("qr")}`,
      UNASSIGNED_VALUE,
      player.id,
      `ENV-${player.seatNumber.toString().padStart(2, "0")}`
    );
  });

  db.prepare("update players set faction = ?, role_id = ? where session_id = ?").run(
    UNASSIGNED_VALUE,
    UNASSIGNED_VALUE,
    sessionId
  );
  db.prepare("update program_cards set role_id = ? where session_id = ?").run(UNASSIGNED_VALUE, sessionId);

  const architect = shuffle(players)[0];
  const updateClauses = ["architect_player_ids = ?", "architect_player_id = ?"];
  const updateValues: unknown[] = [JSON.stringify([architect.id]), architect.id];
  updateValues.push(sessionId);
  db.prepare(`update sessions set ${updateClauses.join(", ")} where id = ?`).run(...updateValues);
  logAudit(sessionId, "session-created", { architectPlayerIds: [architect.id] });
  return getSessionBundle(sessionId);
}

export function registerPlayer(input: RegisterPlayerInput) {
  const player = findPlayerRowByQr(input.playerQrToken, input.sessionId);
  if (!player) throw new Error("Player QR not found for this session.");
  if (player.registered_at) throw new Error("This player has already registered.");
  if (!input.displayName?.trim()) throw new Error("Display name is required.");

  const session = getSession(input.sessionId);
  const players = getPlayers(input.sessionId);
  const remainingRoles = getRemainingRoles(session, players);
  const remainingFactions = getRemainingFactions(session.playerCount, players);
  const assignedRoleId = shuffle(remainingRoles)[0];
  const assignedFaction = shuffle(remainingFactions)[0];
  if (!assignedRoleId || !assignedFaction) {
    throw new Error("No remaining role or faction assignment is available.");
  }

  const registeredAt = now();
  db.prepare("update players set display_name = ?, registered_at = ?, faction = ?, role_id = ? where id = ?").run(
    input.displayName.trim(),
    registeredAt,
    assignedFaction,
    assignedRoleId,
    player.id
  );
  db.prepare("update program_cards set role_id = ? where source_player_id = ?").run(assignedRoleId, player.id);
  const registeredCount = db
    .prepare("select count(*) as count from players where session_id = ? and registered_at is not null")
    .get(input.sessionId) as { count: number };
  if (registeredCount.count >= session.playerCount) {
    persistSession({ ...session, status: "active" });
  }
  logAudit(String(player.session_id), "player-registered", { playerId: player.id });
  return getPlayerById(String(player.id));
}

export function getSessionBundle(sessionId: string, viewerPlayerId?: string | null) {
  const session = getSession(sessionId);
  const installedEffects = getInstalledEffects(sessionId);
  return {
    session,
    installedEffects: getVisibleInstalledEffects(sessionId, viewerPlayerId ?? null),
    factionScore: getFactionScoreState(session),
    unlockTier: getCurrentUnlockTier(installedEffects.length),
    players: getPlayers(sessionId),
    programCards: getProgramCards(sessionId),
    pendingEffects: getPendingEffects(sessionId),
    recentExecutions: getExecutions(sessionId).slice(0, 10),
    traceLog: getTraceLog(sessionId).slice(0, 20),
    auditEvents: getAuditEvents(sessionId).slice(0, 20)
  };
}

export function getAdminSessionBundle(sessionId: string) {
  const session = getSession(sessionId);
  const installedEffects = getInstalledEffects(sessionId);
  return {
    session,
    installedEffects,
    visibleInstalledEffects: getVisibleInstalledEffects(sessionId, null),
    factionScore: getFactionScoreState(session),
    unlockTier: getCurrentUnlockTier(installedEffects.length),
    players: getPlayers(sessionId),
    programCards: getProgramCards(sessionId),
    pendingEffects: getPendingEffects(sessionId),
    recentExecutions: getExecutions(sessionId).slice(0, 10),
    traceLog: getTraceLog(sessionId).slice(0, 20),
    auditEvents: getAuditEvents(sessionId).slice(0, 20)
  };
}

export function beginExecution(input: BeginExecutionInput) {
  const session = getSession(input.sessionId);
  const executor = getPlayerByQr(input.executorQrToken, input.sessionId);
  const programCard = getProgramCardByQr(input.programQrToken, input.sessionId);
  const source = getPlayerById(programCard.sourcePlayerId);
  if (!executor.registeredAt) throw new Error("Executor is not registered.");
  if (!source.roleId || !source.faction) throw new Error("Source player is not fully registered.");
  if (session.lockoutPlayerId === executor.id && session.lockoutUntil && session.lockoutUntil > now()) {
    throw new Error("That player is currently locked out.");
  }
  const lastExecution = db
    .prepare(
      `select * from executions
       where session_id = ? and executor_player_id = ? and invalidated_at is null
       order by created_at desc limit 1`
    )
    .get(input.sessionId, executor.id) as Record<string, unknown> | undefined;
  if (lastExecution && String(lastExecution.role_id) === programCard.roleId) {
    throw new Error("The executor cannot run the same program twice in a row.");
  }
  if (!programCard.roleId) throw new Error("Program card is not yet assigned.");
  const definition = PROGRAM_DEFINITIONS[programCard.roleId];
  return {
    session,
    executor,
    source,
    programCard,
    programDefinition: {
      roleId: definition.roleId,
      inputType: definition.inputType,
      prompt: genericPromptForInputType(definition.inputType)
    },
    availablePlayers: getPlayers(input.sessionId).map((player) => ({
      id: player.id,
      seatNumber: player.seatNumber,
      displayName: player.displayName ?? `Player ${player.seatNumber}`
    }))
  };
}

export function resolveAndStoreExecution(input: ResolveExecutionInput) {
  const begin = beginExecution(input);
  const session = begin.session;
  const players = getPlayers(input.sessionId);
  const installedEffects = getInstalledEffects(input.sessionId);
  const lastExecutions = new Map<string, ExecutionRecord | undefined>();
  getExecutions(input.sessionId).forEach((execution) => {
    if (!lastExecutions.has(execution.executorPlayerId)) {
      lastExecutions.set(execution.executorPlayerId, execution);
    }
  });
  const lastTraces = new Map<string, TraceLogEntry | undefined>();
  const traceLog = getTraceLog(input.sessionId);
  traceLog.forEach((trace) => {
    if (!lastTraces.has(trace.executorPlayerId)) {
      lastTraces.set(trace.executorPlayerId, trace);
    }
  });

  const resolution = resolveExecution(input, {
    session,
    players,
      executor: begin.executor,
      source: begin.source,
      programCard: begin.programCard,
      installedEffectIds: installedEffects.map((effect) => effect.effectId),
      totalInstalledEffects: installedEffects.length,
      pendingEffects: getPendingEffects(input.sessionId),
      lastExecutionByPlayer: lastExecutions,
      lastTraceByPlayer: lastTraces,
      fullTraceLog: traceLog,
      latestTrace: traceLog[0]
  });

  const executionId = id("exec");
  const createdAt = now();
  const nextSession = { ...session, ...resolution.sessionPatch };
  persistSession(nextSession);

  db.prepare(`
    insert into executions (
      id, session_id, executor_player_id, source_player_id, program_card_id, role_id, input_json, result_text,
      success, installed_effect_id, installed_target_player_id, approval_player_id, created_at, invalidated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null)
  `).run(
    executionId,
    input.sessionId,
    begin.executor.id,
    begin.source.id,
    begin.programCard.id,
    begin.programCard.roleId,
    resolution.execution.inputJson,
    resolution.execution.resultText,
    resolution.execution.success,
    resolution.execution.installedEffectId,
    resolution.execution.installedTargetPlayerId,
    resolution.execution.approvalPlayerId,
    createdAt
  );

  if (resolution.traceEntry) {
    const traceId = id("trace");
    db.prepare(`
      insert into trace_log_entries (
        id, session_id, execution_id, executor_player_id, source_player_id, role_id, target_player_ids,
        success, corruption_status, architect_status, detail_text, scrambled_field, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      traceId,
      input.sessionId,
      executionId,
      resolution.traceEntry.executorPlayerId,
      resolution.traceEntry.sourcePlayerId,
      resolution.traceEntry.roleId,
      JSON.stringify(resolution.traceEntry.targetPlayerIds),
      resolution.traceEntry.success ? 1 : 0,
      resolution.traceEntry.corruptionStatus,
      resolution.traceEntry.architectStatus,
      resolution.traceEntry.detailText,
      resolution.traceEntry.scrambledField,
      createdAt
    );
  }

  for (const effect of resolution.addPendingEffects) {
    db.prepare(`
      insert into pending_effects (id, session_id, effect_type, target_player_id, payload_json, created_at)
      values (?, ?, ?, ?, ?, ?)
    `).run(id("pe"), input.sessionId, effect.effectType, effect.targetPlayerId, effect.payloadJson, createdAt);
  }

  if (resolution.consumePendingEffectIds.length > 0) {
    const deleteStmt = db.prepare("delete from pending_effects where id = ?");
    for (const pendingId of new Set(resolution.consumePendingEffectIds)) {
      deleteStmt.run(pendingId);
    }
  }

  resolution.auditNotes.forEach((note) => logAudit(input.sessionId, "engine-note", { note }));
  const nextInstalledEffects = getInstalledEffects(input.sessionId);
  return {
    executionId,
    resultText: resolution.execution.resultText,
    success: Boolean(resolution.execution.success),
    traceLogEnabled: isTraceLogEnabled(nextSession, nextInstalledEffects),
    installedEffectId: resolution.execution.installedEffectId,
    architectPlayerIds: nextSession.architectPlayerIds,
    corruptedPlayerId: nextSession.corruptedPlayerId,
    availableInstalledEffects: getAvailableEffects(nextInstalledEffects.length),
    currentUnlockTier: getCurrentUnlockTier(nextInstalledEffects.length).currentTier,
    factionScore: getFactionScoreState(nextSession)
  };
}

export function installEffectFromExecution(input: InstallEffectInput) {
  const session = getSession(input.sessionId);
  const executor = getPlayerByQr(input.executorQrToken, input.sessionId);
  const installedEffects = getInstalledEffects(input.sessionId);
  const execution = db
    .prepare("select * from executions where id = ? and session_id = ? and invalidated_at is null")
    .get(input.executionId, input.sessionId) as any;
  if (!execution) throw new Error("Execution not found.");
  if (execution.executor_player_id !== executor.id) throw new Error("Only the original executor may build from this run.");
  if (!session.architectPlayerIds.includes(executor.id)) throw new Error("That player is not an Architect.");
  if (session.pendingInstallApproval) throw new Error("A previous install is still awaiting approval.");
  if (session.lastArchitectInstallPrograms[executor.id] === execution.role_id) {
    throw new Error("That Architect cannot install with the same program twice in a row.");
  }
  const effectDefinition = INSTALLED_EFFECT_DEFINITIONS[input.installedEffectId];
  if (!effectDefinition) {
    throw new Error("Unknown installed effect.");
  }
  const availableEffects = getAvailableEffects(installedEffects.length).map((effect) => effect.id);
  if (!availableEffects.includes(input.installedEffectId)) {
    throw new Error("That effect is not yet unlocked.");
  }
  if (effectDefinition.scope === "targeted" && !input.targetPlayerId) {
    throw new Error("That effect requires a target player.");
  }
  if (effectDefinition.scope === "targeted" && input.targetPlayerId === executor.id) {
    throw new Error("An Architect cannot assign a targeted effect to themselves.");
  }
  if (effectDefinition.scope === "targeted" && input.targetPlayerId) {
    const targetEffectCount = installedEffects.filter((effect) => effect.targetPlayerId === input.targetPlayerId).length;
    if (targetEffectCount >= 2) {
      throw new Error("That player already holds the maximum number of capability effects.");
    }
  }
  const requiredApprovals = getRequiredInstallApprovals(installedEffects);
  if (requiredApprovals > 0 && !input.approvalPlayerId) {
    throw new Error(`This install requires ${requiredApprovals} approval${requiredApprovals > 1 ? "s" : ""}.`);
  }

  const isUntrustedArchitect = installedEffects.some(
    (effect) => effect.effectId === "Untrusted Actor" && effect.targetPlayerId === executor.id
  );
  if (isUntrustedArchitect) {
    const pendingInstallApproval: PendingInstallApproval = {
      executionId: input.executionId,
      architectPlayerId: executor.id,
      installedEffectId: input.installedEffectId,
      targetPlayerId: input.targetPlayerId ?? null,
      requestedAt: now()
    };
    persistSession({ ...session, pendingInstallApproval });
    logAudit(input.sessionId, "install-awaiting-approval", pendingInstallApproval);
    return {
      executionId: input.executionId,
      installedEffectId: input.installedEffectId,
      targetPlayerId: input.targetPlayerId ?? null,
      architectPlayerIds: session.architectPlayerIds,
      factionScore: getFactionScoreState(session),
      unlockTier: getCurrentUnlockTier(installedEffects.length),
      installedEffects,
      publicAnnouncementText: "Install is awaiting approval from the next Terminal user.",
      pendingApproval: true
    };
  }

  const finalized = finalizeInstall(
    session,
    executor,
    installedEffects,
    input.executionId,
    execution.role_id as RoleId,
    input.installedEffectId,
    input.targetPlayerId ?? null,
    input.approvalPlayerId ?? null
  );
  const nextInstalledEffects = getInstalledEffects(input.sessionId);
  return {
    executionId: input.executionId,
    installedEffectId: input.installedEffectId,
    targetPlayerId: input.targetPlayerId ?? null,
    architectPlayerIds: finalized.nextSession.architectPlayerIds,
    factionScore: getFactionScoreState(finalized.nextSession),
    unlockTier: getCurrentUnlockTier(nextInstalledEffects.length),
    installedEffects: nextInstalledEffects,
    publicAnnouncementText: finalized.effectDefinition.publicAnnouncementText
  };
}

export function resolveInstallApproval(input: ResolveInstallApprovalInput) {
  const session = getSession(input.sessionId);
  const pendingApproval = session.pendingInstallApproval;
  if (!pendingApproval) {
    throw new Error("There is no install awaiting approval.");
  }
  const approver = getPlayerByQr(input.approverQrToken, input.sessionId);
  if (approver.id === pendingApproval.architectPlayerId) {
    throw new Error("Another player must approve or disallow this install.");
  }

  const clearedSession: Session = { ...session, pendingInstallApproval: null };
  persistSession(clearedSession);

  if (!input.approve) {
    logAudit(input.sessionId, "install-disallowed", {
      executionId: pendingApproval.executionId,
      architectPlayerId: pendingApproval.architectPlayerId,
      approverPlayerId: approver.id
    });
    return {
      approved: false,
      architectPlayerIds: clearedSession.architectPlayerIds,
      factionScore: getFactionScoreState(clearedSession)
    };
  }

  const architect = getPlayerById(pendingApproval.architectPlayerId);
  const installedEffects = getInstalledEffects(input.sessionId);
  const finalized = finalizeInstall(
    clearedSession,
    architect,
    installedEffects,
    pendingApproval.executionId,
    (db.prepare("select role_id from executions where id = ?").get(pendingApproval.executionId) as { role_id: RoleId }).role_id,
    pendingApproval.installedEffectId,
    pendingApproval.targetPlayerId,
    approver.id
  );
  const nextInstalledEffects = getInstalledEffects(input.sessionId);
  return {
    approved: true,
    installedEffectId: pendingApproval.installedEffectId,
    targetPlayerId: pendingApproval.targetPlayerId,
    architectPlayerIds: finalized.nextSession.architectPlayerIds,
    factionScore: getFactionScoreState(finalized.nextSession),
    unlockTier: getCurrentUnlockTier(nextInstalledEffects.length),
    installedEffects: nextInstalledEffects,
    publicAnnouncementText: finalized.effectDefinition.publicAnnouncementText
  };
}

export function applyAdminRepair(input: AdminRepairInput) {
  const session = getSession(input.sessionId);
  if (input.action === "set-architects") {
    persistSession({ ...session, architectPlayerIds: (input.payload.playerIds as string[]) ?? [] });
  } else if (input.action === "set-corruption") {
    persistSession({
      ...session,
      corruptedPlayerId: (input.payload.playerId as string | null) ?? null,
      spooferArmed: Boolean(input.payload.spooferArmed ?? session.spooferArmed),
      armedCorruptionRoleId: (input.payload.armedCorruptionRoleId as Session["armedCorruptionRoleId"]) ?? session.armedCorruptionRoleId
    });
  } else if (input.action === "invalidate-execution") {
    db.prepare("update executions set invalidated_at = ? where id = ?").run(now(), String(input.payload.executionId));
  } else if (input.action === "set-installed-effects") {
    db.prepare("delete from installed_effects where session_id = ?").run(input.sessionId);
  } else if (input.action === "set-faction-score") {
    persistSession({
      ...session,
      redPoints: Number(input.payload.redPoints ?? session.redPoints),
      greenPoints: Number(input.payload.greenPoints ?? session.greenPoints)
    });
  } else {
    throw new Error("Unsupported repair action.");
  }
  logAudit(input.sessionId, `admin:${input.action}`, input.payload);
  return getSessionBundle(input.sessionId);
}

function persistSession(session: Session) {
  const setClauses = [
    "status = ?",
    "architect_player_id = ?",
    "architect_player_ids = ?",
    "corrupted_player_id = ?",
    "spoofer_armed = ?",
    "armed_corruption_role_id = ?",
    "built_nodes = ?",
    "last_architect_build_program = ?",
    "red_points = ?",
    "green_points = ?",
    "victory_threshold = ?",
    "last_architect_install_programs = ?",
    "pending_install_approval = ?",
    "lockout_player_id = ?",
    "lockout_until = ?"
  ];
  const values: unknown[] = [
    session.status,
    session.architectPlayerIds[0] ?? null,
    JSON.stringify(session.architectPlayerIds),
    session.corruptedPlayerId,
    session.spooferArmed ? 1 : 0,
    session.armedCorruptionRoleId,
    JSON.stringify([]),
    null,
    session.redPoints,
    session.greenPoints,
    session.victoryThreshold,
    JSON.stringify(session.lastArchitectInstallPrograms),
    session.pendingInstallApproval ? JSON.stringify(session.pendingInstallApproval) : null,
    session.lockoutPlayerId,
    session.lockoutUntil
  ];
  values.push(session.id);
  db.prepare(`
    update sessions
    set ${setClauses.join(", ")}
    where id = ?
  `).run(...values);
}

function logAudit(sessionId: string, action: string, detail: unknown) {
  db.prepare("insert into audit_events (id, session_id, action, detail_json, created_at) values (?, ?, ?, ?, ?)").run(
    id("audit"),
    sessionId,
    action,
    JSON.stringify(detail),
    now()
  );
}

export function getSessions(): Session[] {
  return db.prepare("select * from sessions order by created_at desc").all().map(mapSession);
}

export function getSession(sessionId: string): Session {
  const row = db.prepare("select * from sessions where id = ?").get(sessionId);
  if (!row) throw new Error("Session not found.");
  return mapSession(row);
}

export function getPlayers(sessionId: string): Player[] {
  return db.prepare("select * from players where session_id = ? order by seat_number asc").all(sessionId).map(mapPlayer);
}

function getPlayerById(playerId: string): Player {
  const row = db.prepare("select * from players where id = ?").get(playerId);
  if (!row) throw new Error("Player not found.");
  return mapPlayer(row);
}

function getPlayerByQr(qrToken: string, sessionId: string): Player {
  const row = findPlayerRowByQr(qrToken, sessionId);
  if (!row) throw new Error("Player QR not found.");
  return mapPlayer(row);
}

export function getProgramCards(sessionId: string): ProgramCard[] {
  return db.prepare("select * from program_cards where session_id = ? order by envelope_label asc").all(sessionId).map(mapProgramCard);
}

export function getInstalledEffects(sessionId: string): InstalledEffect[] {
  return db
    .prepare("select * from installed_effects where session_id = ? order by installed_at asc")
    .all(sessionId)
    .map(mapInstalledEffect);
}

export function getVisibleInstalledEffects(sessionId: string, viewerPlayerId: string | null): VisibleInstalledEffect[] {
  const installedEffects = getInstalledEffects(sessionId);
  const players = getPlayers(sessionId);
  const publicOwnershipVisible = installedEffects.some((effect) => effect.effectId === "Public Ownership Map");
  const privateOwnershipVisible =
    !!viewerPlayerId &&
    installedEffects.some(
      (effect) => effect.effectId === "Private Ownership Map" && effect.targetPlayerId === viewerPlayerId
    );
  const canSeeOwners = publicOwnershipVisible || privateOwnershipVisible;

  return installedEffects.map((effect) => {
    const targetPlayer = effect.targetPlayerId ? players.find((player) => player.id === effect.targetPlayerId) : null;
    const targetHidden = effect.scope === "targeted" && !canSeeOwners;
    return {
      id: effect.id,
      effectId: effect.effectId,
      tier: effect.tier,
      scope: effect.scope,
      effectType: effect.effectType,
      ownerFaction: effect.ownerFaction,
      targetPlayerId: targetHidden ? null : effect.targetPlayerId,
      targetLabel: targetHidden ? null : targetPlayer?.displayName ?? (targetPlayer ? `Player ${targetPlayer.seatNumber}` : null),
      targetHidden,
      installedAt: effect.installedAt,
      publicAnnouncementText: effect.publicAnnouncementText
    };
  });
}

function getProgramCardByQr(qrToken: string, sessionId: string): ProgramCard {
  const row = findProgramCardRowByQr(qrToken, sessionId);
  if (!row) throw new Error("Program QR not found.");
  return mapProgramCard(row);
}

export function getExecutions(sessionId: string): ExecutionRecord[] {
  return db
    .prepare("select * from executions where session_id = ? and invalidated_at is null order by created_at desc")
    .all(sessionId)
    .map(mapExecution);
}

export function getTraceLog(sessionId: string): TraceLogEntry[] {
  return db.prepare("select * from trace_log_entries where session_id = ? order by created_at desc").all(sessionId).map(mapTrace);
}

export function getPendingEffects(sessionId: string): PendingEffect[] {
  return db.prepare("select * from pending_effects where session_id = ? order by created_at asc").all(sessionId).map(mapPending);
}

export function getAuditEvents(sessionId: string): AuditEvent[] {
  return db.prepare("select * from audit_events where session_id = ? order by created_at desc").all(sessionId).map(mapAudit);
}

function mapSession(row: any): Session {
  const architectPlayerIds = JSON.parse(row.architect_player_ids ?? "[]");
  if (architectPlayerIds.length === 0 && row.architect_player_id) {
    architectPlayerIds.push(row.architect_player_id);
  }
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    playerCount: row.player_count,
    includeBootstrap: Boolean(row.include_bootstrap),
    activeRoleIds: JSON.parse(row.active_role_ids),
    architectPlayerIds,
    corruptedPlayerId: row.corrupted_player_id,
    spooferArmed: Boolean(row.spoofer_armed),
    armedCorruptionRoleId:
      row.armed_corruption_role_id ?? (Boolean(row.spoofer_armed) ? "Spoofer" : null),
    redPoints: Number(row.red_points ?? 0),
    greenPoints: Number(row.green_points ?? 0),
    victoryThreshold: Number(row.victory_threshold ?? 5),
    lastArchitectInstallPrograms: JSON.parse(row.last_architect_install_programs ?? "{}"),
    pendingInstallApproval: row.pending_install_approval ? JSON.parse(row.pending_install_approval) : null,
    lockoutPlayerId: row.lockout_player_id,
    lockoutUntil: row.lockout_until,
    createdAt: row.created_at
  };
}

function mapPlayer(row: any): Player {
  return {
    id: row.id,
    sessionId: row.session_id,
    seatNumber: row.seat_number,
    joinToken: row.join_token,
    qrToken: canonicalPlayerQrToken(row.seat_number),
    displayName: row.display_name,
    registeredAt: row.registered_at,
    faction: row.faction === UNASSIGNED_VALUE ? null : row.faction,
    roleId: row.role_id === UNASSIGNED_VALUE ? null : row.role_id
  };
}

function mapProgramCard(row: any): ProgramCard {
  return {
    id: row.id,
    sessionId: row.session_id,
    qrToken: canonicalProgramQrToken(getSeatNumberFromEnvelopeLabel(row.envelope_label)),
    roleId: row.role_id === UNASSIGNED_VALUE ? null : row.role_id,
    sourcePlayerId: row.source_player_id,
    envelopeLabel: row.envelope_label
  };
}

function mapExecution(row: any): ExecutionRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    executorPlayerId: row.executor_player_id,
    sourcePlayerId: row.source_player_id,
    programCardId: row.program_card_id,
    roleId: row.role_id,
    inputJson: row.input_json,
    resultText: row.result_text,
    success: row.success,
    installedEffectId: row.installed_effect_id,
    installedTargetPlayerId: row.installed_target_player_id,
    approvalPlayerId: row.approval_player_id,
    createdAt: row.created_at,
    invalidatedAt: row.invalidated_at
  };
}

function mapInstalledEffect(row: any): InstalledEffect {
  return {
    id: row.id,
    sessionId: row.session_id,
    effectId: row.effect_id,
    tier: row.tier,
    scope: row.scope,
    effectType: row.effect_type,
    ownerArchitectPlayerId: row.owner_architect_player_id,
    ownerFaction: row.owner_faction,
    targetPlayerId: row.target_player_id,
    installedAt: row.installed_at,
    publicAnnouncementText: row.public_announcement_text
  };
}

function mapTrace(row: any): TraceLogEntry {
  return {
    id: row.id,
    sessionId: row.session_id,
    executionId: row.execution_id,
    executorPlayerId: row.executor_player_id,
    sourcePlayerId: row.source_player_id,
    roleId: row.role_id,
    targetPlayerIds: JSON.parse(row.target_player_ids),
    success: Boolean(row.success),
    corruptionStatus: row.corruption_status,
    architectStatus: row.architect_status,
    detailText: row.detail_text,
    scrambledField: row.scrambled_field,
    createdAt: row.created_at
  };
}

function mapPending(row: any): PendingEffect {
  return {
    id: row.id,
    sessionId: row.session_id,
    effectType: row.effect_type,
    targetPlayerId: row.target_player_id,
    payloadJson: row.payload_json,
    createdAt: row.created_at
  };
}

function mapAudit(row: any): AuditEvent {
  return {
    id: row.id,
    sessionId: row.session_id,
    action: row.action,
    detailJson: row.detail_json,
    createdAt: row.created_at
  };
}

function ensureColumn(tableName: string, columnName: string, columnDefinition: string) {
  if (!hasColumn(tableName, columnName)) {
    db.exec(`alter table ${tableName} add column ${columnName} ${columnDefinition}`);
  }
}

function canonicalPlayerQrToken(seatNumber: number): string {
  return `player:${seatNumber}`;
}

function canonicalProgramQrToken(seatNumber: number): string {
  return `program:${seatNumber}`;
}

function parseCanonicalQrSeat(qrToken: string, kind: "player" | "program"): number | null {
  const match = qrToken.match(new RegExp(`^${kind}:(?:seat:)?(\\d{1,2})$`));
  if (!match) return null;
  const seatNumber = Number(match[1]);
  return Number.isInteger(seatNumber) && seatNumber > 0 ? seatNumber : null;
}

function findPlayerRowByQr(qrToken: string, sessionId: string) {
  const canonicalSeat = parseCanonicalQrSeat(qrToken, "player");
  if (canonicalSeat !== null) {
    return db
      .prepare("select * from players where session_id = ? and seat_number = ?")
      .get(sessionId, canonicalSeat) as Record<string, unknown> | undefined;
  }
  return db.prepare("select * from players where qr_token = ? and session_id = ?").get(qrToken, sessionId) as
    | Record<string, unknown>
    | undefined;
}

function findProgramCardRowByQr(qrToken: string, sessionId: string) {
  const canonicalSeat = parseCanonicalQrSeat(qrToken, "program");
  if (canonicalSeat !== null) {
    return db
      .prepare(`
        select program_cards.*
        from program_cards
        join players on players.id = program_cards.source_player_id
        where program_cards.session_id = ? and players.seat_number = ?
      `)
      .get(sessionId, canonicalSeat) as Record<string, unknown> | undefined;
  }
  return db.prepare("select * from program_cards where qr_token = ? and session_id = ?").get(qrToken, sessionId) as
    | Record<string, unknown>
    | undefined;
}

function getSeatNumberFromEnvelopeLabel(label: string): number {
  const match = label.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function hasColumn(tableName: string, columnName: string) {
  const columns = db.prepare(`pragma table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some((column) => column.name === columnName);
}

function getFactionScoreState(session: Session): FactionScoreState {
  return {
    redPoints: session.redPoints,
    greenPoints: session.greenPoints,
    victoryThreshold: session.victoryThreshold
  };
}

function applyFactionPoint(session: Session, faction: Player["faction"]): FactionScoreState {
  if (faction === "Red") {
    return { ...getFactionScoreState(session), redPoints: session.redPoints + 1 };
  }
  return { ...getFactionScoreState(session), greenPoints: session.greenPoints + 1 };
}

function opposingFaction(faction: Faction): Faction {
  return faction === "Red" ? "Green" : "Red";
}

function getRequiredInstallApprovals(installedEffects: InstalledEffect[]): number {
  const latestApprovalEffect = [...installedEffects]
    .reverse()
    .find((effect) => effect.effectId === "Enhanced Diplomacy");
  if (!latestApprovalEffect) return 0;
  return 2;
}

function finalizeInstall(
  session: Session,
  executor: Player,
  installedEffects: InstalledEffect[],
  executionId: string,
  executionRoleId: RoleId,
  installedEffectId: InstalledEffectId,
  targetPlayerId: string | null,
  approvalPlayerId: string | null
) {
  const effectDefinition = INSTALLED_EFFECT_DEFINITIONS[installedEffectId];
  const installId = id("install");
  const installedAt = now();
  const architectWasCorrupted = session.corruptedPlayerId === executor.id;
  const ownerFaction = architectWasCorrupted
    ? opposingFaction(executor.faction as Faction)
    : (executor.faction as Faction);
  const updatedScores = applyFactionPoint(session, ownerFaction);
  const nextArchitectPrograms = {
    ...session.lastArchitectInstallPrograms,
    [executor.id]: executionRoleId
  };

  const nextSession: Session = {
    ...session,
    ...updatedScores,
    lastArchitectInstallPrograms: nextArchitectPrograms,
    pendingInstallApproval: null
  };
  const newArchitectIds = applyArchitectSideEffects(nextSession, installedEffects, effectDefinition, executor.id);
  nextSession.architectPlayerIds = newArchitectIds;
  persistSession(nextSession);
  db.prepare(
    "insert into installed_effects (id, session_id, effect_id, tier, scope, effect_type, owner_architect_player_id, owner_faction, target_player_id, installed_at, public_announcement_text) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    installId,
    session.id,
    effectDefinition.id,
    effectDefinition.tier,
    effectDefinition.scope,
    effectDefinition.effectType,
    executor.id,
    ownerFaction,
    targetPlayerId,
    installedAt,
    effectDefinition.publicAnnouncementText
  );
  db.prepare("update executions set installed_effect_id = ?, installed_target_player_id = ?, approval_player_id = ? where id = ?").run(
    installedEffectId,
    targetPlayerId,
    approvalPlayerId,
    executionId
  );
  if (updatedScores.redPoints >= updatedScores.victoryThreshold || updatedScores.greenPoints >= updatedScores.victoryThreshold) {
    nextSession.status = "ended";
    persistSession(nextSession);
  }
  logAudit(session.id, "architect-install", {
    executionId,
    executorPlayerId: executor.id,
    architectWasCorrupted,
    installedEffectId,
    targetPlayerId,
    approvalPlayerId
  });
  return { nextSession, effectDefinition };
}

function isTraceLogEnabled(session: Session, installedEffects: InstalledEffect[]): boolean {
  return installedEffects.some((effect) => effect.effectId === "Deep Log Access" || effect.effectId === "Full Transparency");
}

function applyArchitectSideEffects(
  session: Session,
  installedEffects: InstalledEffect[],
  definition: InstalledEffectDefinition,
  installerId: string
): string[] {
  if (definition.id === "Duplicate Architect") {
    const players = getPlayers(session.id).filter((player) => !session.architectPlayerIds.includes(player.id));
    const nextArchitect = shuffle(players)[0];
    if (nextArchitect) {
      return [...session.architectPlayerIds, nextArchitect.id];
    }
  }

  const instabilityActive =
    definition.id === "Architect Instability" ||
    installedEffects.some((effect) => effect.effectId === "Architect Instability");
  if (instabilityActive) {
    const players = getPlayers(session.id);
    return session.architectPlayerIds.map(() => shuffle(players)[0].id);
  }

  return session.architectPlayerIds;
}

function genericPromptForInputType(inputType: (typeof PROGRAM_DEFINITIONS)[keyof typeof PROGRAM_DEFINITIONS]["inputType"]) {
  switch (inputType) {
    case "single-player":
      return "Select player.";
    case "double-player":
      return "Select 2 players.";
    case "single-role":
      return "Select role.";
    case "none":
    default:
      return "No selection required.";
  }
}

function getRemainingRoles(session: Session, players: Player[]): RoleId[] {
  const remaining = [...session.activeRoleIds];
  for (const player of players) {
    if (!player.roleId) continue;
    const index = remaining.indexOf(player.roleId);
    if (index >= 0) {
      remaining.splice(index, 1);
    }
  }
  return remaining;
}

function getRemainingFactions(playerCount: number, players: Player[]): Faction[] {
  const remaining: Faction[] = [
    ...Array.from({ length: Math.ceil(playerCount / 2) }, () => "Red" as const),
    ...Array.from({ length: Math.floor(playerCount / 2) }, () => "Green" as const)
  ];
  for (const player of players) {
    if (!player.faction) continue;
    const index = remaining.indexOf(player.faction);
    if (index >= 0) {
      remaining.splice(index, 1);
    }
  }
  return remaining;
}
