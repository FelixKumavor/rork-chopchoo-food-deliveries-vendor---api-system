export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo: string;
  cuisine_type: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  is_active: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  delivery_radius?: number;
  opening_hours?: {
    [key: string]: {
      open: string;
      close: string;
      is_open: boolean;
    };
  };
  owner_name?: string;
  business_type?: string;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  commission_rate?: number;
  payout_frequency?: "weekly" | "biweekly" | "monthly";
  documents?: {
    business_registration?: string;
    food_license?: string;
    tax_id?: string;
  };
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  created_at: string;
  customizations?: MenuCustomization[];
  preparation_time?: number;
}

export interface MenuCustomization {
  id: string;
  name: string;
  options: {
    name: string;
    price: number;
  }[];
  required: boolean;
  max_selections: number;
}

export interface Order {
  id: string;
  vendor_id: string;
  customer_id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  delivery_address: DeliveryAddress;
  payment_method: "card" | "mobile_money" | "cash";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_reference?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  rider_id?: string;
  special_instructions?: string;
  promo_code?: string;
  discount_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  customizations?: {
    customization_id: string;
    option_name: string;
    price: number;
  }[];
  special_instructions?: string;
}

export interface DeliveryAddress {
  id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  instructions?: string;
  is_default?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "vendor" | "rider" | "admin";
  avatar?: string;
  addresses?: DeliveryAddress[];
  payment_methods?: PaymentMethod[];
  preferences?: {
    notifications: boolean;
    location_sharing: boolean;
    marketing_emails: boolean;
  };
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "mobile_money";
  provider?: string;
  last_four?: string;
  phone_number?: string;
  is_default: boolean;
}

export interface Review {
  id: string;
  vendor_id: string;
  customer_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  food_rating: number;
  delivery_rating: number;
  created_at: string;
  customer_name: string;
  customer_avatar?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_vendors?: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "payment";
  data?: any;
  read: boolean;
  created_at: string;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  customizations: {
    customization_id: string;
    option_name: string;
    price: number;
  }[];
  special_instructions?: string;
  total_price: number;
}

export interface Cart {
  vendor_id: string;
  vendor: Vendor;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  discount_amount: number;
  total: number;
  promo_code?: string;
}

export interface VendorSignupData {
  restaurant_name: string;
  business_type: string;
  cuisine_type: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  delivery_radius: number;
  opening_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_open: boolean;
    };
  };
  bank_account: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  };
  menu_items?: {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
  }[];
  logo?: string;
  documents?: {
    business_registration?: string;
    food_license?: string;
    tax_id?: string;
  };
  commission_rate: number;
  payout_frequency: "weekly" | "biweekly" | "monthly";
  terms_accepted: boolean;
}