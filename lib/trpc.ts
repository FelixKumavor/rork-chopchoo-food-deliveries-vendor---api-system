import { createTRPCReact } from "@trpc/react-query";
import { httpLink, createTRPCClient } from "@trpc/client";
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

const createTRPCClientConfig = () => ({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
      },
      fetch: async (url, options) => {
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
          throw new Error('Invalid URL provided to fetch');
        }
        
        console.log('🔄 tRPC request:', url, options?.method || 'GET');
        console.log('🌐 Base URL:', getBaseUrl());
        
        try {
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          console.log('✅ tRPC response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ tRPC response error:', response.status, response.statusText);
            console.error('❌ Error body:', errorText);
            
            // Check if we got HTML instead of JSON (common development issue)
            if (errorText.includes('<!DOCTYPE')) {
              throw new Error('Server returned HTML instead of JSON. Backend may not be running or misconfigured.');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Check content type
          const contentType = response.headers.get('content-type');
          if (contentType && !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Unexpected content type:', contentType);
            console.error('❌ Response body:', text);
            throw new Error(`Expected JSON response but got ${contentType}`);
          }
          
          return response;
        } catch (error: any) {
          console.error('❌ tRPC fetch error:', error.message);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
          }
          
          if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
            throw new Error('Network error - please check your internet connection and ensure the backend is running');
          }
          
          throw error;
        }
      },
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>(createTRPCClientConfig());