import type { Vendor, VendorStatus } from "@/types/vendor";

interface VendorRecord extends Vendor {
  password: string;
}

const vendorStore = new Map<string, VendorRecord>();

const seedVendors: VendorRecord[] = [
  {
    id: "vendor_1",
    name: "Mama's Kitchen",
    slug: "mamas-kitchen",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop&crop=center",
    cover_image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
    gallery_images: [],
    cuisine_type: "Ghanaian",
    business_category: "Restaurant",
    business_description: "Authentic Ghanaian home-cooked meals made with love.",
    address: "123 Oxford Street, Osu",
    city: "Accra",
    phone: "+233 20 123 4567",
    email: "info@mamaskitchen.com",
    password: "hashed_password_1",
    rating: 4.5,
    is_active: true,
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    approved_at: "2024-01-02T00:00:00Z",
    delivery_radius: 5,
    opening_hours: {
      monday: { open: "09:00", close: "22:00", is_open: true },
      tuesday: { open: "09:00", close: "22:00", is_open: true },
      wednesday: { open: "09:00", close: "22:00", is_open: true },
      thursday: { open: "09:00", close: "22:00", is_open: true },
      friday: { open: "09:00", close: "22:00", is_open: true },
      saturday: { open: "09:00", close: "22:00", is_open: true },
      sunday: { open: "09:00", close: "22:00", is_open: false },
    },
    owner_name: "Mary Asante",
    business_type: "Restaurant",
    bank_account: {
      bank_name: "GCB Bank",
      account_number: "1234567890",
      account_holder: "Mary Asante",
    },
    commission_rate: 15,
    payout_frequency: "weekly",
    coordinates: { latitude: 5.5502, longitude: -0.1767 },
  },
  {
    id: "vendor_2",
    name: "Pizza Palace",
    slug: "pizza-palace",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop&crop=center",
    cover_image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
    gallery_images: [],
    cuisine_type: "Italian",
    business_category: "Restaurant",
    business_description: "Wood-fired pizzas and authentic Italian cuisine.",
    address: "456 Ring Road, East Legon",
    city: "Accra",
    phone: "+233 20 234 5678",
    email: "orders@pizzapalace.com",
    password: "hashed_password_2",
    rating: 4.2,
    is_active: true,
    status: "approved",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    approved_at: "2024-01-03T00:00:00Z",
    delivery_radius: 8,
    opening_hours: {
      monday: { open: "11:00", close: "23:00", is_open: true },
      tuesday: { open: "11:00", close: "23:00", is_open: true },
      wednesday: { open: "11:00", close: "23:00", is_open: true },
      thursday: { open: "11:00", close: "23:00", is_open: true },
      friday: { open: "11:00", close: "23:00", is_open: true },
      saturday: { open: "11:00", close: "23:00", is_open: true },
      sunday: { open: "11:00", close: "23:00", is_open: true },
    },
    owner_name: "Giuseppe Romano",
    business_type: "Restaurant",
    bank_account: {
      bank_name: "Standard Chartered",
      account_number: "0987654321",
      account_holder: "Giuseppe Romano",
    },
    commission_rate: 15,
    payout_frequency: "weekly",
    coordinates: { latitude: 5.6403, longitude: -0.1674 },
  },
  {
    id: "vendor_3",
    name: "Burger Spot",
    slug: "burger-spot",
    logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop&crop=center",
    cover_image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop",
    gallery_images: [],
    cuisine_type: "Fast Food",
    business_category: "Fast Food",
    business_description: "Juicy burgers, crispy fries, and ice-cold drinks.",
    address: "789 Spintex Road, Tema",
    city: "Tema",
    phone: "+233 20 345 6789",
    email: "hello@burgerspot.com",
    password: "hashed_password_3",
    rating: 4.0,
    is_active: true,
    status: "approved",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    approved_at: "2024-01-04T00:00:00Z",
    delivery_radius: 6,
    opening_hours: {
      monday: { open: "10:00", close: "22:00", is_open: true },
      tuesday: { open: "10:00", close: "22:00", is_open: true },
      wednesday: { open: "10:00", close: "22:00", is_open: true },
      thursday: { open: "10:00", close: "22:00", is_open: true },
      friday: { open: "10:00", close: "22:00", is_open: true },
      saturday: { open: "10:00", close: "22:00", is_open: true },
      sunday: { open: "10:00", close: "22:00", is_open: true },
    },
    owner_name: "Kwame Osei",
    business_type: "Fast Food",
    bank_account: {
      bank_name: "Ecobank",
      account_number: "5555666677",
      account_holder: "Kwame Osei",
    },
    commission_rate: 15,
    payout_frequency: "weekly",
    coordinates: { latitude: 5.6403, longitude: -0.1674 },
  },
  {
    id: "vendor_pending_1",
    name: "Fresh Mart Grocery",
    slug: "fresh-mart-grocery",
    logo: "https://images.unsplash.com/photo-1542838132-25c8eb958d2d?w=300&h=300&fit=crop&crop=center",
    cover_image: "https://images.unsplash.com/photo-1542838132-25c8eb958d2d?w=800&h=400&fit=crop",
    gallery_images: [
      "https://images.unsplash.com/photo-1542838132-25c8eb958d2d?w=400",
      "https://images.unsplash.com/photo-1604719312566-8912e922ed26?w=400",
    ],
    cuisine_type: "Grocery",
    business_category: "Grocery",
    business_description: "Fresh produce, pantry staples, and household goods delivered to your door.",
    address: "12 Liberation Road",
    city: "Accra",
    phone: "+233 24 555 6789",
    email: "owner@freshmart.com",
    password: "hashed_password_4",
    rating: 0,
    is_active: false,
    status: "pending",
    created_at: "2024-06-15T00:00:00Z",
    updated_at: "2024-06-15T00:00:00Z",
    delivery_radius: 10,
    opening_hours: {
      monday: { open: "08:00", close: "20:00", is_open: true },
      tuesday: { open: "08:00", close: "20:00", is_open: true },
      wednesday: { open: "08:00", close: "20:00", is_open: true },
      thursday: { open: "08:00", close: "20:00", is_open: true },
      friday: { open: "08:00", close: "20:00", is_open: true },
      saturday: { open: "08:00", close: "20:00", is_open: true },
      sunday: { open: "10:00", close: "18:00", is_open: true },
    },
    owner_name: "Adwoa Mensah",
    business_type: "Grocery",
    bank_account: {
      bank_name: "Absa Bank",
      account_number: "1122334455",
      account_holder: "Adwoa Mensah",
    },
    commission_rate: 12,
    payout_frequency: "weekly",
    documents: {
      business_registration: "https://images.unsplash.com/photo-1554224155-6726b8ff5f6c?w=400",
      food_license: "https://images.unsplash.com/photo-1554224155-6726b8ff5f6c?w=400",
    },
    coordinates: { latitude: 5.6037, longitude: -0.187 },
  },
  {
    id: "vendor_suspended_1",
    name: "Quick Bites",
    slug: "quick-bites",
    logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&crop=center",
    cover_image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
    gallery_images: [],
    cuisine_type: "Fast Food",
    business_category: "Fast Food",
    business_description: "Quick snacks and meals on the go.",
    address: "45 Spintex Road",
    city: "Accra",
    phone: "+233 27 999 0000",
    email: "owner@quickbites.com",
    password: "hashed_password_5",
    rating: 3.5,
    is_active: false,
    status: "suspended",
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-05-20T00:00:00Z",
    approved_at: "2024-03-12T00:00:00Z",
    suspended_at: "2024-05-20T00:00:00Z",
    admin_notes: "Multiple customer complaints about food quality.",
    delivery_radius: 5,
    opening_hours: {
      monday: { open: "10:00", close: "21:00", is_open: true },
      tuesday: { open: "10:00", close: "21:00", is_open: true },
      wednesday: { open: "10:00", close: "21:00", is_open: true },
      thursday: { open: "10:00", close: "21:00", is_open: true },
      friday: { open: "10:00", close: "21:00", is_open: true },
      saturday: { open: "10:00", close: "21:00", is_open: true },
      sunday: { open: "10:00", close: "21:00", is_open: false },
    },
    owner_name: "Yaw Boateng",
    business_type: "Fast Food",
    bank_account: {
      bank_name: "Fidelity Bank",
      account_number: "8899001122",
      account_holder: "Yaw Boateng",
    },
    commission_rate: 15,
    payout_frequency: "weekly",
    coordinates: { latitude: 5.6403, longitude: -0.1674 },
  },
];

seedVendors.forEach((v) => vendorStore.set(v.id, v));

export function getAllVendors(): VendorRecord[] {
  return Array.from(vendorStore.values());
}

export function getVendorById(id: string): VendorRecord | undefined {
  return vendorStore.get(id);
}

export function getVendorBySlug(slug: string): VendorRecord | undefined {
  return getAllVendors().find((v) => v.slug === slug);
}

export function getVendorByEmail(email: string): VendorRecord | undefined {
  return getAllVendors().find((v) => v.email.toLowerCase() === email.toLowerCase());
}

export function addVendor(vendor: VendorRecord): void {
  vendorStore.set(vendor.id, vendor);
}

export function updateVendor(
  id: string,
  updates: Partial<VendorRecord>
): VendorRecord | undefined {
  const existing = vendorStore.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  vendorStore.set(id, updated);
  return updated;
}

export function deleteVendor(id: string): boolean {
  return vendorStore.delete(id);
}

export function getVendorsByStatus(status: VendorStatus): VendorRecord[] {
  return getAllVendors().filter((v) => v.status === status);
}

export function sanitizeVendor(vendor: VendorRecord): Vendor {
  const { password, ...rest } = vendor;
  void password;
  return rest;
}

export function generateVendorId(): string {
  return `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
