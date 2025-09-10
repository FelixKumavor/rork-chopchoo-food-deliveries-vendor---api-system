import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import initializeMomoRoute from "./routes/payment/initialize-momo/route";
import verifyPaymentRoute from "./routes/payment/verify/route";
import { sendOtpProcedure, verifyOtpProcedure } from "./routes/auth/otp/route";

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
});

export type AppRouter = typeof appRouter;