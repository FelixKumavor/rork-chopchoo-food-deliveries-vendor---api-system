import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

// Create the tRPC React client
export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('🌍 Using env base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // For development, use the Rork tunnel URL
  if (typeof window !== 'undefined') {
    // Web environment - check if we're on a rork.live domain
    const origin = window.location.origin;
    if (origin.includes('rork.live')) {
      console.log('🌍 Using window origin (rork.live):', origin);
      return origin;
    }
    // Otherwise use the tunnel URL
    console.log('🌍 Using tunnel URL from web');
  }
  
  // For mobile development and fallback, use the tunnel URL
  // Updated to match current project ID from error messages
  const tunnelUrl = 'https://8f742ee5-9c96-4f0f-8875-7e1b345fc0ab.rork.live';
  console.log('🌍 Using tunnel URL:', tunnelUrl);
  return tunnelUrl;
};

const createTRPCClientConfig = () => ({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
      },
      fetch: async (url, options) => {
        // Validate URL input
        if (!url || typeof url !== 'string') {
          throw new Error('Invalid URL provided to fetch');
        }
        const trimmedUrl = url.trim();
        if (trimmedUrl.length === 0 || trimmedUrl.length > 2000) {
          throw new Error('URL is empty or too long');
        }
        
        console.log('🔄 tRPC request:', trimmedUrl, options?.method || 'GET');
        console.log('🌐 Base URL:', getBaseUrl());
        console.log('📋 Request headers:', options?.headers);
        console.log('📦 Request body:', options?.body);
        
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
              'Cache-Control': 'no-cache',
              'User-Agent': 'ChopChoo-Mobile-App',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          console.log('✅ tRPC response status:', response.status);
          console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ tRPC response error:', response.status, response.statusText);
            console.error('❌ Error body:', errorText);
            
            // Check if we got HTML instead of JSON (common development issue)
            if (errorText.includes('<!DOCTYPE')) {
              throw new Error('Server returned HTML instead of JSON. Backend may not be running or misconfigured.');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
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
          console.error('❌ Full error:', error);
          
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

export const trpcClient = createTRPCProxyClient<AppRouter>(createTRPCClientConfig());

// Export the client configuration for React Query provider
export const trpcClientConfig = createTRPCClientConfig();