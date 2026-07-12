import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import {
  getAllVendors,
  sanitizeVendor,
} from "../store";

const getVendorsSchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "suspended"])
    .optional(),
  city: z.string().optional(),
  cuisine_type: z.string().optional(),
  business_category: z.string().optional(),
  is_active: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const getVendorsProcedure = publicProcedure
  .input(getVendorsSchema)
  .query(async ({ input }) => {
    try {
      console.log("🔍 Fetching vendors with filters:", input);

      let vendors = getAllVendors();

      if (input.status) {
        vendors = vendors.filter((v) => v.status === input.status);
      }
      if (input.city) {
        vendors = vendors.filter((v) =>
          v.city.toLowerCase().includes(input.city!.toLowerCase())
        );
      }
      if (input.cuisine_type) {
        vendors = vendors.filter((v) =>
          v.cuisine_type.toLowerCase().includes(input.cuisine_type!.toLowerCase())
        );
      }
      if (input.business_category) {
        vendors = vendors.filter(
          (v) => v.business_category === input.business_category
        );
      }
      if (input.is_active !== undefined) {
        vendors = vendors.filter((v) => v.is_active === input.is_active);
      }

      const total = vendors.length;
      const paginated = vendors
        .slice(input.offset, input.offset + input.limit)
        .map(sanitizeVendor);

      console.log(`✅ Found ${paginated.length} vendors (${total} total)`);

      return {
        vendors: paginated,
        total,
        limit: input.limit,
        offset: input.offset,
        hasMore: input.offset + input.limit < total,
      };
    } catch (error) {
      console.error("❌ Error fetching vendors:", error);
      throw new Error(
        `Failed to fetch vendors: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
