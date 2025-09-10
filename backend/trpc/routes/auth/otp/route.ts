import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TWILIO_CONFIG } from "@/constants/api";

const sendOtpSchema = z.object({
  phone: z.string().min(10),
  type: z.enum(["registration", "login", "payment_verification"]),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  type: z.enum(["registration", "login", "payment_verification"]),
});

// In-memory OTP storage (use Redis or database in production)
const otpStorage = new Map<string, { otp: string; expires: number; attempts: number }>();

export const sendOtpProcedure = publicProcedure
  .input(sendOtpSchema)
  .mutation(async ({ input }) => {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // Store OTP
      const key = `${input.phone}_${input.type}`;
      otpStorage.set(key, { otp, expires, attempts: 0 });
      
      // Format phone number for Twilio
      const formattedPhone = formatPhoneNumber(input.phone);
      
      // Send SMS via Twilio
      const message = getOtpMessage(otp, input.type);
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${TWILIO_CONFIG.ACCOUNT_SID}:${TWILIO_CONFIG.AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_CONFIG.PHONE_NUMBER,
          To: formattedPhone,
          Body: message,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send OTP");
      }

      console.log(`OTP sent to ${formattedPhone} for ${input.type}:`, result.sid);
      
      return {
        success: true,
        message: "OTP sent successfully",
        expires_in: 300, // 5 minutes
      };
    } catch (error) {
      console.error("OTP sending error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to send OTP");
    }
  });

export const verifyOtpProcedure = publicProcedure
  .input(verifyOtpSchema)
  .mutation(async ({ input }) => {
    try {
      const key = `${input.phone}_${input.type}`;
      const stored = otpStorage.get(key);
      
      if (!stored) {
        throw new Error("OTP not found or expired");
      }
      
      if (Date.now() > stored.expires) {
        otpStorage.delete(key);
        throw new Error("OTP has expired");
      }
      
      if (stored.attempts >= 3) {
        otpStorage.delete(key);
        throw new Error("Too many failed attempts");
      }
      
      if (stored.otp !== input.otp) {
        stored.attempts++;
        throw new Error("Invalid OTP");
      }
      
      // OTP verified successfully
      otpStorage.delete(key);
      
      console.log(`OTP verified successfully for ${input.phone} (${input.type})`);
      
      return {
        success: true,
        message: "OTP verified successfully",
        verified_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      throw new Error(error instanceof Error ? error.message : "OTP verification failed");
    }
  });

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/[^0-9]/g, "");
  
  // If it's a Ghana number starting with 0, replace with +233
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+233${cleaned.substring(1)}`;
  }
  
  // If it already has country code
  if (cleaned.startsWith("233") && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // Default to adding +233 for Ghana
  return `+233${cleaned}`;
}

function getOtpMessage(otp: string, type: string): string {
  const messages = {
    registration: `Welcome to Chopchoo! Your verification code is ${otp}. Valid for 5 minutes.`,
    login: `Your Chopchoo login code is ${otp}. Valid for 5 minutes.`,
    payment_verification: `Your Chopchoo payment verification code is ${otp}. Valid for 5 minutes.`,
  };
  
  return messages[type as keyof typeof messages] || `Your Chopchoo verification code is ${otp}. Valid for 5 minutes.`;
}