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

  // For development, use the Rork tunnel URL
  if (typeof window !== 'undefined') {
    // Web environment - use current origin with /api path
    return window.location.origin;
  }
  
  // For mobile development, use the tunnel URL
  return 'https://je86yffmqj9hqfu4somgm.rork.com';
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
              'Accept': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          console.log('tRPC response status:', response.status);
          console.log('tRPC response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('tRPC response error:', response.statusText, errorText);
            
            // Check if we got HTML instead of JSON (common development issue)
            if (errorText.includes('<!DOCTYPE')) {
              throw new Error('Server returned HTML instead of JSON. Check if the backend is running correctly.');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Check content type
          const contentType = response.headers.get('content-type');
          if (contentType && !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Unexpected content type:', contentType, 'Response:', text);
            throw new Error(`Expected JSON response but got ${contentType}`);
          }
          
          return response;
        } catch (error: any) {
          console.error('tRPC fetch error:', error);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
          }
          
          if (error.message?.includes('fetch')) {
            throw new Error('Network error - please check your connection and ensure the backend is running');
          }
          
          throw error;
        }
      },
    }),
  ],
});