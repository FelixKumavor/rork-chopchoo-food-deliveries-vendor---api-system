import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getVendorById, sanitizeVendor, updateVendor } from "../store";

const rejectVendorSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
  adminNotes: z.string().optional().default(""),
});

export const rejectVendorProcedure = publicProcedure
  .input(rejectVendorSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("❌ Rejecting vendor:", input.vendorId);

      const vendor = getVendorById(input.vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }

      if (vendor.status === "rejected") {
        throw new Error("Vendor is already rejected");
      }

      const updated = updateVendor(input.vendorId, {
        status: "rejected",
        is_active: false,
        rejected_at: new Date().toISOString(),
        rejection_reason: input.rejectionReason,
        admin_notes: input.adminNotes || vendor.admin_notes,
      });

      if (!updated) {
        throw new Error("Failed to update vendor");
      }

      console.log("❌ Vendor rejected:", updated.name);

      return {
        success: true,
        vendor: sanitizeVendor(updated),
        message: `Vendor "${updated.name}" has been rejected. Reason: ${input.rejectionReason}`,
      };
    } catch (error) {
      console.error("❌ Error rejecting vendor:", error);
      throw new Error(
        `Failed to reject vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
