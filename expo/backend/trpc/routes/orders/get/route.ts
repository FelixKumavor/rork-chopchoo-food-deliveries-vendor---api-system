import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

const getOrdersSchema = z.object({
  customer_id: z.string().optional(),
  status: z.enum(["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const getOrdersProcedure = publicProcedure
  .input(getOrdersSchema)
  .query(async ({ input }) => {
    try {
      console.log('Fetching orders:', input);
      
      // Mock orders data - in real app, fetch from database
      const mockOrders = [
        {
          id: "order_1704067200_abc123",
          vendor_id: "vendor_1",
          customer_id: "demo_customer_123",
          items: [
            {
              id: "item_1",
              menu_item_id: "menu_1",
              menu_item: {
                id: "menu_1",
                name: "Jollof Rice with Chicken",
                image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
                price: 25.00,
              },
              quantity: 2,
              unit_price: 25.00,
              total_price: 50.00,
              customizations: [],
            }
          ],
          subtotal: 50.00,
          delivery_fee: 5.00,
          service_fee: 1.00,
          discount_amount: 0,
          total: 56.00,
          status: "delivered" as const,
          delivery_address: {
            name: "John Doe",
            phone: "+233 24 123 4567",
            address: "123 Main Street, East Legon",
            city: "Accra",
            coordinates: { latitude: 5.6037, longitude: -0.1870 },
          },
          payment_method: "mobile_money" as const,
          payment_status: "paid" as const,
          estimated_delivery_time: "2024-01-01T14:30:00Z",
          actual_delivery_time: "2024-01-01T14:25:00Z",
          created_at: "2024-01-01T13:00:00Z",
          updated_at: "2024-01-01T14:25:00Z",
          vendor: {
            name: "Mama's Kitchen",
            logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100",
          }
        },
        {
          id: "order_1704153600_def456",
          vendor_id: "vendor_2",
          customer_id: "demo_customer_123",
          items: [
            {
              id: "item_2",
              menu_item_id: "menu_2",
              menu_item: {
                id: "menu_2",
                name: "Banku with Tilapia",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
                price: 30.00,
              },
              quantity: 1,
              unit_price: 30.00,
              total_price: 30.00,
              customizations: [],
            }
          ],
          subtotal: 30.00,
          delivery_fee: 5.00,
          service_fee: 0.60,
          discount_amount: 5.00,
          total: 30.60,
          status: "preparing" as const,
          delivery_address: {
            name: "John Doe",
            phone: "+233 24 123 4567",
            address: "456 Oak Avenue, Osu",
            city: "Accra",
            coordinates: { latitude: 5.5502, longitude: -0.1969 },
          },
          payment_method: "card" as const,
          payment_status: "paid" as const,
          estimated_delivery_time: "2024-01-02T19:45:00Z",
          created_at: "2024-01-02T18:15:00Z",
          updated_at: "2024-01-02T18:30:00Z",
          vendor: {
            name: "Coastal Delights",
            logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100",
          }
        }
      ];
      
      // Filter orders based on input
      let filteredOrders = mockOrders;
      
      if (input.customer_id) {
        filteredOrders = filteredOrders.filter(order => order.customer_id === input.customer_id);
      }
      
      if (input.status) {
        filteredOrders = filteredOrders.filter(order => order.status === input.status);
      }
      
      // Apply pagination
      const paginatedOrders = filteredOrders.slice(input.offset, input.offset + input.limit);
      
      return {
        orders: paginatedOrders,
        total: filteredOrders.length,
        hasMore: input.offset + input.limit < filteredOrders.length,
      };
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch orders',
      });
    }
  });

export default getOrdersProcedure;