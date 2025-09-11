import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const updateNotificationsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      push_notifications: z.object({
        order_updates: z.boolean().optional(),
        delivery_updates: z.boolean().optional(),
        promotions: z.boolean().optional(),
        new_restaurants: z.boolean().optional(),
      }).optional(),
      email_notifications: z.boolean().optional(),
      sms_notifications: z.boolean().optional(),
      sound_enabled: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("Updating notification settings for user:", input.userId, input);
    
    try {
      // Mock notification settings update - replace with actual database update
      const updatedSettings = {
        push_notifications: {
          order_updates: input.push_notifications?.order_updates ?? true,
          delivery_updates: input.push_notifications?.delivery_updates ?? true,
          promotions: input.push_notifications?.promotions ?? false,
          new_restaurants: input.push_notifications?.new_restaurants ?? true,
        },
        email_notifications: input.email_notifications ?? true,
        sms_notifications: input.sms_notifications ?? false,
        sound_enabled: input.sound_enabled ?? true,
        updated_at: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: "Notification settings updated successfully",
        settings: updatedSettings,
      };
    } catch (error) {
      console.error("Error updating notification settings:", error);
      throw new Error("Failed to update notification settings");
    }
  });

export default updateNotificationsProcedure;