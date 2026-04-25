import { ProgramDefinition, RoleId } from "./types";
import { cipherVisibleDetail, findPlayer, getPlayerLabel, playersOnSameFaction } from "./helpers";

export interface RoleProgramReferenceEntry {
  role: string;
  program: string;
  output: string;
}

export const DEFAULT_ROLE_POOL: RoleId[] = [
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

export const ROLE_PROGRAM_REFERENCE: Record<RoleId, RoleProgramReferenceEntry> = {
  "Ghost Pair": {
    role: "Boot-sequence pair role that knows the other Ghost Pair operator and observes Registry faction signals.",
    program: "Select 2 players and learn whether they are on the same faction.",
    output: "Yes / No"
  },
  Registry: {
    role: "Boot-sequence marker role observed by Ghost Pair.",
    program: "Select a player and learn their role.",
    output: "Role name"
  },
  Handshake: {
    role: "Direct faction-truth role.",
    program: "Select a player and learn whether they are on your faction.",
    output: "Yes / No"
  },
  "Signal Trace": {
    role: "Architect-truth role.",
    program: "Select a player and learn whether they are currently an Architect.",
    output: "Yes / No"
  },
  Failover: {
    role: "Direct Architect-transfer role.",
    program:
      "Select 2 players. If exactly 1 of them is currently an Architect, the Architect state moves to the other player. Learn only whether a transfer happened.",
    output: "Yes / No"
  },
  Rerouter: {
    role: "Delayed chaotic Architect-control role.",
    program:
      "Select a player. The next time they run a program, that program's target becomes the Architect.",
    output: "Player name / confirmation text"
  },
  "Trace Auditor": {
    role: "Action-truth role.",
    program: "Select a player and see that player's faction's last 5 trace logs.",
    output: "Trace-log text"
  },
  "Target Trace": {
    role: "Target-truth role.",
    program: "Select a player and see that player's last 3 trace logs.",
    output: "Trace-log text"
  },
  Snapshot: {
    role: "Trace-log peek role.",
    program: "Learn the full details of the most recent trace-log entry.",
    output: "Trace-log text"
  },
  "Kill Switch": {
    role: "Execution-blocking disruption role.",
    program: "Select a player. Their next program use has no effect.",
    output: "Player name / confirmation text"
  },
  Scrambler: {
    role: "Trace-log disruption role.",
    program: "Select a player. Their next action is removed from the trace log.",
    output: "Player name / confirmation text"
  },
  Spoofer: {
    role: "Corruption-cycling role that alternates between spoofing and sinking depending on where corruption is armed.",
    program:
      "If Spoofer holds armed corruption, use the Spoofer program: select a player, learn their role, and corrupt the executor. If Spoofer does not hold armed corruption, use the Sink program: select a player and remove corruption from them. Corruption returns to Spoofer and becomes armed.",
    output: "Role name or confirmation text"
  },
  Sink: {
    role: "Corruption-cycling role that alternates between sinking and spoofing depending on where corruption is armed.",
    program:
      "If Sink does not hold armed corruption, use the Sink program: select a player and remove corruption from them. Corruption returns to Sink and becomes armed. If Sink holds armed corruption, use the Spoofer program: select a player, learn their role, and corrupt the executor.",
    output: "Role name or confirmation text"
  },
  Purge: {
    role: "Corruption-removal role.",
    program:
      "Select a player. If they are corrupted, remove that corruption. If corruption has already been purged from the game, select a player and make that player the Architect.",
    output: "Confirmation text"
  },
  Scanner: {
    role: "Corruption-truth role.",
    program: "Select a player and learn whether they are currently corrupted.",
    output: "Yes / No"
  },
  Bootstrap: {
    role: "Late-game acceleration role.",
    program: "After enough installed effects exist, trigger the final unlock phase so the next faction point wins.",
    output: "Confirmation text"
  }
};

export const PROGRAM_DEFINITIONS: Record<RoleId, ProgramDefinition> = {
  "Ghost Pair": {
    roleId: "Ghost Pair",
    inputType: "double-player",
    prompt: "Select 2 players to compare.",
    resolve(ctx) {
      const [aId, bId] = ctx.selectedPlayerIds;
      const a = findPlayer(ctx.players, aId);
      const b = findPlayer(ctx.players, bId);
      return {
        resultText: playersOnSameFaction(a, b) ? "Yes" : "No",
        success: true,
        targetPlayerIds: [aId, bId]
      };
    }
  },
  Registry: {
    roleId: "Registry",
    inputType: "single-player",
    prompt: "Select a player to inspect.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: target.roleId ?? "Unassigned",
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  Handshake: {
    roleId: "Handshake",
    inputType: "single-player",
    prompt: "Select a player for a faction handshake.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: ctx.executor.faction === target.faction ? "Yes" : "No",
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  "Signal Trace": {
    roleId: "Signal Trace",
    inputType: "single-player",
    prompt: "Select a player to trace for Architect status.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: ctx.session.architectPlayerIds.includes(target.id) ? "Yes" : "No",
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  Failover: {
    roleId: "Failover",
    inputType: "double-player",
    prompt: "Select 2 players for Architect failover.",
    resolve(ctx) {
      const [aId, bId] = ctx.selectedPlayerIds;
      const a = findPlayer(ctx.players, aId);
      const b = findPlayer(ctx.players, bId);
      const aIsArchitect = ctx.session.architectPlayerIds.includes(a.id);
      const bIsArchitect = ctx.session.architectPlayerIds.includes(b.id);
      const swapHappened = aIsArchitect !== bIsArchitect;

      if (!swapHappened) {
        return {
          resultText: "No",
          success: false,
          targetPlayerIds: [a.id, b.id]
        };
      }

      const nextArchitectId = aIsArchitect ? b.id : a.id;
      return {
        resultText: "Yes",
        success: true,
        targetPlayerIds: [a.id, b.id],
        sessionPatch: { architectPlayerIds: [nextArchitectId] }
      };
    }
  },
  Rerouter: {
    roleId: "Rerouter",
    inputType: "single-player",
    prompt: "Select a player to mark for rerouting.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: `${target.displayName ?? `Player ${target.seatNumber}`} is marked for rerouting.`,
        success: true,
        targetPlayerIds: [target.id],
        addPendingEffects: [
          {
            effectType: "rerouter",
            targetPlayerId: target.id,
            payloadJson: JSON.stringify({})
          }
        ]
      };
    }
  },
  "Trace Auditor": {
    roleId: "Trace Auditor",
    inputType: "single-player",
    prompt: "Select a player to inspect their faction trace history.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      const traces = ctx.fullTraceLog
        .filter((trace) => {
          const executor = findPlayer(ctx.players, trace.executorPlayerId);
          return executor.faction && target.faction && executor.faction === target.faction;
        })
        .slice(0, 5);
      if (!traces.length) {
        return { resultText: "No trace found.", success: false, targetPlayerIds: [target.id] };
      }
      return {
        resultText: traces
          .map((trace, index) => `Trace ${index + 1}\n${cipherVisibleDetail(trace, ctx.players, false)}`)
          .join("\n\n"),
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  "Target Trace": {
    roleId: "Target Trace",
    inputType: "single-player",
    prompt: "Select a player to inspect their recent trace history.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      const traces = ctx.fullTraceLog.filter((trace) => trace.executorPlayerId === target.id).slice(0, 3);
      if (!traces.length) {
        return { resultText: "No target trace found.", success: false, targetPlayerIds: [target.id] };
      }
      return {
        resultText: traces
          .map((trace, index) => `Trace ${index + 1}\n${cipherVisibleDetail(trace, ctx.players, false)}`)
          .join("\n\n"),
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  Snapshot: {
    roleId: "Snapshot",
    inputType: "none",
    prompt: "No target required.",
    resolve(ctx) {
      if (!ctx.latestTrace) {
        return { resultText: "No trace entries yet.", success: false, targetPlayerIds: [] };
      }
      return {
        resultText: cipherVisibleDetail(ctx.latestTrace, ctx.players, false),
        success: true,
        targetPlayerIds: []
      };
    }
  },
  "Kill Switch": {
    roleId: "Kill Switch",
    inputType: "single-player",
    prompt: "Select a player to block.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: `${getPlayerLabel(target)} is primed for a kill switch.`,
        success: true,
        targetPlayerIds: [target.id],
        addPendingEffects: [
          {
            effectType: "kill-switch",
            targetPlayerId: target.id,
            payloadJson: JSON.stringify({})
          }
        ]
      };
    }
  },
  Scrambler: {
    roleId: "Scrambler",
    inputType: "single-player",
    prompt: "Select a player to scramble in the trace log.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: `${getPlayerLabel(target)} is marked for log removal.`,
        success: true,
        targetPlayerIds: [target.id],
        addPendingEffects: [
          {
            effectType: "scrambler",
            targetPlayerId: target.id,
            payloadJson: JSON.stringify({})
          }
        ]
      };
    }
  },
  Spoofer: {
    roleId: "Spoofer",
    inputType: "single-player",
    prompt: "Select a player for corruption routing.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      if (ctx.session.armedCorruptionRoleId !== "Spoofer") {
        if (ctx.session.corruptedPlayerId !== target.id) {
          return {
            resultText: "No corruption found.",
            success: false,
            targetPlayerIds: [target.id]
          };
        }
        return {
          resultText: "Corruption returned to Spoofer.",
          success: true,
          targetPlayerIds: [target.id],
          sessionPatch: { corruptedPlayerId: null, armedCorruptionRoleId: "Spoofer", spooferArmed: true }
        };
      }
      return {
        resultText: target.roleId ?? "Unassigned",
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  Sink: {
    roleId: "Sink",
    inputType: "single-player",
    prompt: "Select a player for corruption routing.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      if (ctx.session.armedCorruptionRoleId === "Sink") {
        return {
          resultText: target.roleId ?? "Unassigned",
          success: true,
          targetPlayerIds: [target.id]
        };
      }
      if (ctx.session.corruptedPlayerId !== target.id) {
        return {
          resultText: "No corruption found.",
          success: false,
          targetPlayerIds: [target.id]
        };
      }
      return {
        resultText: "Corruption returned to Sink.",
        success: true,
        targetPlayerIds: [target.id],
        sessionPatch: { corruptedPlayerId: null, armedCorruptionRoleId: "Sink", spooferArmed: false }
      };
    }
  },
  Purge: {
    roleId: "Purge",
    inputType: "single-player",
    prompt: "Select a player for purge routing.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      const corruptionPurgedFromGame =
        ctx.session.corruptedPlayerId === null && ctx.session.armedCorruptionRoleId === null;
      if (corruptionPurgedFromGame) {
        return {
          resultText: `${getPlayerLabel(target)} becomes the Architect.`,
          success: true,
          targetPlayerIds: [target.id],
          sessionPatch: { architectPlayerIds: [target.id] }
        };
      }
      if (ctx.session.corruptedPlayerId !== target.id) {
        return {
          resultText: "No corruption found.",
          success: false,
          targetPlayerIds: [target.id]
        };
      }
      return {
        resultText: "Corruption purged.",
        success: true,
        targetPlayerIds: [target.id],
        sessionPatch: { corruptedPlayerId: null, armedCorruptionRoleId: null, spooferArmed: false }
      };
    }
  },
  Scanner: {
    roleId: "Scanner",
    inputType: "single-player",
    prompt: "Select a player to scan for corruption.",
    resolve(ctx) {
      const target = findPlayer(ctx.players, ctx.selectedPlayerIds[0]);
      return {
        resultText: ctx.session.corruptedPlayerId === target.id ? "Yes" : "No",
        success: true,
        targetPlayerIds: [target.id]
      };
    }
  },
  Bootstrap: {
    roleId: "Bootstrap",
    inputType: "none",
    prompt: "No target required.",
    resolve(ctx) {
      if (ctx.totalInstalledEffects < 3) {
        return {
          resultText: "Bootstrap locked. Install more effects first.",
          success: false,
          targetPlayerIds: []
        };
      }
      return {
        resultText: "Bootstrap initiated. Endgame is unlocked.",
        success: true,
        targetPlayerIds: []
      };
    }
  }
};
