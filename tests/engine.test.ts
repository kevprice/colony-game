import test from "node:test";
import assert from "node:assert/strict";
import { resolveExecution } from "../src/domain/engine";
import { ExecutionRecord, Player, Session, TraceLogEntry } from "../src/domain/types";

function baseSession(): Session {
  return {
    id: "s1",
    name: "Test",
    status: "active",
    playerCount: 4,
    includeBootstrap: false,
    activeRoleIds: ["Spoofer", "Sink", "Failover", "Rerouter"],
    architectPlayerIds: ["p1"],
    corruptedPlayerId: null,
    spooferArmed: true,
    armedCorruptionRoleId: "Spoofer",
    redPoints: 0,
    greenPoints: 0,
    victoryThreshold: 4,
    lastArchitectInstallPrograms: {},
    pendingInstallApproval: null,
    lockoutPlayerId: null,
    lockoutUntil: null,
    createdAt: new Date().toISOString()
  };
}

function players(): Player[] {
  return [
    { id: "p1", sessionId: "s1", seatNumber: 1, joinToken: "j1", qrToken: "player:1", displayName: "A", registeredAt: "x", faction: "Red", roleId: "Spoofer" },
    { id: "p2", sessionId: "s1", seatNumber: 2, joinToken: "j2", qrToken: "player:2", displayName: "B", registeredAt: "x", faction: "Green", roleId: "Sink" },
    { id: "p3", sessionId: "s1", seatNumber: 3, joinToken: "j3", qrToken: "player:3", displayName: "C", registeredAt: "x", faction: "Red", roleId: "Failover" },
    { id: "p4", sessionId: "s1", seatNumber: 4, joinToken: "j4", qrToken: "player:4", displayName: "D", registeredAt: "x", faction: "Green", roleId: "Rerouter" }
  ];
}

function emptyMaps() {
  return {
    installedEffectIds: [],
    totalInstalledEffects: 0,
    lastExecutionByPlayer: new Map<string, ExecutionRecord | undefined>(),
    lastTraceByPlayer: new Map<string, TraceLogEntry | undefined>(),
    fullTraceLog: []
  };
}

test("Spoofer corrupts the executor when armed", () => {
  const allPlayers = players();
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p3"]
    },
    {
      session: baseSession(),
      players: allPlayers,
      executor: allPlayers[1],
      source: allPlayers[0],
      programCard: { id: "c1", sessionId: "s1", qrToken: "program:1", roleId: "Spoofer", sourcePlayerId: "p1", envelopeLabel: "ENV-1" },
      pendingEffects: [],
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.equal(result.sessionPatch.corruptedPlayerId, "p2");
  assert.equal(result.sessionPatch.spooferArmed, false);
  assert.equal(result.sessionPatch.armedCorruptionRoleId, null);
});

test("Sink returns corruption to itself when it cleans the corrupted player", () => {
  const allPlayers = players();
  const session = { ...baseSession(), corruptedPlayerId: "p3", spooferArmed: false, armedCorruptionRoleId: null };
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p3"]
    },
    {
      session,
      players: allPlayers,
      executor: allPlayers[1],
      source: allPlayers[1],
      programCard: { id: "c2", sessionId: "s1", qrToken: "program:2", roleId: "Sink", sourcePlayerId: "p2", envelopeLabel: "ENV-2" },
      pendingEffects: [],
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.equal(result.sessionPatch.corruptedPlayerId, null);
  assert.equal(result.sessionPatch.armedCorruptionRoleId, "Sink");
  assert.equal(result.execution.resultText, "Corruption returned to Sink.");
});

test("Failover moves Architect state when exactly one selected player is the Architect", () => {
  const allPlayers = players();
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p1", "p4"]
    },
    {
      session: baseSession(),
      players: allPlayers,
      executor: allPlayers[2],
      source: allPlayers[3],
      programCard: { id: "c3", sessionId: "s1", qrToken: "program:4", roleId: "Failover", sourcePlayerId: "p4", envelopeLabel: "ENV-4" },
      pendingEffects: [],
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.deepEqual(result.sessionPatch.architectPlayerIds, ["p4"]);
  assert.equal(result.execution.resultText, "Yes");
});

test("Failover does nothing when Architect state is not uniquely present in the selected pair", () => {
  const allPlayers = players();
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p3", "p4"]
    },
    {
      session: baseSession(),
      players: allPlayers,
      executor: allPlayers[0],
      source: allPlayers[3],
      programCard: { id: "c6", sessionId: "s1", qrToken: "program:4", roleId: "Failover", sourcePlayerId: "p4", envelopeLabel: "ENV-4" },
      pendingEffects: [],
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.equal(result.execution.resultText, "No");
  assert.equal(result.execution.success, 0);
  assert.equal(result.sessionPatch.architectPlayerIds, undefined);
});

test("Rerouter changes the Architect when the marked executor runs a targeted program", () => {
  const allPlayers = players();
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p2"]
    },
    {
      session: baseSession(),
      players: allPlayers,
      executor: allPlayers[0],
      source: allPlayers[3],
      programCard: { id: "c7", sessionId: "s1", qrToken: "program:4", roleId: "Rerouter", sourcePlayerId: "p4", envelopeLabel: "ENV-4" },
      pendingEffects: [],
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.equal(result.execution.resultText, "B is marked for rerouting.");
  assert.equal(result.addPendingEffects.length, 1);
  assert.equal(result.addPendingEffects[0]?.effectType, "rerouter");
  assert.equal(result.addPendingEffects[0]?.targetPlayerId, "p2");
});

test("Rerouter pending effect moves Architect to the next executed target", () => {
  const allPlayers = players();
  const pendingEffects = [
    { id: "pe1", sessionId: "s1", effectType: "rerouter" as const, targetPlayerId: "p2", payloadJson: "{}", createdAt: new Date().toISOString() }
  ];
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p3"]
    },
    {
      session: baseSession(),
      players: allPlayers,
      executor: allPlayers[1],
      source: allPlayers[0],
      programCard: { id: "c8", sessionId: "s1", qrToken: "program:1", roleId: "Spoofer", sourcePlayerId: "p1", envelopeLabel: "ENV-1" },
      pendingEffects,
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.deepEqual(result.sessionPatch.architectPlayerIds, ["p3"]);
  assert.ok(result.consumePendingEffectIds.includes("pe1"));
});

test("Executors cannot target themselves", () => {
  const allPlayers = players();
  assert.throws(() =>
    resolveExecution(
      {
        sessionId: "s1",
        executorQrToken: "",
        programQrToken: "",
        selectedPlayerIds: ["p2"]
      },
      {
        session: baseSession(),
        players: allPlayers,
        executor: allPlayers[1],
        source: allPlayers[1],
        programCard: { id: "c4", sessionId: "s1", qrToken: "program:4", roleId: "Sink", sourcePlayerId: "p2", envelopeLabel: "ENV-4" },
        pendingEffects: [],
        latestTrace: undefined,
        ...emptyMaps()
      }
    )
  );
});

test("Corrupted executors receive inverted yes/no information", () => {
  const allPlayers = players();
  const session = { ...baseSession(), corruptedPlayerId: "p2", armedCorruptionRoleId: null, spooferArmed: false };
  const result = resolveExecution(
    {
      sessionId: "s1",
      executorQrToken: "",
      programQrToken: "",
      selectedPlayerIds: ["p1"]
    },
    {
      session,
      players: allPlayers,
      executor: allPlayers[1],
      source: allPlayers[2],
      programCard: { id: "c5", sessionId: "s1", qrToken: "program:5", roleId: "Handshake", sourcePlayerId: "p3", envelopeLabel: "ENV-5" },
      pendingEffects: [],
      latestTrace: undefined,
      ...emptyMaps()
    }
  );
  assert.equal(result.execution.resultText, "Yes");
});
