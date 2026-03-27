import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { PAYSTACK_CONFIG } from "@/constants/api";

const initializeMomoSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  email: z.string().email(),
  phone: z.string().min(10),
  provider: z.enum(["mtn", "vodafone", "airtel"]),
  currency: z.string().default("GHS"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export default publicProcedure
  .input(initializeMomoSchema)
  .mutation(async ({ input }) => {
    try {
      const reference = `chopchoo_${input.orderId}_${Date.now()}`;
      
      // Validate mobile money number format
      const cleanPhone = input.phone.replace(/[^0-9]/g, "");
      if (!validateMobileMoneyNumber(cleanPhone, input.provider)) {
        throw new Error(`Invalid ${input.provider.toUpperCase()} mobile money number`);
      }

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY || "sk_test_your_secret_key"}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          amount: input.amount * 100, // Convert to kobo
          currency: input.currency,
          reference,
          channels: ["mobile_money"],
          mobile_money: {
            phone: cleanPhone,
            provider: input.provider,
          },
          callback_url: "https://chopchoo.com/payment/callback",
          split_code: PAYSTACK_CONFIG.SPLIT_CODE,
          metadata: {
            orderId: input.orderId,
            provider: input.provider,
            ...input.metadata,
          },
        }),
      });

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || "Payment initialization failed");
      }

      return {
        success: true,
        reference,
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        message: "Mobile money payment initialized successfully",
      };
    } catch (error) {
      console.error("Mobile money initialization error:", error);
      throw new Error(error instanceof Error ? error.message : "Payment initialization failed");
    }
  });

function validateMobileMoneyNumber(phone: string, provider: string): boolean {
  if (phone.length !== 10) return false;
  
  switch (provider) {
    case "mtn":
      return /^(024|025|053|054|055|059)/.test(phone);
    case "vodafone":
      return /^(020|050|051)/.test(phone);
    case "airtel":
      return /^(026|056|057)/.test(phone);
    default:
      return false;
  }
}