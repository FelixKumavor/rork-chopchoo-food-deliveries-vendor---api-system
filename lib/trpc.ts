import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback to default development URL
  if (typeof window !== 'undefined') {
    // Web environment - use current origin
    return window.location.origin;
  }
  
  // Default fallback for development
  return 'http://localhost:8081';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch: async (url, options) => {
        console.log('tRPC request:', url, options?.method || 'GET');
        console.log('Base URL:', getBaseUrl());
        
        try {
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          console.log('tRPC response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('tRPC response error:', response.statusText, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error: any) {
          console.error('tRPC fetch error:', error);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
          }
          
          if (error.message?.includes('fetch')) {
            throw new Error('Network error - please check your connection');
          }
          
          throw error;
        }
      },
    }),
  ],
});