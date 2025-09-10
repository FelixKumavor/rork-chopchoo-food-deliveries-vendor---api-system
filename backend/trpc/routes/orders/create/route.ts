import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

const createOrderSchema = z.object({
  vendor_id: z.string(),
  items: z.array(z.object({
    menu_item_id: z.string(),
    quantity: z.number().min(1),
    customizations: z.array(z.object({
      customization_id: z.string(),
      option_name: z.string(),
      price: z.number(),
    })).optional().default([]),
    special_instructions: z.string().optional(),
    unit_price: z.number(),
    total_price: z.number(),
  })),
  delivery_address: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    instructions: z.string().optional(),
  }),
  payment_method: z.enum(["card", "mobile_money", "cash"]),
  special_instructions: z.string().optional(),
  promo_code: z.string().optional(),
  subtotal: z.number(),
  delivery_fee: z.number(),
  service_fee: z.number(),
  discount_amount: z.number().optional().default(0),
  total: z.number(),
});

export const createOrderProcedure = publicProcedure
  .input(createOrderSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('Creating order:', input);
      
      // Generate order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate vendor exists and is active
      // In a real app, you'd check the database
      if (!input.vendor_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Vendor ID is required',
        });
      }
      
      // Validate items and prices
      if (!input.items || input.items.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order must contain at least one item',
        });
      }
      
      // Validate delivery address
      if (!input.delivery_address.name || !input.delivery_address.address) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Complete delivery address is required',
        });
      }
      
      // Calculate estimated delivery time (25-35 minutes from now)
      const estimatedDeliveryTime = new Date(Date.now() + (30 * 60 * 1000)).toISOString();
      
      // Create order object
      const order = {
        id: orderId,
        vendor_id: input.vendor_id,
        customer_id: 'demo_customer_123', // In real app, get from auth context
        items: input.items.map((item, index) => ({
          id: `item_${index}_${Date.now()}`,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          customizations: item.customizations || [],
          special_instructions: item.special_instructions,
        })),
        subtotal: input.subtotal,
        delivery_fee: input.delivery_fee,
        service_fee: input.service_fee,
        discount_amount: input.discount_amount || 0,
        total: input.total,
        status: 'pending' as const,
        delivery_address: input.delivery_address,
        payment_method: input.payment_method,
        payment_status: input.payment_method === 'cash' ? 'pending' : 'pending' as const,
        estimated_delivery_time: estimatedDeliveryTime,
        special_instructions: input.special_instructions,
        promo_code: input.promo_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // In a real app, save to database
      console.log('Order created successfully:', order);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return order with success status
      return {
        success: true,
        order,
        message: 'Order placed successfully!',
      };
      
    } catch (error) {
      console.error('Error creating order:', error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create order. Please try again.',
      });
    }
  });

export default createOrderProcedure;