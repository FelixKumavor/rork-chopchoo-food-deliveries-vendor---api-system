import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import initializeMomoRoute from "./routes/payment/initialize-momo/route";
import verifyPaymentRoute from "./routes/payment/verify/route";
import { sendOtpProcedure, verifyOtpProcedure } from "./routes/auth/otp/route";
import createOrderRoute from "./routes/orders/create/route";
import getOrdersRoute from "./routes/orders/get/route";
import trackOrderRoute from "./routes/orders/track/route";

// Profile routes
import getProfileRoute from "./routes/profile/get/route";
import updateProfileRoute from "./routes/profile/update/route";

// Address routes
import getAddressesRoute from "./routes/addresses/get/route";
import createAddressRoute from "./routes/addresses/create/route";
import updateAddressRoute from "./routes/addresses/update/route";
import deleteAddressRoute from "./routes/addresses/delete/route";

// Payment method routes
import getPaymentMethodsRoute from "./routes/payment-methods/get/route";
import createPaymentMethodRoute from "./routes/payment-methods/create/route";
import deletePaymentMethodRoute from "./routes/payment-methods/delete/route";

// Notification routes
import getNotificationsRoute from "./routes/notifications/get/route";
import updateNotificationsRoute from "./routes/notifications/update/route";

// Vendor routes
import { createVendorProcedure } from "./routes/vendors/create/route";
import { getVendorsProcedure } from "./routes/vendors/get/route";
import { getVendorBySlugProcedure } from "./routes/vendors/get-by-slug/route";

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