import express from "express";
import path from "node:path";
import {
  applyAdminRepair,
  beginExecution,
  createSession,
  getAdminSessionBundle,
  getSessionBundle,
  getSessions,
  installEffectFromExecution,
  initializeDatabase,
  registerPlayer,
  resolveInstallApproval,
  resolveAndStoreExecution
} from "../db/database";
import { renderPrintablesHtml, renderReusableCardsHtml, renderRoleReferenceHtml } from "../printables/qrs";
import {
  AdminRepairInput,
  InstallEffectInput,
  RegisterPlayerInput,
  ResolveInstallApprovalInput,
  ResolveExecutionInput,
  StartSessionInput
} from "../domain/types";
import { INSTALLED_EFFECT_DEFINITIONS } from "../domain/effects";

export function createApp() {
  initializeDatabase();
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));
  app.use("/vendor/jsqr", express.static(path.join(process.cwd(), "node_modules", "jsqr", "dist")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/sessions", (_req, res) => {
    res.json(getSessions());
  });

  app.get("/api/effects/catalog", (_req, res) => {
    res.json(Object.values(INSTALLED_EFFECT_DEFINITIONS));
  });

  app.post("/api/sessions", (req, res) => {
    try {
      const body = req.body as StartSessionInput;
      res.json(createSession(body));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/sessions/:sessionId", (req, res) => {
    try {
      const viewerPlayerId = typeof req.query.viewerPlayerId === "string" ? req.query.viewerPlayerId : undefined;
      res.json(getSessionBundle(req.params.sessionId, viewerPlayerId));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/admin/sessions/:sessionId", (req, res) => {
    try {
      res.json(getAdminSessionBundle(req.params.sessionId));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/sessions/:sessionId/printables", async (req, res) => {
    try {
      const bundle = getSessionBundle(req.params.sessionId);
      res.type("html").send(await renderPrintablesHtml(bundle));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/printables/roles", (_req, res) => {
    try {
      res.type("html").send(renderRoleReferenceHtml());
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/printables/cards", async (_req, res) => {
    try {
      res.type("html").send(await renderReusableCardsHtml());
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/register", (req, res) => {
    try {
      const body = req.body as RegisterPlayerInput;
      res.json(registerPlayer(body));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/executions/begin", (req, res) => {
    try {
      res.json(beginExecution(req.body));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/executions/resolve", (req, res) => {
    try {
      const body = req.body as ResolveExecutionInput;
      res.json(resolveAndStoreExecution(body));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/executions/install", (req, res) => {
    try {
      res.json(installEffectFromExecution(req.body as InstallEffectInput));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/executions/install-approval", (req, res) => {
    try {
      res.json(resolveInstallApproval(req.body as ResolveInstallApprovalInput));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/admin/repair", (req, res) => {
    try {
      const body = req.body as AdminRepairInput;
      res.json(applyAdminRepair(body));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/admin/:sessionId", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "admin", "index.html"));
  });

  app.get("/kiosk/:sessionId", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "kiosk", "index.html"));
  });

  app.get("/player/:sessionId", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "player", "index.html"));
  });

  app.get("/rules", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "rules", "index.html"));
  });

  return app;
}

function handleError(res: express.Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(400).json({ error: message });
}
