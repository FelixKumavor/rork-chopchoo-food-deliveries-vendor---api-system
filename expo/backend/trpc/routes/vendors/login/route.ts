import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getVendorByEmail, sanitizeVendor } from "../store";

const vendorLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const vendorLoginProcedure = publicProcedure
  .input(vendorLoginSchema)
  .mutation(async ({ input }) => {
    try {
      console.log("🔐 Vendor login attempt:", input.email);

      const vendor = getVendorByEmail(input.email);

      if (!vendor) {
        throw new Error("No vendor account found with this email address.");
      }

      if (vendor.password !== input.password) {
        throw new Error("Incorrect password. Please try again.");
      }

      if (vendor.status === "pending") {
        throw new Error(
          "Your vendor application is still pending review. You will be notified once it's approved."
        );
      }

      if (vendor.status === "rejected") {
        throw new Error(
          `Your vendor application was rejected. Reason: ${vendor.rejection_reason || "Not specified"}. Please contact support for more information.`
        );
      }

      if (vendor.status === "suspended") {
        throw new Error(
          "Your vendor account has been suspended. Please contact support for more information."
        );
      }

      console.log("✅ Vendor login successful:", vendor.name);

      return {
        success: true,
        vendor: sanitizeVendor(vendor),
        message: `Welcome back, ${vendor.owner_name || vendor.name}!`,
      };
    } catch (error) {
      console.error("❌ Vendor login error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  });
