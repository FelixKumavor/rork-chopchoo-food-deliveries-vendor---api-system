import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const deletePaymentMethodProcedure = publicProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("Deleting payment method:", input.paymentMethodId, "for user:", input.userId);
    
    try {
      // Mock payment method deletion - replace with actual database delete
      // In real app, also revoke tokens from payment provider
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: "Payment method deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting payment method:", error);
      throw new Error("Failed to delete payment method");
    }
  });

export default deletePaymentMethodProcedure;