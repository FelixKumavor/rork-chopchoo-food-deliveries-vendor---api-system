import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import {
  getAllVendors,
  getVendorById,
  sanitizeVendor,
  updateVendor,
} from "../store";

const listAllVendorsSchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "suspended", "all"])
    .default("all"),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const adminListVendorsProcedure = publicProcedure
  .input(listAllVendorsSchema)
  .query(async ({ input }) => {
    try {
      console.log("📋 Admin fetching all vendors, status:", input.status);

      let vendors = getAllVendors();

      if (input.status !== "all") {
        vendors = vendors.filter((v) => v.status === input.status);
      }

      const total = vendors.length;
      const paginated = vendors
        .slice(input.offset, input.offset + input.limit)
        .map(sanitizeVendor);

      return {
        vendors: paginated,
        total,
        counts: {
          pending: getAllVendors().filter((v) => v.status === "pending").length,
          approved: getAllVendors().filter((v) => v.status === "approved").length,
          rejected: getAllVendors().filter((v) => v.status === "rejected").length,
          suspended: getAllVendors().filter((v) => v.status === "suspended").length,
          all: getAllVendors().length,
        },
      };
    } catch (error) {
      console.error("❌ Error listing vendors for admin:", error);
      throw new Error(
        `Failed to list vendors: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });

const getVendorDetailSchema = z.object({
  id: z.string().min(1),
});

export const adminGetVendorProcedure = publicProcedure
  .input(getVendorDetailSchema)
  .query(async ({ input }) => {
    try {
      const vendor = getVendorById(input.id);
      if (!vendor) {
        throw new Error("Vendor not found");
      }
      return { vendor: sanitizeVendor(vendor) };
    } catch (error) {
      console.error("❌ Error getting vendor detail:", error);
      throw new Error(
        `Failed to get vendor: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
