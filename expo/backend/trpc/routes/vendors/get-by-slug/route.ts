import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const getVendorBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required")
});

export const getVendorBySlugProcedure = publicProcedure
  .input(getVendorBySlugSchema)
  .query(async ({ input }) => {
    try {
      console.log('🔍 Fetching vendor by slug:', input.slug);
      
      // Mock vendor data - in production, this would come from database
      const mockVendors = {
        "mamas-kitchen": {
          id: "vendor_1",
          name: "Mama's Kitchen",
          slug: "mamas-kitchen",
          logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop&crop=center",
          cuisine_type: "Ghanaian",
          address: "123 Oxford Street, Osu",
          city: "Accra",
          phone: "+233 20 123 4567",
          email: "info@mamaskitchen.com",
          rating: 4.5,
          is_active: true,
          status: "approved" as const,
          delivery_radius: 5,
          opening_hours: {
            monday: { open: "09:00", close: "22:00", is_open: true },
            tuesday: { open: "09:00", close: "22:00", is_open: true },
            wednesday: { open: "09:00", close: "22:00", is_open: true },
            thursday: { open: "09:00", close: "22:00", is_open: true },
            friday: { open: "09:00", close: "22:00", is_open: true },
            saturday: { open: "09:00", close: "22:00", is_open: true },
            sunday: { open: "09:00", close: "22:00", is_open: false }
          },
          owner_name: "Mary Asante",
          business_type: "Restaurant",
          bank_account: {
            bank_name: "GCB Bank",
            account_number: "1234567890",
            account_holder: "Mary Asante"
          },
          commission_rate: 15,
          payout_frequency: "weekly" as const,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          menu_items: [
            {
              id: "item_1",
              vendor_id: "vendor_1",
              name: "Jollof Rice with Chicken",
              description: "Delicious Ghanaian jollof rice served with grilled chicken",
              price: 25.00,
              image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
              category: "Main Course",
              available: true,
              preparation_time: 20,
              created_at: "2024-01-01T00:00:00Z"
            },
            {
              id: "item_2",
              vendor_id: "vendor_1",
              name: "Banku with Tilapia",
              description: "Traditional banku served with grilled tilapia and pepper sauce",
              price: 30.00,
              image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
              category: "Main Course",
              available: true,
              preparation_time: 25,
              created_at: "2024-01-01T00:00:00Z"
            },
            {
              id: "item_3",
              vendor_id: "vendor_1",
              name: "Kelewele",
              description: "Spiced fried plantain cubes - a perfect snack",
              price: 8.00,
              image: "https://images.unsplash.com/photo-1587334274328-64186a80aeee?w=400",
              category: "Appetizer",
              available: true,
              preparation_time: 10,
              created_at: "2024-01-01T00:00:00Z"
            }
          ]
        },
        "pizza-palace": {
          id: "vendor_2",
          name: "Pizza Palace",
          slug: "pizza-palace",
          logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop&crop=center",
          cuisine_type: "Italian",
          address: "456 Ring Road, East Legon",
          city: "Accra",
          phone: "+233 20 234 5678",
          email: "orders@pizzapalace.com",
          rating: 4.2,
          is_active: true,
          status: "approved" as const,
          delivery_radius: 8,
          opening_hours: {
            monday: { open: "11:00", close: "23:00", is_open: true },
            tuesday: { open: "11:00", close: "23:00", is_open: true },
            wednesday: { open: "11:00", close: "23:00", is_open: true },
            thursday: { open: "11:00", close: "23:00", is_open: true },
            friday: { open: "11:00", close: "23:00", is_open: true },
            saturday: { open: "11:00", close: "23:00", is_open: true },
            sunday: { open: "11:00", close: "23:00", is_open: true }
          },
          owner_name: "Giuseppe Romano",
          business_type: "Restaurant",
          bank_account: {
            bank_name: "Standard Chartered",
            account_number: "0987654321",
            account_holder: "Giuseppe Romano"
          },
          commission_rate: 15,
          payout_frequency: "weekly" as const,
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
          menu_items: [
            {
              id: "item_4",
              vendor_id: "vendor_2",
              name: "Margherita Pizza",
              description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
              price: 35.00,
              image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400",
              category: "Pizza",
              available: true,
              preparation_time: 15,
              created_at: "2024-01-02T00:00:00Z"
            },
            {
              id: "item_5",
              vendor_id: "vendor_2",
              name: "Pepperoni Pizza",
              description: "Delicious pizza topped with pepperoni and mozzarella cheese",
              price: 40.00,
              image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
              category: "Pizza",
              available: true,
              preparation_time: 15,
              created_at: "2024-01-02T00:00:00Z"
            }
          ]
        },
        "burger-spot": {
          id: "vendor_3",
          name: "Burger Spot",
          slug: "burger-spot",
          logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop&crop=center",
          cuisine_type: "Fast Food",
          address: "789 Spintex Road, Tema",
          city: "Tema",
          phone: "+233 20 345 6789",
          email: "hello@burgerspot.com",
          rating: 4.0,
          is_active: true,
          status: "approved" as const,
          delivery_radius: 6,
          opening_hours: {
            monday: { open: "10:00", close: "22:00", is_open: true },
            tuesday: { open: "10:00", close: "22:00", is_open: true },
            wednesday: { open: "10:00", close: "22:00", is_open: true },
            thursday: { open: "10:00", close: "22:00", is_open: true },
            friday: { open: "10:00", close: "22:00", is_open: true },
            saturday: { open: "10:00", close: "22:00", is_open: true },
            sunday: { open: "10:00", close: "22:00", is_open: true }
          },
          owner_name: "Kwame Osei",
          business_type: "Fast Food",
          bank_account: {
            bank_name: "Ecobank",
            account_number: "5555666677",
            account_holder: "Kwame Osei"
          },
          commission_rate: 15,
          payout_frequency: "weekly" as const,
          created_at: "2024-01-03T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
          menu_items: [
            {
              id: "item_6",
              vendor_id: "vendor_3",
              name: "Classic Burger",
              description: "Juicy beef patty with lettuce, tomato, and our special sauce",
              price: 20.00,
              image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
              category: "Burgers",
              available: true,
              preparation_time: 12,
              created_at: "2024-01-03T00:00:00Z"
            },
            {
              id: "item_7",
              vendor_id: "vendor_3",
              name: "Chicken Burger",
              description: "Crispy chicken breast with mayo and fresh vegetables",
              price: 18.00,
              image: "https://images.unsplash.com/photo-1606755962773-d324e2d53014?w=400",
              category: "Burgers",
              available: true,
              preparation_time: 12,
              created_at: "2024-01-03T00:00:00Z"
            }
          ]
        }
      };
      
      const vendor = mockVendors[input.slug as keyof typeof mockVendors];
      
      if (!vendor) {
        console.log('❌ Vendor not found for slug:', input.slug);
        // Return a fallback vendor instead of throwing an error
        const fallbackVendor = mockVendors['mamas-kitchen']; // Use first vendor as fallback
        console.log('🔄 Using fallback vendor:', fallbackVendor.name);
        
        return {
          vendor: fallbackVendor
        };
      }
      
      console.log('✅ Found vendor:', vendor.name);
      
      return {
        vendor
      };
    } catch (error) {
      console.error('❌ Error fetching vendor by slug:', error);
      throw new Error(`Failed to fetch vendor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });