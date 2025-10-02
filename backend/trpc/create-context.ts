import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

console.log('🔧 Initializing tRPC...');

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    // You can add more context items here like database connections, auth, etc.
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  // transformer: superjson, // Temporarily disable transformer
});

console.log('✅ tRPC initialized successfully');

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;

console.log('✅ tRPC exports created:', {
  createTRPCRouter: typeof createTRPCRouter,
  publicProcedure: typeof publicProcedure,
  protectedProcedure: typeof protectedProcedure
});