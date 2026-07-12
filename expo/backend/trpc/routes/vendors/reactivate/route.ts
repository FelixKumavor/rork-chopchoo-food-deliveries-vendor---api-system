import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getVendorById, sanitizeVendor, updateVendor } from "../store";

const reactivateVendorSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  adminNotes: z.string().optional().default(""),
});

export const reactivateVendorProcedure = publicProcedure
  .input(reactivateVendorSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("🔄 Reactivating vendor:", input.vendorId);

      const vendor = getVendorById(input.vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }

      if (vendor.status !== "suspended" && vendor.status !== "rejected") {
        throw new Error("Vendor is not suspended or rejected");
      }

      const updated = updateVendor(input.vendorId, {
        status: "approved",
        is_active: true,
        suspended_at: undefined,
        rejected_at: undefined,
        rejection_reason: undefined,
        admin_notes: input.adminNotes || vendor.admin_notes,
      });

      if (!updated) {
        throw new Error("Failed to update vendor");
      }

      console.log("🔄 Vendor reactivated:", updated.name);

      return {
        success: true,
        vendor: sanitizeVendor(updated),
        message: `Vendor "${updated.name}" has been reactivated. They can now access the vendor dashboard and receive orders.`,
      };
    } catch (error) {
      console.error("❌ Error reactivating vendor:", error);
      throw new Error(
        `Failed to reactivate vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
