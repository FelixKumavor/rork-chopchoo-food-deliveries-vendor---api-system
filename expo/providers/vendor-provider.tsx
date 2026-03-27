import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from '@/lib/trpc';

interface Vendor {
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
}

export const [VendorProvider, useVendorStore] = createContextHook(() => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use tRPC to fetch vendors from backend
  const vendorsQuery = trpc.vendors.get.useQuery(
    { status: 'approved', is_active: true },
    { 
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (vendorsQuery.data?.vendors) {
      console.log('📦 Setting vendors from backend:', vendorsQuery.data.vendors.length);
      setVendors(vendorsQuery.data.vendors);
      setIsLoading(false);
    } else if (!vendorsQuery.isLoading && !vendorsQuery.data) {
      // Fallback to local storage if backend fails
      loadVendors();
    } else {
      setIsLoading(vendorsQuery.isLoading);
    }
  }, [vendorsQuery.data, vendorsQuery.isLoading]);

  const loadVendors = async () => {
    try {
      console.log('🔄 Loading vendors...');
      setIsLoading(true);
      console.log('🔄 VendorProvider: Starting to load vendors');
      
      // Try to load from AsyncStorage first
      const storedVendors = await AsyncStorage.getItem("vendors");
      if (storedVendors) {
          const parsedVendors = JSON.parse(storedVendors);
        console.log('📦 Found stored vendors:', parsedVendors.length);
        console.log('📦 Stored vendors data:', parsedVendors);
        setVendors(parsedVendors);
        setIsLoading(false);
        return;
      }
      
      console.log('🆕 No stored vendors, creating mock data...');
      
      // Mock data - replace with actual API call
      const mockVendors: Vendor[] = [
        {
          id: "1",
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
          status: "approved",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
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
          status: "approved",
          created_at: "2024-01-02T00:00:00Z",
        },
        {
          id: "3",
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
          status: "approved",
          created_at: "2024-01-03T00:00:00Z",
        },
      ];

      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem("vendors", JSON.stringify(mockVendors));
      console.log('📦 Created and stored mock vendors:', mockVendors.length);
      console.log('📦 Mock vendors data:', mockVendors);
      setVendors(mockVendors);
    } catch (error) {
      console.error('❌ Error loading vendors:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    } finally {
      console.log('🔄 VendorProvider: Finished loading vendors, isLoading set to false');
      setIsLoading(false);
    }
  };

  const getVendorBySlug = useCallback((slug: string) => {
    return vendors.find(vendor => vendor.slug === slug);
  }, [vendors]);

  const getActiveVendors = useCallback(() => {
    // For testing purposes, show all vendors (including pending ones)
    // In production, you would only show approved vendors
    return vendors.filter(vendor => vendor.status === "approved" || vendor.status === "pending");
  }, [vendors]);

  const addVendor = useCallback(async (vendorData: Omit<Vendor, "id" | "created_at">) => {
    try {
      // This is now handled by the backend via tRPC
      // We'll keep this for backward compatibility but it won't be used
      const newVendor: Vendor = {
        ...vendorData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      const updatedVendors = [...vendors, newVendor];
      setVendors(updatedVendors);
      await AsyncStorage.setItem("vendors", JSON.stringify(updatedVendors));
      
      return newVendor;
    } catch (error) {
      console.error("Error adding vendor:", error);
      throw error;
    }
  }, [vendors]);

  const updateVendor = useCallback(async (id: string, updates: Partial<Vendor>) => {
    try {
      const updatedVendors = vendors.map(vendor =>
        vendor.id === id ? { ...vendor, ...updates } : vendor
      );
      
      setVendors(updatedVendors);
      await AsyncStorage.setItem("vendors", JSON.stringify(updatedVendors));
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  }, [vendors]);

  const refreshVendors = useCallback(() => {
    vendorsQuery.refetch();
  }, [vendorsQuery]);

  return useMemo(() => ({
    vendors,
    isLoading,
    getVendorBySlug,
    getActiveVendors,
    addVendor,
    updateVendor,
    refreshVendors,
  }), [vendors, isLoading, getVendorBySlug, getActiveVendors, addVendor, updateVendor, refreshVendors]);
});