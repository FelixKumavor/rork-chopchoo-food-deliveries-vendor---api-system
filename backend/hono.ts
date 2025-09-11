import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import webhookHandler from "./webhook-handler";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Mount webhook handlers
app.route("/webhook", webhookHandler);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Debug endpoint to test tRPC
app.get("/debug", (c) => {
  return c.json({ 
    status: "ok", 
    message: "tRPC server is running",
    timestamp: new Date().toISOString(),
    routes: {
      trpc: "/api/trpc",
      webhook: "/api/webhook"
    }
  });
});

export default app;