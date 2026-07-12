import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getVendorById, sanitizeVendor, updateVendor } from "../store";

const approveVendorSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  adminNotes: z.string().optional().default(""),
});

export const approveVendorProcedure = publicProcedure
  .input(approveVendorSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("✅ Approving vendor:", input.vendorId);

      const vendor = getVendorById(input.vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }

      if (vendor.status === "approved") {
        throw new Error("Vendor is already approved");
      }

      const updated = updateVendor(input.vendorId, {
        status: "approved",
        is_active: true,
        approved_at: new Date().toISOString(),
        rejected_at: undefined,
        suspended_at: undefined,
        rejection_reason: undefined,
        admin_notes: input.adminNotes || vendor.admin_notes,
      });

      if (!updated) {
        throw new Error("Failed to update vendor");
      }

      console.log("✅ Vendor approved:", updated.name);

      return {
        success: true,
        vendor: sanitizeVendor(updated),
        message: `Vendor "${updated.name}" has been approved. They can now access the vendor dashboard and receive orders.`,
      };
    } catch (error) {
      console.error("❌ Error approving vendor:", error);
      throw new Error(
        `Failed to approve vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
