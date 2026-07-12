import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import {
  addVendor,
  generateVendorId,
  getVendorByEmail,
  sanitizeVendor,
} from "../store";

const createVendorSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().optional().default(""),
  cover_image: z.string().optional().default(""),
  gallery_images: z.array(z.string()).optional().default([]),
  cuisine_type: z.string().min(1, "Cuisine type is required"),
  business_category: z.enum([
    "Restaurant",
    "Grocery",
    "Pharmacy",
    "Bakery",
    "Cafe",
    "Fast Food",
    "Beverages",
    "Other",
  ]),
  business_description: z.string().optional().default(""),
  address: z.string().min(1, "Business address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rating: z.number().min(0).max(5).default(0),
  is_active: z.boolean().default(false),
  status: z
    .enum(["pending", "approved", "rejected", "suspended"])
    .default("pending"),
  delivery_radius: z.number().min(1, "Delivery radius must be at least 1km"),
  opening_hours: z.record(
    z.string(),
    z.object({
      open: z.string(),
      close: z.string(),
      is_open: z.boolean(),
    })
  ),
  owner_name: z.string().min(1, "Owner name is required"),
  business_type: z.string().min(1, "Business type is required"),
  bank_account: z.object({
    bank_name: z.string(),
    account_number: z.string(),
    account_holder: z.string(),
  }),
  commission_rate: z.number().min(0).max(100).default(15),
  payout_frequency: z.enum(["weekly", "biweekly", "monthly"]).default("weekly"),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  documents: z
    .object({
      business_registration: z.string().optional(),
      food_license: z.string().optional(),
      tax_id: z.string().optional(),
    })
    .optional(),
});

export const createVendorProcedure = publicProcedure
  .input(createVendorSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("🏪 Creating vendor application:", input.name);

      const existing = getVendorByEmail(input.email);
      if (existing) {
        throw new Error(
          "A vendor with this email already exists. Please use a different email."
        );
      }

      const vendorId = generateVendorId();
      const now = new Date().toISOString();

      const vendorRecord = {
        id: vendorId,
        ...input,
        logo:
          input.logo ||
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop&crop=center",
        status: "pending" as const,
        is_active: false,
        rating: 0,
        created_at: now,
        updated_at: now,
      };

      addVendor(vendorRecord);

      console.log("✅ Vendor application created:", vendorId);

      return {
        success: true,
        vendor: sanitizeVendor(vendorRecord),
        message: `Your vendor application for "${input.name}" has been submitted successfully. Application ID: ${vendorId}. We'll review your application and notify you at ${input.email} within 2-3 business days.`,
      };
    } catch (error) {
      console.error("❌ Error creating vendor:", error);
      throw new Error(
        `Failed to create vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
