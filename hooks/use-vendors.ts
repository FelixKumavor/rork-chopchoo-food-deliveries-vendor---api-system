import { useVendorStore } from "@/providers/vendor-provider";
import { useMemo } from "react";

export function useVendors() {
  const { getActiveVendors, isLoading } = useVendorStore();
  
  const data = useMemo(() => {
    if (isLoading) return [];
    return getActiveVendors();
  }, [getActiveVendors, isLoading]);
  
  return {
    data,
    isLoading,
    error: null,
  };
}

export function useVendorBySlug(slug: string) {
  const { getVendorBySlug, isLoading } = useVendorStore();
  
  const data = useMemo(() => {
    if (isLoading || !slug) return null;
    return getVendorBySlug(slug);
  }, [getVendorBySlug, isLoading, slug]);
  
  return {
    data,
    isLoading,
    error: null,
  };
}