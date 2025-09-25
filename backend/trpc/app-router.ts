import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context";
import { hiProcedure } from "@/backend/trpc/routes/example/hi/route";
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
console.log('📋 Available procedures:', {
  hiProcedure: !!hiProcedure,
  initializeMomoRoute: !!initializeMomoRoute,
  verifyPaymentRoute: !!verifyPaymentRoute,
  sendOtpProcedure: !!sendOtpProcedure,
  verifyOtpProcedure: !!verifyOtpProcedure,
  createOrderRoute: !!createOrderRoute,
  getOrdersRoute: !!getOrdersRoute,
  trackOrderRoute: !!trackOrderRoute,
  getProfileRoute: !!getProfileRoute,
  updateProfileRoute: !!updateProfileRoute,
  getAddressesRoute: !!getAddressesRoute,
  createAddressRoute: !!createAddressRoute,
  updateAddressRoute: !!updateAddressRoute,
  deleteAddressRoute: !!deleteAddressRoute,
  getPaymentMethodsRoute: !!getPaymentMethodsRoute,
  createPaymentMethodRoute: !!createPaymentMethodRoute,
  deletePaymentMethodRoute: !!deletePaymentMethodRoute,
  getNotificationsRoute: !!getNotificationsRoute,
  updateNotificationsRoute: !!updateNotificationsRoute,
  createVendorProcedure: !!createVendorProcedure,
  getVendorsProcedure: !!getVendorsProcedure,
  getVendorBySlugProcedure: !!getVendorBySlugProcedure,
});

// Create the example router first
const exampleRouter = createTRPCRouter({
  hi: hiProcedure,
});

console.log('🔍 Example router created:', {
  hasHi: !!exampleRouter._def.procedures.hi,
  procedures: Object.keys(exampleRouter._def.procedures)
});

// Create a simple test procedure directly in the router
const testProcedure = publicProcedure
  .query(() => {
    console.log('🔍 Direct test procedure called');
    return {
      message: "Direct test procedure working!",
      timestamp: new Date().toISOString()
    };
  });

export const appRouter = createTRPCRouter({
  // Add direct test procedure
  test: testProcedure,
  example: exampleRouter,
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

export type AppRouter = typeof appRouter;

// Log the final router for debugging
console.log('🔍 Final router type exported');
console.log('📋 Available routes:', {
  example: Object.keys((appRouter._def.procedures as any)?.example?._def?.procedures || {}),
  payment: Object.keys((appRouter._def.procedures as any)?.payment?._def?.procedures || {}),
  auth: Object.keys((appRouter._def.procedures as any)?.auth?._def?.procedures || {}),
  orders: Object.keys((appRouter._def.procedures as any)?.orders?._def?.procedures || {}),
  profile: Object.keys((appRouter._def.procedures as any)?.profile?._def?.procedures || {}),
  addresses: Object.keys((appRouter._def.procedures as any)?.addresses?._def?.procedures || {}),
  paymentMethods: Object.keys((appRouter._def.procedures as any)?.paymentMethods?._def?.procedures || {}),
  notifications: Object.keys((appRouter._def.procedures as any)?.notifications?._def?.procedures || {}),
  vendors: Object.keys((appRouter._def.procedures as any)?.vendors?._def?.procedures || {}),
});