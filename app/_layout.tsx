import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { httpLink } from "@trpc/client";
import superjson from "superjson";
import { AuthProvider } from "@/providers/auth-provider";
import { VendorProvider } from "@/providers/vendor-provider";
import { CartProvider } from "@/providers/cart-provider";
import FloatingCartButton from "@/components/FloatingCartButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="vendor-signup" options={{ headerShown: false }} />
        <Stack.Screen name="vendor-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen 
          name="cart" 
          options={{ 
            headerShown: false,
            presentation: "modal"
          }} 
        />
        <Stack.Screen 
          name="order-tracking" 
          options={{ 
            headerShown: false,
            presentation: "modal"
          }} 
        />
        <Stack.Screen 
          name="restaurant/[slug]" 
          options={{ 
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            headerStyle: { backgroundColor: 'transparent' }
          }} 
        />
        <Stack.Screen 
          name="profile/personal-info" 
          options={{ 
            headerShown: true,
            headerTitle: "Personal Information",
            headerStyle: { backgroundColor: '#FAFAFA' }
          }} 
        />
        <Stack.Screen 
          name="profile/addresses" 
          options={{ 
            headerShown: true,
            headerTitle: "Addresses",
            headerStyle: { backgroundColor: '#FAFAFA' }
          }} 
        />
        <Stack.Screen 
          name="profile/payment-methods" 
          options={{ 
            headerShown: true,
            headerTitle: "Payment Methods",
            headerStyle: { backgroundColor: '#FAFAFA' }
          }} 
        />
        <Stack.Screen 
          name="profile/notifications" 
          options={{ 
            headerShown: true,
            headerTitle: "Notifications",
            headerStyle: { backgroundColor: '#FAFAFA' }
          }} 
        />
        <Stack.Screen 
          name="profile/help" 
          options={{ 
            headerShown: true,
            headerTitle: "Help & Support",
            headerStyle: { backgroundColor: '#FAFAFA' }
          }} 
        />
        <Stack.Screen 
          name="profile/settings" 
          options={{ 
            headerShown: true,
            headerTitle: "Settings",
            headerStyle: { backgroundColor: '#FAFAFA' }
          }} 
        />
      </Stack>
      <FloatingCartButton />
    </View>
  );
}

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://je86yffmqj9hqfu4somgm.rork.com';
};

export default function RootLayout() {
  const [trpcClient] = React.useState(() => {
    try {
      console.log('🔧 Creating tRPC React client...');
      console.log('🌍 Base URL:', getBaseUrl());
      
      return trpc.createClient({
        links: [
          httpLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
            headers: () => ({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }),
          }),
        ],
      });
    } catch (error) {
      console.error('❌ Failed to create tRPC client in RootLayout:', error);
      throw error;
    }
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <AuthProvider>
            <VendorProvider>
              <CartProvider>
                <RootLayoutNav />
              </CartProvider>
            </VendorProvider>
          </AuthProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});