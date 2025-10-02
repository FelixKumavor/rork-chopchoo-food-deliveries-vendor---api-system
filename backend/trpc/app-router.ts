import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

console.log('🔧 Building tRPC router...');

// Create a simple test procedure
const testProcedure = publicProcedure
  .query(() => {
    console.log('🔍 Test procedure called');
    return {
      message: "Test procedure working!",
      timestamp: new Date().toISOString(),
      status: "success"
    };
  });

// Create the hi procedure
const hiProcedure = publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    console.log('🔍 Hi procedure called with input:', input);
    const name = input?.name || "World";
    return {
      hello: `Hello ${name}!`,
      message: "tRPC connection working!",
      timestamp: new Date().toISOString(),
      status: "success"
    };
  });

// Create fallback procedure
const fallbackProcedure = publicProcedure.query(() => ({ 
  error: 'Route not available',
  message: 'This route is not implemented yet',
  status: 'fallback'
}));

// Create the main router
export const appRouter = createTRPCRouter({
  test: testProcedure,
  example: createTRPCRouter({
    hi: hiProcedure,
    hiInline: hiProcedure, // Use same procedure for now
  }),
  payment: createTRPCRouter({
    initializeMomo: fallbackProcedure,
    verify: fallbackProcedure,
  }),
  auth: createTRPCRouter({
    sendOtp: fallbackProcedure,
    verifyOtp: fallbackProcedure,
  }),
  orders: createTRPCRouter({
    create: fallbackProcedure,
    get: fallbackProcedure,
    track: fallbackProcedure,
  }),
  profile: createTRPCRouter({
    get: fallbackProcedure,
    update: fallbackProcedure,
  }),
  addresses: createTRPCRouter({
    get: fallbackProcedure,
    create: fallbackProcedure,
    update: fallbackProcedure,
    delete: fallbackProcedure,
  }),
  paymentMethods: createTRPCRouter({
    get: fallbackProcedure,
    create: fallbackProcedure,
    delete: fallbackProcedure,
  }),
  notifications: createTRPCRouter({
    get: fallbackProcedure,
    update: fallbackProcedure,
  }),
  vendors: createTRPCRouter({
    create: fallbackProcedure,
    get: fallbackProcedure,
    getBySlug: fallbackProcedure,
  }),
});

console.log('✅ tRPC router built successfully');

// Log router structure for debugging
try {
  const procedures = appRouter._def.procedures as any;
  console.log('📋 Available top-level procedures:', Object.keys(procedures));
  
  if (procedures.example) {
    console.log('📋 Example procedures:', Object.keys(procedures.example._def.procedures));
  }
  
  if (procedures.test) {
    console.log('📋 Test procedure exists:', !!procedures.test);
  }
} catch (error) {
  console.error('❌ Error inspecting router structure:', error);
}

export type AppRouter = typeof appRouter;