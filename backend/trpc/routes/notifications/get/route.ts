import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getNotificationsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("Getting notification settings for user:", input.userId);
    
    // Mock notification settings - replace with actual database query
    const mockSettings = {
      push_notifications: {
        order_updates: true,
        delivery_updates: true,
        promotions: false,
        new_restaurants: true,
      },
      email_notifications: true,
      sms_notifications: false,
      sound_enabled: true,
    };
    
    return {
      success: true,
      settings: mockSettings,
    };
  });

export default getNotificationsProcedure;