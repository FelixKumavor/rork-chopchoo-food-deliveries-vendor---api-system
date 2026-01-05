import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

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

// Create fallback procedures for routes that might not be available
const fallbackProcedure = publicProcedure.query(() => ({ 
  error: 'Route not available',
  message: 'This route is not implemented yet'
}));

// Try to import routes with fallbacks
let initializeMomoRoute = fallbackProcedure;
let verifyPaymentRoute = fallbackProcedure;
let sendOtpProcedure = fallbackProcedure;
let verifyOtpProcedure = fallbackProcedure;
let createOrderRoute = fallbackProcedure;
let getOrdersRoute = fallbackProcedure;
let trackOrderRoute = fallbackProcedure;
let getProfileRoute = fallbackProcedure;
let updateProfileRoute = fallbackProcedure;
let getAddressesRoute = fallbackProcedure;
let createAddressRoute = fallbackProcedure;
let updateAddressRoute = fallbackProcedure;
let deleteAddressRoute = fallbackProcedure;
let getPaymentMethodsRoute = fallbackProcedure;
let createPaymentMethodRoute = fallbackProcedure;
let deletePaymentMethodRoute = fallbackProcedure;
let getNotificationsRoute = fallbackProcedure;
let updateNotificationsRoute = fallbackProcedure;
let createVendorProcedure = fallbackProcedure;
let getVendorsProcedure = fallbackProcedure;
let getVendorBySlugProcedure = fallbackProcedure;

// Try to import actual routes
try {
  const paymentInitRoute = require("@/backend/trpc/routes/payment/initialize-momo/route");
  if (paymentInitRoute.default) initializeMomoRoute = paymentInitRoute.default;
} catch (error: any) {
  console.warn('⚠️ Payment initialize route not available:', error?.message || error);
}

try {
  const paymentVerifyRoute = require("@/backend/trpc/routes/payment/verify/route");
  if (paymentVerifyRoute.default) verifyPaymentRoute = paymentVerifyRoute.default;
} catch (error: any) {
  console.warn('⚠️ Payment verify route not available:', error?.message || error);
}

try {
  const authRoutes = require("@/backend/trpc/routes/auth/otp/route");
  if (authRoutes.sendOtpProcedure) sendOtpProcedure = authRoutes.sendOtpProcedure;
  if (authRoutes.verifyOtpProcedure) verifyOtpProcedure = authRoutes.verifyOtpProcedure;
} catch (error: any) {
  console.warn('⚠️ Auth routes not available:', error?.message || error);
}

try {
  const orderCreateRoute = require("@/backend/trpc/routes/orders/create/route");
  if (orderCreateRoute.default) createOrderRoute = orderCreateRoute.default;
} catch (error: any) {
  console.warn('⚠️ Order create route not available:', error?.message || error);
}

try {
  const orderGetRoute = require("@/backend/trpc/routes/orders/get/route");
  if (orderGetRoute.default) getOrdersRoute = orderGetRoute.default;
} catch (error: any) {
  console.warn('⚠️ Order get route not available:', error?.message || error);
}

try {
  const orderTrackRoute = require("@/backend/trpc/routes/orders/track/route");
  if (orderTrackRoute.default) trackOrderRoute = orderTrackRoute.default;
} catch (error: any) {
  console.warn('⚠️ Order track route not available:', error?.message || error);
}

try {
  const profileGetRoute = require("@/backend/trpc/routes/profile/get/route");
  if (profileGetRoute.default) getProfileRoute = profileGetRoute.default;
} catch (error: any) {
  console.warn('⚠️ Profile get route not available:', error?.message || error);
}

try {
  const profileUpdateRoute = require("@/backend/trpc/routes/profile/update/route");
  if (profileUpdateRoute.default) updateProfileRoute = profileUpdateRoute.default;
} catch (error: any) {
  console.warn('⚠️ Profile update route not available:', error?.message || error);
}

try {
  const addressGetRoute = require("@/backend/trpc/routes/addresses/get/route");
  if (addressGetRoute.default) getAddressesRoute = addressGetRoute.default;
} catch (error: any) {
  console.warn('⚠️ Address get route not available:', error?.message || error);
}

try {
  const addressCreateRoute = require("@/backend/trpc/routes/addresses/create/route");
  if (addressCreateRoute.default) createAddressRoute = addressCreateRoute.default;
} catch (error: any) {
  console.warn('⚠️ Address create route not available:', error?.message || error);
}

try {
  const addressUpdateRoute = require("@/backend/trpc/routes/addresses/update/route");
  if (addressUpdateRoute.default) updateAddressRoute = addressUpdateRoute.default;
} catch (error: any) {
  console.warn('⚠️ Address update route not available:', error?.message || error);
}

try {
  const addressDeleteRoute = require("@/backend/trpc/routes/addresses/delete/route");
  if (addressDeleteRoute.default) deleteAddressRoute = addressDeleteRoute.default;
} catch (error: any) {
  console.warn('⚠️ Address delete route not available:', error?.message || error);
}

try {
  const paymentMethodGetRoute = require("@/backend/trpc/routes/payment-methods/get/route");
  if (paymentMethodGetRoute.default) getPaymentMethodsRoute = paymentMethodGetRoute.default;
} catch (error: any) {
  console.warn('⚠️ Payment method get route not available:', error?.message || error);
}

try {
  const paymentMethodCreateRoute = require("@/backend/trpc/routes/payment-methods/create/route");
  if (paymentMethodCreateRoute.default) createPaymentMethodRoute = paymentMethodCreateRoute.default;
} catch (error: any) {
  console.warn('⚠️ Payment method create route not available:', error?.message || error);
}

try {
  const paymentMethodDeleteRoute = require("@/backend/trpc/routes/payment-methods/delete/route");
  if (paymentMethodDeleteRoute.default) deletePaymentMethodRoute = paymentMethodDeleteRoute.default;
} catch (error: any) {
  console.warn('⚠️ Payment method delete route not available:', error?.message || error);
}

try {
  const notificationGetRoute = require("@/backend/trpc/routes/notifications/get/route");
  if (notificationGetRoute.default) getNotificationsRoute = notificationGetRoute.default;
} catch (error: any) {
  console.warn('⚠️ Notification get route not available:', error?.message || error);
}

try {
  const notificationUpdateRoute = require("@/backend/trpc/routes/notifications/update/route");
  if (notificationUpdateRoute.default) updateNotificationsRoute = notificationUpdateRoute.default;
} catch (error: any) {
  console.warn('⚠️ Notification update route not available:', error?.message || error);
}

try {
  const vendorCreateRoute = require("@/backend/trpc/routes/vendors/create/route");
  if (vendorCreateRoute.createVendorProcedure) createVendorProcedure = vendorCreateRoute.createVendorProcedure;
} catch (error: any) {
  console.warn('⚠️ Vendor create route not available:', error?.message || error);
}

try {
  const vendorGetRoute = require("@/backend/trpc/routes/vendors/get/route");
  if (vendorGetRoute.getVendorsProcedure) getVendorsProcedure = vendorGetRoute.getVendorsProcedure;
} catch (error: any) {
  console.warn('⚠️ Vendor get route not available:', error?.message || error);
}

try {
  const vendorGetBySlugRoute = require("@/backend/trpc/routes/vendors/get-by-slug/route");
  if (vendorGetBySlugRoute.getVendorBySlugProcedure) getVendorBySlugProcedure = vendorGetBySlugRoute.getVendorBySlugProcedure;
} catch (error: any) {
  console.warn('⚠️ Vendor get by slug route not available:', error?.message || error);
}

// Create the router with all procedures
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