import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

const trackOrderSchema = z.object({
  order_id: z.string(),
});

export const trackOrderProcedure = publicProcedure
  .input(trackOrderSchema)
  .query(async ({ input }) => {
    try {
      console.log('Tracking order:', input.order_id);
      
      // Mock order tracking data - in real app, fetch from database
      const mockTrackingData = {
        order_id: input.order_id,
        status: "out_for_delivery" as const,
        estimated_delivery_time: "2024-01-02T19:45:00Z",
        tracking_updates: [
          {
            status: "pending",
            timestamp: "2024-01-02T18:15:00Z",
            message: "Order received and being processed",
          },
          {
            status: "confirmed",
            timestamp: "2024-01-02T18:17:00Z",
            message: "Order confirmed by restaurant",
          },
          {
            status: "preparing",
            timestamp: "2024-01-02T18:20:00Z",
            message: "Your food is being prepared",
          },
          {
            status: "ready",
            timestamp: "2024-01-02T18:45:00Z",
            message: "Order ready for pickup",
          },
          {
            status: "out_for_delivery",
            timestamp: "2024-01-02T18:50:00Z",
            message: "Rider is on the way to deliver your order",
          },
        ],
        rider: {
          id: "rider_123",
          name: "Kwame Asante",
          phone: "+233 20 987 6543",
          rating: 4.8,
          vehicle_type: "motorcycle",
          current_location: {
            latitude: 5.5700,
            longitude: -0.1900,
          },
        },
        vendor: {
          name: "Coastal Delights",
          phone: "+233 30 234 5678",
          address: "789 Beach Road, Osu",
        },
        delivery_address: {
          name: "John Doe",
          phone: "+233 24 123 4567",
          address: "456 Oak Avenue, Osu",
          city: "Accra",
          coordinates: { latitude: 5.5502, longitude: -0.1969 },
        },
      };
      
      return mockTrackingData;
      
    } catch (error) {
      console.error('Error tracking order:', error);
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track order',
      });
    }
  });

export default trackOrderProcedure;