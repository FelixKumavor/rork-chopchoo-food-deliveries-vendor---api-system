import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getVendorBySlug, sanitizeVendor } from "../store";

const getVendorBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const getVendorBySlugProcedure = publicProcedure
  .input(getVendorBySlugSchema)
  .query(async ({ input }) => {
    try {
      console.log("🔍 Fetching vendor by slug:", input.slug);

      const vendor = getVendorBySlug(input.slug);

      if (!vendor) {
        console.log("❌ Vendor not found for slug:", input.slug);
        throw new Error("Vendor not found");
      }

      console.log("✅ Found vendor:", vendor.name);

      return {
        vendor: sanitizeVendor(vendor),
      };
    } catch (error) {
      console.error("❌ Error fetching vendor by slug:", error);
      throw new Error(
        `Failed to fetch vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
