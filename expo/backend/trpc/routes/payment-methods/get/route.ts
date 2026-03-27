import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getPaymentMethodsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("Getting payment methods for user:", input.userId);
    
    // Mock payment methods data - replace with actual database query
    const mockPaymentMethods = [
      {
        id: "1",
        type: "card",
        name: "Visa Card",
        details: "**** **** **** 1234",
        isDefault: true,
        last_four: "1234",
        brand: "visa",
        exp_month: 12,
        exp_year: 2025,
      },
      {
        id: "2",
        type: "mobile_money",
        name: "MTN Mobile Money",
        details: "0207477013",
        isDefault: false,
        provider: "mtn",
        phone_number: "0207477013",
      },
    ];
    
    return {
      success: true,
      payment_methods: mockPaymentMethods,
    };
  });

export default getPaymentMethodsProcedure;