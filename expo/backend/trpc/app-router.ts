import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import initializeMomoRoute from "@/backend/trpc/routes/payment/initialize-momo/route";
import verifyPaymentRoute from "@/backend/trpc/routes/payment/verify/route";
import { sendOtpProcedure, verifyOtpProcedure } from "@/backend/trpc/routes/auth/otp/route";
import createOrderRoute from "@/backend/trpc/routes/orders/create/route";
import getOrdersRoute from "@/backend/trpc/routes/orders/get/route";
import trackOrderRoute from "@/backend/trpc/routes/orders/track/route";

// Profile routes
import getProfileRoute from "@/backend/trpc/routes/profile/get/route";
import updateProfileRoute from "@/backend/trpc/routes/profile/update/route";

// Address routes
import getAddressesRoute from "@/backend/trpc/routes/addresses/get/route";
import createAddressRoute from "@/backend/trpc/routes/addresses/create/route";
import updateAddressRoute from "@/backend/trpc/routes/addresses/update/route";
import deleteAddressRoute from "@/backend/trpc/routes/addresses/delete/route";

// Payment method routes
import getPaymentMethodsRoute from "@/backend/trpc/routes/payment-methods/get/route";
import createPaymentMethodRoute from "@/backend/trpc/routes/payment-methods/create/route";
import deletePaymentMethodRoute from "@/backend/trpc/routes/payment-methods/delete/route";

// Notification routes
import getNotificationsRoute from "@/backend/trpc/routes/notifications/get/route";
import updateNotificationsRoute from "@/backend/trpc/routes/notifications/update/route";

// Vendor routes
import { createVendorProcedure } from "@/backend/trpc/routes/vendors/create/route";
import { getVendorsProcedure } from "@/backend/trpc/routes/vendors/get/route";
import { getVendorBySlugProcedure } from "@/backend/trpc/routes/vendors/get-by-slug/route";

console.log('🔧 Building tRPC router...');

// Create a simple test procedure directly in the router
const testProcedure = publicProcedure
  .query(() => {
    console.log('🔍 Direct test procedure called');
    return {
      message: "Direct test procedure working!",
      timestamp: new Date().toISOString()
    };
  });

// Create example procedures directly in the router to avoid import issues
const hiProcedure = publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    console.log('🔍 Hi procedure called with input:', input);
    const name = input?.name || "World";
    return {
      hello: `Hello ${name}!`,
      date: new Date(),
      status: "success",
      message: "tRPC connection working!",
      timestamp: new Date().toISOString()
    };
  });

const hiInlineProcedure = publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    console.log('🔍 Inline Hi procedure called with input:', input);
    const name = input?.name || "World";
    return {
      hello: `Hello ${name}!`,
      date: new Date(),
      status: "success",
      message: "Inline tRPC connection working!",
      timestamp: new Date().toISOString()
    };
  });

export const appRouter = createTRPCRouter({
  // Add direct test procedure
  test: testProcedure,
  example: createTRPCRouter({
    hi: hiProcedure,
    hiInline: hiInlineProcedure,
  }),
  payment: createTRPCRouter({
    initializeMomo: initializeMomoRoute,
    verify: verifyPaymentRoute,
  }),
  auth: createTRPCRouter({
    sendOtp: sendOtpProcedure,
    verifyOtp: verifyOtpProcedure,
  }),
  orders: createTRPCRouter({
    create: createOrderRoute,
    get: getOrdersRoute,
    track: trackOrderRoute,
  }),
  profile: createTRPCRouter({
    get: getProfileRoute,
    update: updateProfileRoute,
  }),
  addresses: createTRPCRouter({
    get: getAddressesRoute,
    create: createAddressRoute,
    update: updateAddressRoute,
    delete: deleteAddressRoute,
  }),
  paymentMethods: createTRPCRouter({
    get: getPaymentMethodsRoute,
    create: createPaymentMethodRoute,
    delete: deletePaymentMethodRoute,
  }),
  notifications: createTRPCRouter({
    get: getNotificationsRoute,
    update: updateNotificationsRoute,
  }),
  vendors: createTRPCRouter({
    create: createVendorProcedure,
    get: getVendorsProcedure,
    getBySlug: getVendorBySlugProcedure,
  }),
});

console.log('✅ tRPC router built successfully');
console.log('📋 Router structure:', Object.keys(appRouter._def.procedures || {}));

// Log the router structure for debugging
try {
  const procedures = appRouter._def.procedures as any;
  console.log('📋 Available procedures:', Object.keys(procedures));
  
  if (procedures.example) {
    console.log('📋 Example procedures:', Object.keys(procedures.example._def.procedures));
    console.log('📋 Hi procedure exists:', !!procedures.example._def.procedures.hi);
    console.log('📋 HiInline procedure exists:', !!procedures.example._def.procedures.hiInline);
  } else {
    console.log('❌ Example router not found in procedures');
  }
} catch (error) {
  console.error('❌ Error inspecting router structure:', error);
}

export type AppRouter = typeof appRouter;