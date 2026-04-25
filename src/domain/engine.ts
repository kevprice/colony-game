import {
  ExecutionRecord,
  PendingEffect,
  Player,
  ProgramCard,
  ResolveExecutionInput,
  RoleId,
  Session,
  TraceLogEntry
} from "./types";
import { createTraceDetail, findPlayer } from "./helpers";
import { PROGRAM_DEFINITIONS } from "./catalog";

export interface ResolveDependencies {
  session: Session;
  players: Player[];
  programCard: ProgramCard;
  executor: Player;
  source: Player;
  installedEffectIds: import("./types").InstalledEffectId[];
  totalInstalledEffects: number;
  pendingEffects: PendingEffect[];
  lastExecutionByPlayer: Map<string, ExecutionRecord | undefined>;
  lastTraceByPlayer: Map<string, TraceLogEntry | undefined>;
  fullTraceLog: TraceLogEntry[];
  latestTrace?: TraceLogEntry;
}

export interface EngineResolution {
  sessionPatch: Partial<Session>;
  traceEntry: Omit<TraceLogEntry, "id" | "sessionId" | "executionId" | "createdAt"> | null;
  execution: Pick<ExecutionRecord, "inputJson" | "resultText" | "success" | "installedEffectId" | "installedTargetPlayerId" | "approvalPlayerId">;
  addPendingEffects: Array<Omit<PendingEffect, "id" | "sessionId" | "createdAt">>;
  consumePendingEffectIds: string[];
  auditNotes: string[];
}

export function resolveExecution(
  input: ResolveExecutionInput,
  deps: ResolveDependencies
): EngineResolution {
  const { session, executor, players, pendingEffects, programCard, source } = deps;
  const roleId = requireAssignedRole(programCard.roleId);
  const definition = PROGRAM_DEFINITIONS[roleId];
  const selectedPlayerIds = input.selectedPlayerIds ?? [];
  const selectedRoleId = input.selectedRoleId ?? null;
  const executorWasCorrupted = session.corruptedPlayerId === executor.id;
  validateTargets(executor.id, selectedPlayerIds);

  const pendingForExecutor = pendingEffects.filter((effect) => effect.targetPlayerId === executor.id);
  const killSwitch = pendingForExecutor.find((effect) => effect.effectType === "kill-switch");
  const rerouter = pendingForExecutor.find((effect) => effect.effectType === "rerouter");
  const scrambler = pendingForExecutor.find((effect) => effect.effectType === "scrambler");

  if (killSwitch) {
    const blockedSession = { ...session };
    const blockedSessionPatch: Partial<Session> = {};
    applyCorruptionProgram(session, executor, roleId, blockedSessionPatch, ["Kill Switch blocked execution."]);
    Object.assign(blockedSession, blockedSessionPatch);
    return {
      sessionPatch: blockedSessionPatch,
      traceEntry: scrambler
        ? null
        : buildTraceEntry({
            session: blockedSession,
            executor,
            source,
            roleId,
            targetPlayerIds: selectedPlayerIds,
            success: false,
            detailText: "Action failed",
            scrambledField: null
          }),
      execution: {
        inputJson: JSON.stringify({ selectedPlayerIds, selectedRoleId }),
        resultText: "Action failed",
        success: 0,
        installedEffectId: null,
        installedTargetPlayerId: null,
        approvalPlayerId: null
      },
      addPendingEffects: [],
      consumePendingEffectIds: [killSwitch.id, ...(scrambler ? [scrambler.id] : []), ...(rerouter ? [rerouter.id] : [])],
      auditNotes: [
        "Kill Switch blocked execution.",
        ...(scrambler ? ["Scrambler removed the blocked action from the trace log."] : [])
      ]
    };
  }

  const programResult = definition.resolve({
    session,
    executor,
    source,
    roleId,
    players,
    installedEffectIds: deps.installedEffectIds,
    totalInstalledEffects: deps.totalInstalledEffects,
    selectedPlayerIds,
    selectedRoleId,
    lastExecutionByPlayer: deps.lastExecutionByPlayer,
    lastTraceByPlayer: deps.lastTraceByPlayer,
    fullTraceLog: deps.fullTraceLog,
    latestTrace: deps.latestTrace,
    pendingEffects
  });

  const sessionPatch: Partial<Session> = {
    ...programResult.sessionPatch
  };

  const auditNotes = [...(programResult.auditNotes ?? [])];
  const consumePendingEffectIds = [...(programResult.consumePendingEffectIds ?? [])];
  const addPendingEffects = [...(programResult.addPendingEffects ?? [])];
  if (rerouter) {
    const architectTarget = selectedPlayerIds[0] ?? null;
    if (architectTarget) {
      sessionPatch.architectPlayerIds = [architectTarget];
      auditNotes.push(`Rerouter reassigned Architect to ${architectTarget}.`);
    }
    consumePendingEffectIds.push(rerouter.id);
  }
  if (scrambler) {
    consumePendingEffectIds.push(scrambler.id);
    auditNotes.push("Scrambler removed the next action from the trace log.");
  }

  applyCorruptionProgram(session, executor, roleId, sessionPatch, auditNotes);

  const resultText = executorWasCorrupted
    ? corruptResultText(roleId, programResult.resultText)
    : programResult.resultText;
  if (executorWasCorrupted) {
    auditNotes.push(`Corruption distorted the ${roleId} result for ${executor.id}.`);
  }

  return {
    sessionPatch,
    traceEntry: scrambler
      ? null
      : buildTraceEntry({
          session: { ...session, ...sessionPatch },
          executor,
          source,
          roleId,
          targetPlayerIds: programResult.targetPlayerIds,
          success: programResult.success,
          detailText: createTraceDetail(roleId, players, programResult.targetPlayerIds, programResult.success),
          scrambledField: null
        }),
    execution: {
      inputJson: JSON.stringify({ selectedPlayerIds, selectedRoleId }),
      resultText,
      success: programResult.success ? 1 : 0,
      installedEffectId: null,
      installedTargetPlayerId: null,
      approvalPlayerId: input.approvalPlayerId ?? null
    },
    addPendingEffects,
    consumePendingEffectIds,
    auditNotes
  };
}

function corruptResultText(roleId: RoleId, resultText: string): string {
  if (resultText === "Yes") return "No";
  if (resultText === "No") return "Yes";

  if (roleId === "Snapshot" || roleId === "Target Trace" || roleId === "Trace Auditor") {
    return "Corrupted trace data.";
  }

  if (roleId === "Registry" || roleId === "Spoofer" || roleId === "Sink") {
    return getCorruptedRoleLabel(resultText);
  }

  return resultText;
}

function getCorruptedRoleLabel(roleLabel: string): string {
  const roleOrder = Object.keys(PROGRAM_DEFINITIONS) as RoleId[];
  const roleIndex = roleOrder.indexOf(roleLabel as RoleId);
  if (roleIndex < 0) {
    return roleOrder[0];
  }
  return roleOrder[(roleIndex + 1) % roleOrder.length];
}

function requireAssignedRole(roleId: RoleId | null): RoleId {
  if (!roleId) {
    throw new Error("Program card is not yet assigned.");
  }
  return roleId;
}

function validateTargets(executorId: string, targetIds: string[]) {
  for (const targetId of targetIds) {
    if (targetId === executorId) {
      throw new Error("Executors may not target themselves.");
    }
  }
}

function applyCorruptionProgram(
  session: Session,
  executor: Player,
  roleId: RoleId,
  sessionPatch: Partial<Session>,
  auditNotes: string[]
) {
  if (roleId !== "Spoofer" && roleId !== "Sink") return;
  if (session.armedCorruptionRoleId !== roleId) return;
  sessionPatch.corruptedPlayerId = executor.id;
  sessionPatch.armedCorruptionRoleId = null;
  sessionPatch.spooferArmed = false;
  auditNotes.push(`${roleId} corrupted ${executor.id}.`);
}

function buildTraceEntry(args: {
  session: Session;
  executor: Player;
  source: Player;
  roleId: RoleId;
  targetPlayerIds: string[];
  success: boolean;
  detailText: string;
  scrambledField: "identity" | "source" | "corruptionStatus" | null;
}): Omit<TraceLogEntry, "id" | "sessionId" | "executionId" | "createdAt"> {
  return {
    executorPlayerId: args.executor.id,
    sourcePlayerId: args.source.id,
    roleId: args.roleId,
    targetPlayerIds: args.targetPlayerIds,
    success: args.success,
    corruptionStatus:
      args.scrambledField === "corruptionStatus"
        ? "clear"
        : args.session.corruptedPlayerId === args.executor.id
          ? "corrupted"
          : "clear",
    architectStatus: args.session.architectPlayerIds.includes(args.executor.id) ? "architect" : "not-architect",
    detailText: args.detailText,
    scrambledField: args.scrambledField
  };
}
