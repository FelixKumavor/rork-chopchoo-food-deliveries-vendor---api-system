import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Cart, MenuItem, Vendor } from "@/types/vendor";
import { CartManager } from "@/utils/cart";

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (
    vendor: Vendor,
    menuItem: MenuItem,
    quantity?: number,
    customizations?: { customization_id: string; option_name: string; price: number }[],
    specialInstructions?: string
  ) => Promise<void>;
  removeFromCart: (menuItemId: string, customizations?: any[]) => Promise<void>;
  updateQuantity: (menuItemId: string, customizations: any[], newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const [CartProvider, useCart] = createContextHook<CartContextType>(() => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemCount = CartManager.getItemCount(cart);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const savedCart = await CartManager.getCart();
      setCart(savedCart);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback(async (
    vendor: Vendor,
    menuItem: MenuItem,
    quantity: number = 1,
    customizations: { customization_id: string; option_name: string; price: number }[] = [],
    specialInstructions?: string
  ) => {
    try {
      const updatedCart = await CartManager.addToCart(
        vendor,
        menuItem,
        quantity,
        customizations,
        specialInstructions
      );
      setCart(updatedCart);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }, []);

  const removeFromCart = useCallback(async (menuItemId: string, customizations: any[] = []) => {
    try {
      const updatedCart = await CartManager.removeFromCart(menuItemId, customizations);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }, []);

  const updateQuantity = useCallback(async (menuItemId: string, customizations: any[] = [], newQuantity: number) => {
    try {
      const updatedCart = await CartManager.updateQuantity(menuItemId, customizations, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await CartManager.clearCart();
      setCart(null);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }, []);

  const applyPromoCode = useCallback(async (code: string) => {
    try {
      const updatedCart = await CartManager.applyPromoCode(code);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error applying promo code:", error);
      throw error;
    }
  }, []);

  const removePromoCode = useCallback(async () => {
    try {
      const updatedCart = await CartManager.removePromoCode();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing promo code:", error);
      throw error;
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await loadCart();
  }, []);

  return useMemo(() => ({
    cart,
    itemCount,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromoCode,
    removePromoCode,
    refreshCart,
  }), [cart, itemCount, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, applyPromoCode, removePromoCode, refreshCart]);
});