import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/auth-provider";
import { VendorProvider } from "@/providers/vendor-provider";
import { CartProvider } from "@/providers/cart-provider";

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
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="vendor-signup" options={{ headerShown: false }} />
      <Stack.Screen name="vendor-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
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
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <VendorProvider>
            <CartProvider>
              <RootLayoutNav />
            </CartProvider>
          </VendorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});