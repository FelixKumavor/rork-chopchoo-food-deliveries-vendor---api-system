import { z } from "zod";
import { publicProcedure } from "../../create-context";

const getVendorsSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  city: z.string().optional(),
  cuisine_type: z.string().optional(),
  is_active: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

export const getVendorsProcedure = publicProcedure
  .input(getVendorsSchema)
  .query(async ({ input }) => {
    try {
      console.log('🔍 Fetching vendors with filters:', input);
      
      // Mock vendor data - in production, this would come from database
      const mockVendors = [
        {
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
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
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
          updated_at: "2024-01-02T00:00:00Z"
        },
        {
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
          updated_at: "2024-01-03T00:00:00Z"
        }
      ];
      
      // Apply filters
      let filteredVendors = mockVendors;
      
      if (input.status) {
        filteredVendors = filteredVendors.filter(v => v.status === input.status);
      }
      
      if (input.city) {
        filteredVendors = filteredVendors.filter(v => 
          v.city.toLowerCase().includes(input.city!.toLowerCase())
        );
      }
      
      if (input.cuisine_type) {
        filteredVendors = filteredVendors.filter(v => 
          v.cuisine_type.toLowerCase().includes(input.cuisine_type!.toLowerCase())
        );
      }
      
      if (input.is_active !== undefined) {
        filteredVendors = filteredVendors.filter(v => v.is_active === input.is_active);
      }
      
      // Apply pagination
      const total = filteredVendors.length;
      const vendors = filteredVendors.slice(input.offset, input.offset + input.limit);
      
      console.log(`✅ Found ${vendors.length} vendors (${total} total)`);
      
      return {
        vendors,
        total,
        limit: input.limit,
        offset: input.offset,
        hasMore: input.offset + input.limit < total
      };
    } catch (error) {
      console.error('❌ Error fetching vendors:', error);
      throw new Error(`Failed to fetch vendors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });