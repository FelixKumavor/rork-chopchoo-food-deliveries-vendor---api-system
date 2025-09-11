import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const updateProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("Updating profile for user:", input.userId, input);
    
    try {
      // Mock profile update - replace with actual database update
      const updatedProfile = {
        id: input.userId,
        name: input.name || "Felix Kumavor",
        email: input.email || "katekobla900@gmail.com",
        phone: input.phone || "+233 20 747 7013",
        avatar: input.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
        role: "customer",
        updated_at: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }
  });

export default updateProfileProcedure;