import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import initializeMomoRoute from "./routes/payment/initialize-momo/route";
import verifyPaymentRoute from "./routes/payment/verify/route";
import { sendOtpProcedure, verifyOtpProcedure } from "./routes/auth/otp/route";
import createOrderRoute from "./routes/orders/create/route";
import getOrdersRoute from "./routes/orders/get/route";
import trackOrderRoute from "./routes/orders/track/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
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
});

export type AppRouter = typeof appRouter;