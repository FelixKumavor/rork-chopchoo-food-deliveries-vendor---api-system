import { createTRPCRouter } from "@/backend/trpc/create-context";
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

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
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

export type AppRouter = typeof appRouter;