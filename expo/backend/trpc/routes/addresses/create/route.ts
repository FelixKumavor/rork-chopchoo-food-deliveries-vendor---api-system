import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const createAddressProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
      address: z.string(),
      city: z.string(),
      type: z.enum(["home", "work", "other"]),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      phone: z.string().optional(),
      instructions: z.string().optional(),
      isDefault: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("Creating address for user:", input.userId, input);
    
    try {
      // Mock address creation - replace with actual database insert
      const newAddress = {
        id: Date.now().toString(),
        ...input,
        isDefault: input.isDefault || false,
        created_at: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: "Address added successfully",
        address: newAddress,
      };
    } catch (error) {
      console.error("Error creating address:", error);
      throw new Error("Failed to create address");
    }
  });

export default createAddressProcedure;