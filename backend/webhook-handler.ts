import { Hono } from "hono";
import crypto from "crypto";

const webhookApp = new Hono();

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      orderId?: string;
      provider?: string;
      [key: string]: any;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

webhookApp.post("/paystack", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header("x-paystack-signature");
    
    if (!signature) {
      console.error("No signature provided");
      return c.json({ error: "No signature provided" }, 400);
    }

    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY || "sk_test_your_secret_key";
    const hash = crypto.createHmac("sha512", secretKey).update(body).digest("hex");
    
    if (hash !== signature) {
      console.error("Invalid signature");
      return c.json({ error: "Invalid signature" }, 400);
    }

    const event: PaystackWebhookEvent = JSON.parse(body);
    console.log("Received Paystack webhook:", event.event, event.data.reference);

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "charge.failed":
        await handleChargeFailed(event.data);
        break;
      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;
      case "transfer.failed":
        await handleTransferFailed(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return c.json({ status: "success" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

async function handleChargeSuccess(data: PaystackWebhookEvent["data"]) {
  try {
    console.log(`Payment successful for reference: ${data.reference}`);
    
    // Extract order ID from metadata
    const orderId = data.metadata?.orderId;
    if (!orderId) {
      console.error("No order ID found in metadata");
      return;
    }

    // Here you would update your order in the database
    // For now, we'll just log the success
    console.log(`Order ${orderId} payment confirmed:`, {
      reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      channel: data.channel,
      customer: data.customer.email,
      provider: data.metadata?.provider,
    });

    // TODO: Update order status in database
    // await updateOrderPaymentStatus(orderId, "paid", data.reference);
    
    // TODO: Send confirmation email/SMS to customer
    // await sendPaymentConfirmation(data.customer.email, orderId);
    
    // TODO: Notify vendor about new order
    // await notifyVendor(orderId);
    
  } catch (error) {
    console.error("Error handling charge success:", error);
  }
}

async function handleChargeFailed(data: PaystackWebhookEvent["data"]) {
  try {
    console.log(`Payment failed for reference: ${data.reference}`);
    
    const orderId = data.metadata?.orderId;
    if (!orderId) {
      console.error("No order ID found in metadata");
      return;
    }

    console.log(`Order ${orderId} payment failed:`, {
      reference: data.reference,
      message: data.message,
      gateway_response: data.gateway_response,
    });

    // TODO: Update order status in database
    // await updateOrderPaymentStatus(orderId, "payment_failed", data.reference);
    
    // TODO: Send failure notification to customer
    // await sendPaymentFailureNotification(data.customer.email, orderId);
    
  } catch (error) {
    console.error("Error handling charge failure:", error);
  }
}

async function handleTransferSuccess(data: any) {
  console.log("Transfer successful:", data.reference);
  // Handle successful transfers to vendors
}

async function handleTransferFailed(data: any) {
  console.log("Transfer failed:", data.reference);
  // Handle failed transfers to vendors
}

export default webhookApp;