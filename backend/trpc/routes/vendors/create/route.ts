import { z } from "zod";
import { publicProcedure } from "../../create-context";

const createVendorSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().url("Logo must be a valid URL"),
  cuisine_type: z.string().min(1, "Cuisine type is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  rating: z.number().min(0).max(5).default(0),
  is_active: z.boolean().default(true),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  delivery_radius: z.number().min(1, "Delivery radius must be at least 1km"),
  opening_hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    is_open: z.boolean()
  })),
  owner_name: z.string().min(1, "Owner name is required"),
  business_type: z.string().min(1, "Business type is required"),
  bank_account: z.object({
    bank_name: z.string(),
    account_number: z.string(),
    account_holder: z.string()
  }),
  commission_rate: z.number().min(0).max(100).default(15),
  payout_frequency: z.enum(["weekly", "biweekly", "monthly"]).default("weekly")
});

export const createVendorProcedure = publicProcedure
  .input(createVendorSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('🏪 Creating vendor:', input.name);
      
      // Generate unique ID
      const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create vendor object
      const vendor = {
        id: vendorId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Vendor created successfully:', vendor.id);
      
      // In a real app, you would save to database here
      // For now, we'll return the created vendor
      return {
        success: true,
        vendor,
        message: `Vendor application for "${input.name}" has been submitted successfully. Application ID: ${vendorId}`
      };
    } catch (error) {
      console.error('❌ Error creating vendor:', error);
      throw new Error(`Failed to create vendor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });