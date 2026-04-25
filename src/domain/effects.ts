import { FactionScoreState, InstalledEffectDefinition, InstalledEffectId, UnlockTierState } from "./types";

export const INSTALLED_EFFECT_DEFINITIONS: Record<InstalledEffectId, InstalledEffectDefinition> = {
  "Deep Log Access": {
    id: "Deep Log Access",
    tier: 1,
    scope: "targeted",
    effectType: "capability",
    summary: "Target gains repeated access to the last 5 trace-log entries when running programs.",
    publicAnnouncementText: "A new private trace-access routine has been installed into the Grid."
  },
  "Faction Insight": {
    id: "Faction Insight",
    tier: 1,
    scope: "targeted",
    effectType: "capability",
    summary: "Target learns whether their program target is Red when they run a program.",
    publicAnnouncementText: "A private faction-insight routine has been installed into the Grid."
  },
  "Corruption Detection": {
    id: "Corruption Detection",
    tier: 1,
    scope: "targeted",
    effectType: "capability",
    summary: "Target learns whether they are corrupted when they run a program.",
    publicAnnouncementText: "A private corruption-detection routine has been installed into the Grid."
  },
  "Private Ownership Map": {
    id: "Private Ownership Map",
    tier: 2,
    scope: "targeted",
    effectType: "capability",
    summary: "Target may see who owns each installed capability effect.",
    publicAnnouncementText: "A private ownership-mapping routine has been installed into the Grid."
  },
  "Untrusted Actor": {
    id: "Untrusted Actor",
    tier: 1,
    scope: "targeted",
    effectType: "capability",
    summary: "Target becomes untrusted. If they are an Architect and choose a Grid effect, the next player to use the Terminal must approve or disallow it.",
    publicAnnouncementText: "An untrusted-actor routine has been installed into the Grid."
  },
  "Corruption Immunity": {
    id: "Corruption Immunity",
    tier: 2,
    scope: "targeted",
    effectType: "capability",
    summary: "Target cannot become corrupted.",
    publicAnnouncementText: "A private corruption-shield has been installed into the Grid."
  },
  "Redirect Amplification": {
    id: "Redirect Amplification",
    tier: 2,
    scope: "targeted",
    effectType: "capability",
    summary: "Target may choose a different valid target when they run a program.",
    publicAnnouncementText: "A private reroute amplifier has been installed into the Grid."
  },
  "Enhanced Diplomacy": {
    id: "Enhanced Diplomacy",
    tier: 2,
    scope: "global",
    effectType: "system",
    summary: "The next Architect install requires two additional approvals.",
    publicAnnouncementText: "The Grid now requires broader approval before the next install."
  },
  "Architect Instability": {
    id: "Architect Instability",
    tier: 2,
    scope: "global",
    effectType: "system",
    summary: "Architect control is reassigned after each install.",
    publicAnnouncementText: "Architect control in the Grid has become unstable."
  },
  "Duplicate Architect": {
    id: "Duplicate Architect",
    tier: 3,
    scope: "global",
    effectType: "system",
    summary: "A second Architect enters play and scores for their own faction.",
    publicAnnouncementText: "The Grid now supports a second Architect channel."
  },
  "Public Ownership Map": {
    id: "Public Ownership Map",
    tier: 3,
    scope: "global",
    effectType: "system",
    summary: "Ownership of installed capability effects becomes public to everyone.",
    publicAnnouncementText: "The Grid now publicly exposes who owns installed powers."
  },
  "Full Transparency": {
    id: "Full Transparency",
    tier: 3,
    scope: "global",
    effectType: "system",
    summary: "The trace log becomes permanently visible to all players.",
    publicAnnouncementText: "The Grid has entered full transparency mode."
  }
};

export function getAvailableEffects(totalInstalledEffects: number): InstalledEffectDefinition[] {
  const { currentTier } = getCurrentUnlockTier(totalInstalledEffects);
  return Object.values(INSTALLED_EFFECT_DEFINITIONS).filter((effect) => effect.tier <= currentTier);
}

export function getCurrentUnlockTier(totalInstalledEffects: number): UnlockTierState {
  if (totalInstalledEffects >= 4) {
    return { totalInstalledEffects, currentTier: 3 };
  }
  if (totalInstalledEffects >= 2) {
    return { totalInstalledEffects, currentTier: 2 };
  }
  return { totalInstalledEffects, currentTier: 1 };
}

export function getVictoryThreshold(playerCount: number): number {
  if (playerCount <= 7) return 4;
  if (playerCount <= 10) return 5;
  return 6;
}

export function createInitialFactionScoreState(playerCount: number): FactionScoreState {
  return {
    redPoints: 0,
    greenPoints: 0,
    victoryThreshold: getVictoryThreshold(playerCount)
  };
}
