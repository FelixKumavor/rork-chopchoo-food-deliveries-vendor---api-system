import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "@/backend/trpc/app-router";
import { createContext } from "@/backend/trpc/create-context";
import webhookHandler from "./webhook-handler";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with proper configuration
app.use("*", cors({
  origin: '*', // Allow all origins in development
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Add request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  console.log(`🔄 ${c.req.method} ${c.req.url}`);
  console.log('📋 Headers:', Object.fromEntries(Object.entries(c.req.header())));
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`✅ ${c.req.method} ${c.req.url} - ${c.res.status} (${duration}ms)`);
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC Error on ${path}:`, error);
    },
  })
);

// Mount webhook handlers
app.route("/webhook", webhookHandler);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ChopChoo API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Test endpoint for connectivity
app.get("/test", (c) => {
  return c.json({ 
    status: "success", 
    message: "Test endpoint working",
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to test tRPC
app.get("/debug", (c) => {
  return c.json({ 
    status: "ok", 
    message: "tRPC server is running",
    timestamp: new Date().toISOString(),
    routes: {
      trpc: "/api/trpc",
      webhook: "/api/webhook",
      test: "/api/test",
      health: "/api"
    },
    cors: "enabled",
    environment: process.env.NODE_ENV || "development"
  });
});

export default app;