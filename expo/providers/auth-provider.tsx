import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "@/lib/trpc";
import type { DeliveryAddress, PaymentMethod, Vendor } from "@/types/vendor";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "vendor" | "admin";
  addresses?: DeliveryAddress[];
  payment_methods?: PaymentMethod[];
  vendorData?: Vendor;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsVendor: (email: string, password: string) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
  isApprovedVendor: boolean;
}

const ADMIN_CREDENTIALS = {
  email: "admin@chopchoo.com",
  password: "admin123",
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const vendorLoginMutation = trpc.vendors.login.useMutation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Check if admin
      if (
        email === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const adminUser: User = {
          id: "admin_1",
          name: "System Admin",
          email,
          phone: "+233 20 000 0000",
          role: "admin",
        };
        await AsyncStorage.setItem("user", JSON.stringify(adminUser));
        setUser(adminUser);
        return;
      }

      // Mock customer login
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email,
        phone: "+233 20 123 4567",
        role: "customer",
        addresses: [
          {
            id: "addr_1",
            name: "Home",
            phone: "+233 20 123 4567",
            address: "123 Liberation Road, Accra",
            city: "Accra",
            coordinates: { latitude: 5.6037, longitude: -0.187 },
            instructions: "Apartment 2B, blue gate",
            is_default: true,
          },
        ],
        payment_methods: [
          {
            id: "pm_1",
            type: "mobile_money",
            provider: "mtn",
            phone_number: "+233 20 123 4567",
            is_default: true,
          },
        ],
      };
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginAsVendor = async (email: string, password: string) => {
    try {
      const result = await vendorLoginMutation.mutateAsync({ email, password });
      const vendorUser: User = {
        id: result.vendor.id,
        name: result.vendor.name,
        email: result.vendor.email,
        phone: result.vendor.phone,
        role: "vendor",
        vendorData: result.vendor,
      };
      await AsyncStorage.setItem("user", JSON.stringify(vendorUser));
      setUser(vendorUser);
    } catch (error) {
      console.error("Vendor login error:", error);
      throw error;
    }
  };

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      if (
        email !== ADMIN_CREDENTIALS.email ||
        password !== ADMIN_CREDENTIALS.password
      ) {
        throw new Error("Invalid admin credentials");
      }
      const adminUser: User = {
        id: "admin_1",
        name: "System Admin",
        email,
        phone: "+233 20 000 0000",
        role: "admin",
      };
      await AsyncStorage.setItem("user", JSON.stringify(adminUser));
      setUser(adminUser);
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || "customer",
        addresses: [],
        payment_methods: [],
      };
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";
  const isApprovedVendor =
    isVendor && user?.vendorData?.status === "approved";

  return useMemo(
    () => ({
      user,
      isLoading,
      login,
      loginAsVendor,
      loginAsAdmin,
      logout,
      register,
      isAdmin,
      isVendor,
      isApprovedVendor,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isLoading, isAdmin, isVendor, isApprovedVendor]
  );
});
