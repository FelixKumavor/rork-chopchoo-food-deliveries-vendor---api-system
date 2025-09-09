import { TWILIO_CONFIG, SENDGRID_CONFIG } from "@/constants/api";

interface SMSData {
  to: string;
  message: string;
}

interface EmailData {
  to: string;
  subject: string;
  message: string;
  html?: string;
}

export class NotificationService {
  async sendSMS(data: SMSData) {
    try {
      const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_CONFIG.ACCOUNT_SID + "/Messages.json", {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(TWILIO_CONFIG.ACCOUNT_SID + ":" + TWILIO_CONFIG.AUTH_TOKEN),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_CONFIG.PHONE_NUMBER,
          To: data.to,
          Body: data.message,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "SMS sending failed");
      }

      console.log("📱 SMS sent successfully to", data.to);
      return result;
    } catch (error) {
      console.error("❌ Error sending SMS:", error);
      throw error;
    }
  }

  async sendEmail(data: EmailData) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SENDGRID_CONFIG.API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: data.to }],
              subject: data.subject,
            },
          ],
          from: { email: SENDGRID_CONFIG.FROM_EMAIL },
          content: [
            {
              type: "text/plain",
              value: data.message,
            },
            ...(data.html ? [{
              type: "text/html",
              value: data.html,
            }] : []),
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || "Email sending failed");
      }

      console.log("📧 Email sent successfully to", data.to);
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw error;
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phone: string) {
    const otp = this.generateOTP();
    const message = `Your Chopchoo verification code is: ${otp}. Valid for 10 minutes.`;
    
    await this.sendSMS({ to: phone, message });
    return otp;
  }

  async sendOrderConfirmation(email: string, orderDetails: any) {
    const subject = `Order Confirmation - #${orderDetails.id}`;
    const message = `
      Thank you for your order!
      
      Order ID: ${orderDetails.id}
      Restaurant: ${orderDetails.restaurant}
      Total: GH₵${orderDetails.total}
      
      We'll notify you when your order is ready.
    `;
    
    await this.sendEmail({ to: email, subject, message });
  }

  async sendPaymentConfirmation(email: string, paymentDetails: any) {
    const subject = "Payment Confirmed - Chopchoo";
    const message = `
      Your payment has been confirmed!
      
      Amount: GH₵${paymentDetails.amount}
      Reference: ${paymentDetails.reference}
      
      Thank you for using Chopchoo!
    `;
    
    await this.sendEmail({ to: email, subject, message });
  }
}

export const notificationService = new NotificationService();