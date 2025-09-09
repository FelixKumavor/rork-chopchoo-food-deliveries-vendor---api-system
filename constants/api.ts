export const API_BASE_URL = "https://api.chopchoo.com";

export const API_ENDPOINTS = {
  // Vendor endpoints
  VENDORS: "/api/vendors",
  VENDOR_BY_SLUG: (slug: string) => `/api/vendors/${slug}`,
  VENDOR_MENU: (slug: string) => `/api/vendors/${slug}/menu`,
  
  // Order endpoints
  ORDERS: "/api/orders",
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  
  // Auth endpoints
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  
  // Payment endpoints
  PAYMENT_CHARGE: "/api/payment/charge",
  PAYMENT_WEBHOOK: "/api/payment/webhook",
} as const;

export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: "pk_test_your_paystack_public_key",
  SPLIT_CODE: "SPL_DEz6ryB9ed",
};

export const TWILIO_CONFIG = {
  ACCOUNT_SID: "AC8b008f1f157e3b1902ee8d2d812ff4bb",
  AUTH_TOKEN: "2f4e349d0bd35e6ed944eb677bff8e6e",
  PHONE_NUMBER: "+1 859 715 1095",
};

export const SENDGRID_CONFIG = {
  API_KEY: "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",
  FROM_EMAIL: "katekobla900@chopchoo.com",
};