import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const createPaymentMethodProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(["card", "mobile_money"]),
      // Card fields
      card_number: z.string().optional(),
      exp_month: z.number().optional(),
      exp_year: z.number().optional(),
      cvv: z.string().optional(),
      // Mobile money fields
      provider: z.enum(["mtn", "vodafone", "airtel"]).optional(),
      phone_number: z.string().optional(),
      isDefault: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("Creating payment method for user:", input.userId, input);
    
    try {
      let newPaymentMethod;
      
      if (input.type === "card") {
        // Mock card creation - in real app, use Paystack tokenization
        newPaymentMethod = {
          id: Date.now().toString(),
          type: "card",
          name: "New Card",
          details: `**** **** **** ${input.card_number?.slice(-4) || "0000"}`,
          isDefault: input.isDefault || false,
          last_four: input.card_number?.slice(-4) || "0000",
          brand: "visa", // Would be detected from card number
          exp_month: input.exp_month || 12,
          exp_year: input.exp_year || 2025,
          created_at: new Date().toISOString(),
        };
      } else {
        // Mock mobile money creation
        const providerNames = {
          mtn: "MTN Mobile Money",
          vodafone: "Vodafone Cash",
          airtel: "AirtelTigo Money",
        };
        
        newPaymentMethod = {
          id: Date.now().toString(),
          type: "mobile_money",
          name: providerNames[input.provider || "mtn"],
          details: input.phone_number || "0000000000",
          isDefault: input.isDefault || false,
          provider: input.provider || "mtn",
          phone_number: input.phone_number || "0000000000",
          created_at: new Date().toISOString(),
        };
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: "Payment method added successfully",
        payment_method: newPaymentMethod,
      };
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw new Error("Failed to create payment method");
    }
  });

export default createPaymentMethodProcedure;