import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeliveryAddress, PaymentMethod } from "@/types/vendor";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "vendor" | "admin";
  addresses?: DeliveryAddress[];
  payment_methods?: PaymentMethod[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      // Mock login - replace with actual API call
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
            coordinates: {
              latitude: 5.6037,
              longitude: -0.1870
            },
            instructions: "Apartment 2B, blue gate",
            is_default: true
          },
          {
            id: "addr_2",
            name: "Office",
            phone: "+233 20 123 4567",
            address: "456 Oxford Street, Osu",
            city: "Accra",
            coordinates: {
              latitude: 5.5502,
              longitude: -0.1767
            },
            instructions: "3rd floor, office building",
            is_default: false
          }
        ],
        payment_methods: [
          {
            id: "pm_1",
            type: "mobile_money",
            provider: "mtn",
            phone_number: "+233 20 123 4567",
            is_default: true
          },
          {
            id: "pm_2",
            type: "card",
            last_four: "1234",
            is_default: false
          }
        ]
      };
      
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Login error:", error);
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
      // Mock registration - replace with actual API call
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || "customer",
        addresses: [],
        payment_methods: []
      };
      
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}