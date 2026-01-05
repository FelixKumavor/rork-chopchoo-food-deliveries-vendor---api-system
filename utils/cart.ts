import { Cart, CartItem, MenuItem, Vendor } from "@/types/vendor";

export class CartManager {
  private static STORAGE_KEY = "chopchoo_cart";

  static async getCart(): Promise<Cart | null> {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const cartData = await AsyncStorage.getItem(this.STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : null;
    } catch (error) {
      console.error("Error getting cart:", error);
      return null;
    }
  }

  static async saveCart(cart: Cart): Promise<void> {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }

  static async clearCart(): Promise<void> {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }

  static async addToCart(
    vendor: Vendor,
    menuItem: MenuItem,
    quantity: number = 1,
    customizations: { customization_id: string; option_name: string; price: number }[] = [],
    specialInstructions?: string
  ): Promise<Cart> {
    const currentCart = await this.getCart();
    
    // If cart exists but for different vendor, clear it
    if (currentCart && currentCart.vendor_id !== vendor.id) {
      await this.clearCart();
    }

    const customizationPrice = customizations.reduce((sum, c) => sum + c.price, 0);
    const itemTotalPrice = (menuItem.price + customizationPrice) * quantity;

    const cartItem: CartItem = {
      menu_item: menuItem,
      quantity,
      customizations,
      special_instructions: specialInstructions,
      total_price: itemTotalPrice,
    };

    let cart: Cart;
    if (currentCart && currentCart.vendor_id === vendor.id) {
      // Find existing item with same customizations
      const existingItemIndex = currentCart.items.findIndex(
        (item) =>
          item.menu_item.id === menuItem.id &&
          JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        currentCart.items[existingItemIndex].quantity += quantity;
        currentCart.items[existingItemIndex].total_price += itemTotalPrice;
      } else {
        // Add new item
        currentCart.items.push(cartItem);
      }
      cart = currentCart;
    } else {
      // Create new cart
      cart = {
        vendor_id: vendor.id,
        vendor,
        items: [cartItem],
        subtotal: 0,
        delivery_fee: 0,
        service_fee: 0,
        discount_amount: 0,
        total: 0,
      };
    }

    // Recalculate totals
    cart = this.calculateTotals(cart);
    await this.saveCart(cart);
    return cart;
  }

  static async removeFromCart(menuItemId: string, customizations: any[] = []): Promise<Cart | null> {
    const currentCart = await this.getCart();
    if (!currentCart) return null;

    const itemIndex = currentCart.items.findIndex(
      (item) =>
        item.menu_item.id === menuItemId &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (itemIndex >= 0) {
      currentCart.items.splice(itemIndex, 1);
      
      if (currentCart.items.length === 0) {
        await this.clearCart();
        return null;
      }
      
      const updatedCart = this.calculateTotals(currentCart);
      await this.saveCart(updatedCart);
      return updatedCart;
    }

    return currentCart;
  }

  static async updateQuantity(
    menuItemId: string,
    customizations: any[] = [],
    newQuantity: number
  ): Promise<Cart | null> {
    const currentCart = await this.getCart();
    if (!currentCart) return null;

    const itemIndex = currentCart.items.findIndex(
      (item) =>
        item.menu_item.id === menuItemId &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (itemIndex >= 0) {
      if (newQuantity <= 0) {
        return this.removeFromCart(menuItemId, customizations);
      }

      const item = currentCart.items[itemIndex];
      const unitPrice = item.menu_item.price + item.customizations.reduce((sum, c) => sum + c.price, 0);
      
      item.quantity = newQuantity;
      item.total_price = unitPrice * newQuantity;
      
      const updatedCart = this.calculateTotals(currentCart);
      await this.saveCart(updatedCart);
      return updatedCart;
    }

    return currentCart;
  }

  static calculateTotals(cart: Cart): Cart {
    const subtotal = cart.items.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryFee = subtotal >= 50 ? 0 : 5; // Free delivery over GH₵50
    const serviceFee = subtotal * 0.02; // 2% service fee
    const total = subtotal + deliveryFee + serviceFee - cart.discount_amount;

    return {
      ...cart,
      subtotal,
      delivery_fee: deliveryFee,
      service_fee: serviceFee,
      total: Math.max(0, total),
    };
  }

  static async applyPromoCode(promoCode: string): Promise<Cart | null> {
    const currentCart = await this.getCart();
    if (!currentCart) return null;

    // Mock promo code validation - replace with actual API call
    const mockPromoCodes: { [key: string]: { discount: number; type: "percentage" | "fixed" } } = {
      "CHOPMATE10": { discount: 10, type: "percentage" },
      "WELCOME5": { discount: 5, type: "fixed" },
      "FREEDEL": { discount: 0, type: "fixed" }, // Free delivery
    };

    const promo = mockPromoCodes[promoCode.toUpperCase()];
    if (!promo) {
      throw new Error("Invalid promo code");
    }

    let discountAmount = 0;
    if (promo.type === "percentage") {
      discountAmount = (currentCart.subtotal * promo.discount) / 100;
    } else {
      discountAmount = promo.discount;
    }

    // Special handling for free delivery
    if (promoCode.toUpperCase() === "FREEDEL") {
      discountAmount = currentCart.delivery_fee;
    }

    currentCart.promo_code = promoCode;
    currentCart.discount_amount = discountAmount;
    
    const updatedCart = this.calculateTotals(currentCart);
    await this.saveCart(updatedCart);
    return updatedCart;
  }

  static async removePromoCode(): Promise<Cart | null> {
    const currentCart = await this.getCart();
    if (!currentCart) return null;

    currentCart.promo_code = undefined;
    currentCart.discount_amount = 0;
    
    const updatedCart = this.calculateTotals(currentCart);
    await this.saveCart(updatedCart);
    return updatedCart;
  }

  static getItemCount(cart: Cart | null): number {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}