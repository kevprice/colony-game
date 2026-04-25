export type Faction = "Red" | "Green";

export type RoleId =
  | "Ghost Pair"
  | "Registry"
  | "Handshake"
  | "Signal Trace"
  | "Failover"
  | "Rerouter"
  | "Trace Auditor"
  | "Target Trace"
  | "Snapshot"
  | "Kill Switch"
  | "Scrambler"
  | "Spoofer"
  | "Sink"
  | "Purge"
  | "Scanner"
  | "Bootstrap";

export type InstalledEffectId =
  | "Deep Log Access"
  | "Faction Insight"
  | "Corruption Detection"
  | "Private Ownership Map"
  | "Untrusted Actor"
  | "Corruption Immunity"
  | "Redirect Amplification"
  | "Enhanced Diplomacy"
  | "Architect Instability"
  | "Duplicate Architect"
  | "Public Ownership Map"
  | "Full Transparency";

export type EffectScope = "targeted" | "global";

export type EffectType = "capability" | "system";

export type NodeId =
  | "Trace Archive"
  | "Alarm Mesh"
  | "Lockout"
  | "Consensus Patch"
  | "Cipher Veil";

export type SessionStatus = "draft" | "registration" | "active" | "ended";

export type InputType =
  | "none"
  | "single-player"
  | "double-player"
  | "single-role";

export interface Session {
  id: string;
  name: string;
  status: SessionStatus;
  playerCount: number;
  includeBootstrap: boolean;
  activeRoleIds: RoleId[];
  architectPlayerIds: string[];
  corruptedPlayerId: string | null;
  spooferArmed: boolean;
  armedCorruptionRoleId: "Spoofer" | "Sink" | null;
  redPoints: number;
  greenPoints: number;
  victoryThreshold: number;
  lastArchitectInstallPrograms: Record<string, RoleId | null>;
  pendingInstallApproval: PendingInstallApproval | null;
  lockoutPlayerId: string | null;
  lockoutUntil: string | null;
  createdAt: string;
}

export interface Player {
  id: string;
  sessionId: string;
  seatNumber: number;
  joinToken: string;
  qrToken: string;
  displayName: string | null;
  registeredAt: string | null;
  faction: Faction | null;
  roleId: RoleId | null;
}

export interface ProgramCard {
  id: string;
  sessionId: string;
  qrToken: string;
  roleId: RoleId | null;
  sourcePlayerId: string;
  envelopeLabel: string;
}

export interface InstalledEffectDefinition {
  id: InstalledEffectId;
  tier: 1 | 2 | 3;
  scope: EffectScope;
  effectType: EffectType;
  summary: string;
  publicAnnouncementText: string;
}

export interface InstalledEffect {
  id: string;
  sessionId: string;
  effectId: InstalledEffectId;
  tier: 1 | 2 | 3;
  scope: EffectScope;
  effectType: EffectType;
  ownerArchitectPlayerId: string;
  ownerFaction: Faction;
  targetPlayerId: string | null;
  installedAt: string;
  publicAnnouncementText: string;
}

export interface VisibleInstalledEffect {
  id: string;
  effectId: InstalledEffectId;
  tier: 1 | 2 | 3;
  scope: EffectScope;
  effectType: EffectType;
  ownerFaction: Faction;
  targetPlayerId: string | null;
  targetLabel: string | null;
  targetHidden: boolean;
  installedAt: string;
  publicAnnouncementText: string;
}

export interface PendingEffect {
  id: string;
  sessionId: string;
  effectType: "rerouter" | "kill-switch" | "scrambler";
  targetPlayerId: string;
  payloadJson: string;
  createdAt: string;
}

export interface ExecutionRecord {
  id: string;
  sessionId: string;
  executorPlayerId: string;
  sourcePlayerId: string;
  programCardId: string;
  roleId: RoleId;
  inputJson: string;
  resultText: string;
  success: number;
  installedEffectId: InstalledEffectId | null;
  installedTargetPlayerId: string | null;
  approvalPlayerId: string | null;
  createdAt: string;
  invalidatedAt: string | null;
}

export interface TraceLogEntry {
  id: string;
  sessionId: string;
  executionId: string;
  executorPlayerId: string;
  sourcePlayerId: string;
  roleId: RoleId;
  targetPlayerIds: string[];
  success: boolean;
  corruptionStatus: "corrupted" | "clear";
  architectStatus: "architect" | "not-architect";
  detailText: string;
  scrambledField: "identity" | "source" | "corruptionStatus" | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  sessionId: string;
  action: string;
  detailJson: string;
  createdAt: string;
}

export interface FactionScoreState {
  redPoints: number;
  greenPoints: number;
  victoryThreshold: number;
}

export interface UnlockTierState {
  totalInstalledEffects: number;
  currentTier: 1 | 2 | 3;
}

export interface ArchitectInstallAction {
  executorPlayerId: string;
  architectPlayerId: string;
  ownerFaction: Faction;
  effectId: InstalledEffectId;
  targetPlayerId: string | null;
  scoringResult: FactionScoreState;
  announcementDelaySeconds: number;
  installedAt: string;
}

export interface PendingInstallApproval {
  executionId: string;
  architectPlayerId: string;
  installedEffectId: InstalledEffectId;
  targetPlayerId: string | null;
  requestedAt: string;
}

export interface PlayerView {
  id: string;
  seatNumber: number;
  displayName: string;
  faction: Faction;
  roleId: RoleId;
  registeredAt: string | null;
  joinToken: string;
  qrToken: string;
}

export interface ProgramDefinition {
  roleId: RoleId;
  inputType: InputType;
  prompt: string;
  allowWithoutTraceArchive?: boolean;
  resolve(ctx: ResolutionContext): ResolutionResult;
}

export interface ResolutionContext {
  session: Session;
  executor: Player;
  source: Player;
  roleId: RoleId;
  players: Player[];
  installedEffectIds: InstalledEffectId[];
  totalInstalledEffects: number;
  selectedPlayerIds: string[];
  selectedRoleId?: RoleId | null;
  lastExecutionByPlayer: Map<string, ExecutionRecord | undefined>;
  lastTraceByPlayer: Map<string, TraceLogEntry | undefined>;
  fullTraceLog: TraceLogEntry[];
  latestTrace: TraceLogEntry | undefined;
  pendingEffects: PendingEffect[];
}

export interface ResolutionResult {
  resultText: string;
  success: boolean;
  targetPlayerIds: string[];
  sessionPatch?: Partial<Session>;
  addPendingEffects?: Array<Omit<PendingEffect, "id" | "sessionId" | "createdAt">>;
  consumePendingEffectIds?: string[];
  auditNotes?: string[];
}

export interface StartSessionInput {
  name: string;
  playerCount: number;
  includeBootstrap: boolean;
}

export interface RegisterPlayerInput {
  sessionId: string;
  displayName: string;
  playerQrToken: string;
}

export interface BeginExecutionInput {
  sessionId: string;
  executorQrToken: string;
  programQrToken: string;
}

export interface ResolveExecutionInput {
  sessionId: string;
  executorQrToken: string;
  programQrToken: string;
  selectedPlayerIds: string[];
  selectedRoleId?: RoleId | null;
  approvalPlayerId?: string | null;
}

export interface InstallEffectInput {
  sessionId: string;
  executionId: string;
  executorQrToken: string;
  installedEffectId: InstalledEffectId;
  targetPlayerId?: string | null;
  approvalPlayerId?: string | null;
}

export interface ResolveInstallApprovalInput {
  sessionId: string;
  approverQrToken: string;
  approve: boolean;
}

export interface AdminRepairInput {
  sessionId: string;
  action:
    | "set-architects"
    | "set-corruption"
    | "invalidate-execution"
    | "reassign-player-scan"
    | "replace-program-scan"
    | "set-installed-effects"
    | "set-faction-score";
  payload: Record<string, unknown>;
}

export interface ExecutionResult {
  resultText: string;
  success: boolean;
  traceLogEnabled: boolean;
  installedEffectId: InstalledEffectId | null;
  architectPlayerIds: string[];
  corruptedPlayerId: string | null;
  availableInstalledEffects?: InstalledEffectDefinition[];
  currentUnlockTier?: 1 | 2 | 3;
  factionScore?: FactionScoreState;
  pendingApproval?: boolean;
}
