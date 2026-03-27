import { PAYSTACK_CONFIG } from "@/constants/api";

export interface PaymentData {
  amount: number;
  email: string;
  reference: string;
  currency?: string;
  channels?: string[];
  metadata?: any;
  split_code?: string;
  subaccount?: string;
}

export interface MobileMoneyData {
  phone: string;
  provider: "mtn" | "vodafone" | "airtel";
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  message?: string;
  data?: any;
}

export class PaymentService {
  private static PAYSTACK_BASE_URL = "https://api.paystack.co";

  static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `chopchoo_${timestamp}_${random}`;
  }

  static async initializePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_CONFIG.PUBLIC_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentData,
          amount: paymentData.amount * 100, // Convert to kobo
          currency: paymentData.currency || "GHS",
          split_code: PAYSTACK_CONFIG.SPLIT_CODE,
        }),
      });

      const result = await response.json();
      
      if (result.status) {
        return {
          success: true,
          reference: paymentData.reference,
          data: result.data,
        };
      } else {
        return {
          success: false,
          reference: paymentData.reference,
          message: result.message || "Payment initialization failed",
        };
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      return {
        success: false,
        reference: paymentData.reference,
        message: "Network error occurred",
      };
    }
  }

  static async chargeMobileMoney(
    paymentData: PaymentData,
    mobileMoneyData: MobileMoneyData
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.PAYSTACK_BASE_URL}/charge`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_CONFIG.PUBLIC_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: paymentData.email,
          amount: paymentData.amount * 100, // Convert to kobo
          currency: paymentData.currency || "GHS",
          reference: paymentData.reference,
          mobile_money: {
            phone: mobileMoneyData.phone,
            provider: mobileMoneyData.provider,
          },
          split_code: PAYSTACK_CONFIG.SPLIT_CODE,
          metadata: paymentData.metadata,
        }),
      });

      const result = await response.json();
      
      return {
        success: result.status || false,
        reference: paymentData.reference,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error("Mobile money charge error:", error);
      return {
        success: false,
        reference: paymentData.reference,
        message: "Network error occurred",
      };
    }
  }

  static async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_CONFIG.PUBLIC_KEY}`,
        },
      });

      const result = await response.json();
      
      return {
        success: result.status || false,
        reference,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        reference,
        message: "Verification failed",
      };
    }
  }

  static async createSubaccount(vendorData: {
    business_name: string;
    bank_code: string;
    account_number: string;
    percentage_charge: number;
  }): Promise<{ success: boolean; subaccount_code?: string; message?: string }> {
    try {
      const response = await fetch(`${this.PAYSTACK_BASE_URL}/subaccount`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_CONFIG.PUBLIC_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_name: vendorData.business_name,
          settlement_bank: vendorData.bank_code,
          account_number: vendorData.account_number,
          percentage_charge: vendorData.percentage_charge,
        }),
      });

      const result = await response.json();
      
      if (result.status) {
        return {
          success: true,
          subaccount_code: result.data.subaccount_code,
        };
      } else {
        return {
          success: false,
          message: result.message || "Subaccount creation failed",
        };
      }
    } catch (error) {
      console.error("Subaccount creation error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  static formatAmount(amount: number, currency: string = "GHS"): string {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  static validateMobileMoneyNumber(phone: string, provider: string): boolean {
    // Remove any spaces or special characters
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    
    // Ghana mobile number validation
    if (cleanPhone.length !== 10) return false;
    
    switch (provider) {
      case "mtn":
        return /^(024|025|053|054|055|059)/.test(cleanPhone);
      case "vodafone":
        return /^(020|050|051)/.test(cleanPhone);
      case "airtel":
        return /^(026|056|057)/.test(cleanPhone);
      default:
        return false;
    }
  }

  static detectMobileMoneyProvider(phone: string): "mtn" | "vodafone" | "airtel" | null {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    
    if (/^(024|025|053|054|055|059)/.test(cleanPhone)) return "mtn";
    if (/^(020|050|051)/.test(cleanPhone)) return "vodafone";
    if (/^(026|056|057)/.test(cleanPhone)) return "airtel";
    
    return null;
  }

  static async sendPaymentConfirmation(
    email: string,
    orderDetails: {
      orderId: string;
      amount: number;
      vendorName: string;
      items: string[];
    }
  ): Promise<boolean> {
    try {
      // This would integrate with SendGrid or another email service
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_SENDGRID_API_KEY",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email }],
            subject: "Payment Confirmation - Chopchoo Deliveries",
          }],
          from: { email: "noreply@chopchoo.com", name: "Chopchoo Deliveries" },
          content: [{
            type: "text/html",
            value: `
              <h2>Payment Confirmed!</h2>
              <p>Your order #${orderDetails.orderId} has been confirmed.</p>
              <p><strong>Vendor:</strong> ${orderDetails.vendorName}</p>
              <p><strong>Amount:</strong> ${this.formatAmount(orderDetails.amount)}</p>
              <p><strong>Items:</strong></p>
              <ul>
                ${orderDetails.items.map(item => `<li>${item}</li>`).join("")}
              </ul>
              <p>Thank you for using Chopchoo Deliveries!</p>
            `,
          }],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }
}