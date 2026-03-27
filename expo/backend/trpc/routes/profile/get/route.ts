import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("Getting profile for user:", input.userId);
    
    // Mock user profile data - replace with actual database query
    const mockProfile = {
      id: input.userId,
      name: "Felix Kumavor",
      email: "katekobla900@gmail.com",
      phone: "+233 20 747 7013",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      role: "customer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return {
      success: true,
      profile: mockProfile,
    };
  });

export default getProfileProcedure;