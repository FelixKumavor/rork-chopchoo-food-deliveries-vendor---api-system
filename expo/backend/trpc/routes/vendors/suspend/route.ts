import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getVendorById, sanitizeVendor, updateVendor } from "../store";

const suspendVendorSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  adminNotes: z.string().optional().default(""),
});

export const suspendVendorProcedure = publicProcedure
  .input(suspendVendorSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("🚫 Suspending vendor:", input.vendorId);

      const vendor = getVendorById(input.vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }

      if (vendor.status === "suspended") {
        throw new Error("Vendor is already suspended");
      }

      const updated = updateVendor(input.vendorId, {
        status: "suspended",
        is_active: false,
        suspended_at: new Date().toISOString(),
        admin_notes: input.adminNotes || vendor.admin_notes,
      });

      if (!updated) {
        throw new Error("Failed to update vendor");
      }

      console.log("🚫 Vendor suspended:", updated.name);

      return {
        success: true,
        vendor: sanitizeVendor(updated),
        message: `Vendor "${updated.name}" has been suspended. They can no longer receive orders. Their data has been preserved.`,
      };
    } catch (error) {
      console.error("❌ Error suspending vendor:", error);
      throw new Error(
        `Failed to suspend vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
