"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const engine_1 = require("../src/domain/engine");
function baseSession() {
    return {
        id: "s1",
        name: "Test",
        status: "active",
        playerCount: 4,
        includeBootstrap: false,
        activeRoleIds: ["Spoofer", "Sink", "Purge", "Rerouter"],
        architectPlayerId: "p1",
        corruptedPlayerId: null,
        spooferArmed: true,
        builtNodes: [],
        lastArchitectBuildProgram: null,
        lockoutPlayerId: null,
        lockoutUntil: null,
        createdAt: new Date().toISOString()
    };
}
function players() {
    return [
        { id: "p1", sessionId: "s1", seatNumber: 1, joinToken: "j1", qrToken: "player:1", displayName: "A", registeredAt: "x", faction: "Red", roleId: "Spoofer" },
        { id: "p2", sessionId: "s1", seatNumber: 2, joinToken: "j2", qrToken: "player:2", displayName: "B", registeredAt: "x", faction: "Green", roleId: "Sink" },
        { id: "p3", sessionId: "s1", seatNumber: 3, joinToken: "j3", qrToken: "player:3", displayName: "C", registeredAt: "x", faction: "Red", roleId: "Purge" },
        { id: "p4", sessionId: "s1", seatNumber: 4, joinToken: "j4", qrToken: "player:4", displayName: "D", registeredAt: "x", faction: "Green", roleId: "Rerouter" }
    ];
}
function emptyMaps() {
    return {
        lastExecutionByPlayer: new Map(),
        lastTraceByPlayer: new Map()
    };
}
(0, node_test_1.default)("Spoofer corrupts the executor when armed", () => {
    const allPlayers = players();
    const result = (0, engine_1.resolveExecution)({
        sessionId: "s1",
        executorQrToken: "",
        programQrToken: "",
        selectedPlayerIds: ["p2"]
    }, {
        session: baseSession(),
        players: allPlayers,
        executor: allPlayers[1],
        source: allPlayers[0],
        programCard: { id: "c1", sessionId: "s1", qrToken: "program:1", roleId: "Spoofer", sourcePlayerId: "p1", envelopeLabel: "ENV-1" },
        pendingEffects: [],
        latestTrace: undefined,
        ...emptyMaps()
    });
    strict_1.default.equal(result.sessionPatch.corruptedPlayerId, "p2");
    strict_1.default.equal(result.sessionPatch.spooferArmed, false);
});
(0, node_test_1.default)("Sink transfers corruption onto the executor", () => {
    const allPlayers = players();
    const session = { ...baseSession(), corruptedPlayerId: "p3", spooferArmed: false };
    const result = (0, engine_1.resolveExecution)({
        sessionId: "s1",
        executorQrToken: "",
        programQrToken: "",
        selectedPlayerIds: ["p3"]
    }, {
        session,
        players: allPlayers,
        executor: allPlayers[1],
        source: allPlayers[1],
        programCard: { id: "c2", sessionId: "s1", qrToken: "program:2", roleId: "Sink", sourcePlayerId: "p2", envelopeLabel: "ENV-2" },
        pendingEffects: [],
        latestTrace: undefined,
        ...emptyMaps()
    });
    strict_1.default.equal(result.sessionPatch.corruptedPlayerId, "p2");
    strict_1.default.equal(result.execution.resultText, "Corruption transferred.");
});
(0, node_test_1.default)("Rerouter changes the Architect when the marked executor runs a targeted program", () => {
    const allPlayers = players();
    const pendingEffects = [
        { id: "pe1", sessionId: "s1", effectType: "rerouter", targetPlayerId: "p2", payloadJson: "{}", createdAt: new Date().toISOString() }
    ];
    const result = (0, engine_1.resolveExecution)({
        sessionId: "s1",
        executorQrToken: "",
        programQrToken: "",
        selectedPlayerIds: ["p3"]
    }, {
        session: baseSession(),
        players: allPlayers,
        executor: allPlayers[1],
        source: allPlayers[2],
        programCard: { id: "c3", sessionId: "s1", qrToken: "program:3", roleId: "Purge", sourcePlayerId: "p3", envelopeLabel: "ENV-3" },
        pendingEffects,
        latestTrace: undefined,
        ...emptyMaps()
    });
    strict_1.default.equal(result.sessionPatch.architectPlayerId, "p3");
    strict_1.default.ok(result.consumePendingEffectIds.includes("pe1"));
});
(0, node_test_1.default)("Executors cannot target themselves", () => {
    const allPlayers = players();
    strict_1.default.throws(() => (0, engine_1.resolveExecution)({
        sessionId: "s1",
        executorQrToken: "",
        programQrToken: "",
        selectedPlayerIds: ["p2"]
    }, {
        session: baseSession(),
        players: allPlayers,
        executor: allPlayers[1],
        source: allPlayers[1],
        programCard: { id: "c4", sessionId: "s1", qrToken: "program:4", roleId: "Sink", sourcePlayerId: "p2", envelopeLabel: "ENV-4" },
        pendingEffects: [],
        latestTrace: undefined,
        ...emptyMaps()
    }));
});
