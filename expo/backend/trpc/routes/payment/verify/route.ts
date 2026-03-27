import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const verifyPaymentSchema = z.object({
  reference: z.string(),
});

export default publicProcedure
  .input(verifyPaymentSchema)
  .query(async ({ input }) => {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${input.reference}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY || "sk_test_your_secret_key"}`,
        },
      });

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || "Payment verification failed");
      }

      const { data } = result;
      
      return {
        success: true,
        reference: input.reference,
        status: data.status,
        amount: data.amount / 100, // Convert from kobo
        currency: data.currency,
        paid_at: data.paid_at,
        channel: data.channel,
        customer: data.customer,
        metadata: data.metadata,
        message: "Payment verified successfully",
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      throw new Error(error instanceof Error ? error.message : "Payment verification failed");
    }
  });