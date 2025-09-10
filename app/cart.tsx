import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,

  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useCart } from '@/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';
import { router } from 'expo-router';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CreditCard,
  Tag,
  Clock,

  X,
  ArrowLeft,
} from 'lucide-react-native';
import { DeliveryAddress, PaymentMethod } from '@/types/vendor';

interface CheckoutData {
  deliveryAddress: DeliveryAddress | null;
  paymentMethod: PaymentMethod | null;
  specialInstructions: string;
  promoCode: string;
}

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, applyPromoCode, removePromoCode } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryAddress: (user as any)?.addresses?.find((addr: any) => addr.is_default) || null,
    paymentMethod: (user as any)?.payment_methods?.find((pm: any) => pm.is_default) || null,
    specialInstructions: '',
    promoCode: cart?.promo_code || '',
  });

  const handleQuantityChange = async (menuItemId: string, customizations: any[], newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        await removeFromCart(menuItemId, customizations);
      } else {
        await updateQuantity(menuItemId, customizations, newQuantity);
      }
    } catch {
      console.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (menuItemId: string, customizations: any[]) => {
    try {
      await removeFromCart(menuItemId, customizations);
    } catch {
      console.error('Failed to remove item');
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    
    try {
      await applyPromoCode(promoCodeInput.trim());
      setCheckoutData(prev => ({ ...prev, promoCode: promoCodeInput.trim() }));
      setShowPromoInput(false);
      setPromoCodeInput('');
      console.log('Promo code applied successfully!');
    } catch {
      console.error('Invalid promo code');
    }
  };

  const handleRemovePromoCode = async () => {
    try {
      await removePromoCode();
      setCheckoutData(prev => ({ ...prev, promoCode: '' }));
    } catch {
      console.error('Failed to remove promo code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.deliveryAddress) {
      console.error('Missing delivery address');
      return;
    }

    if (!checkoutData.paymentMethod) {
      console.error('Missing payment method');
      return;
    }

    setIsCheckingOut(true);

    try {
      const orderData = {
        vendor_id: cart?.vendor_id,
        items: cart?.items.map(item => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
          customizations: item.customizations,
          special_instructions: item.special_instructions,
          unit_price: item.menu_item.price,
          total_price: item.total_price,
        })),
        delivery_address: checkoutData.deliveryAddress,
        payment_method: checkoutData.paymentMethod.type,
        special_instructions: checkoutData.specialInstructions,
        promo_code: checkoutData.promoCode,
        subtotal: cart?.subtotal,
        delivery_fee: cart?.delivery_fee,
        service_fee: cart?.service_fee,
        discount_amount: cart?.discount_amount,
        total: cart?.total,
      };

      console.log('Placing order:', orderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Order placed successfully!');
      router.push('/(tabs)/orders');
    } catch {
      console.error('Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.emptyCart}>
          <ShoppingCart size={80} color="#E5E5E7" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Add some delicious items to get started
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Order</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{cart.vendor.name}</Text>
          <Text style={styles.restaurantAddress}>{cart.vendor.address}</Text>
        </View>

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({cart.items.length})</Text>
          {cart.items.map((item, index) => (
            <View key={`${item.menu_item.id}-${index}`} style={styles.cartItem}>
              <Image source={{ uri: item.menu_item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.menu_item.name}</Text>
                {item.customizations.length > 0 && (
                  <Text style={styles.customizations}>
                    {item.customizations.map(c => c.option_name).join(', ')}
                  </Text>
                )}
                {item.special_instructions && (
                  <Text style={styles.specialInstructions}>
                    Note: {item.special_instructions}
                  </Text>
                )}
                <Text style={styles.itemPrice}>${item.total_price.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(
                    item.menu_item.id,
                    item.customizations,
                    item.quantity - 1
                  )}
                >
                  <Minus size={16} color="#FF6B35" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(
                    item.menu_item.id,
                    item.customizations,
                    item.quantity + 1
                  )}
                >
                  <Plus size={16} color="#FF6B35" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.menu_item.id, item.customizations)}
              >
                <Trash2 size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <View style={styles.promoHeader}>
            <Tag size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Promo Code</Text>
          </View>
          {cart.promo_code ? (
            <View style={styles.appliedPromo}>
              <Text style={styles.appliedPromoText}>{cart.promo_code}</Text>
              <Text style={styles.promoDiscount}>-${cart.discount_amount.toFixed(2)}</Text>
              <TouchableOpacity onPress={handleRemovePromoCode}>
                <X size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : showPromoInput ? (
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                value={promoCodeInput}
                onChangeText={setPromoCodeInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromoCode}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPromoInput(false)}>
                <X size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPromoButton}
              onPress={() => setShowPromoInput(true)}
            >
              <Text style={styles.addPromoText}>Add promo code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => console.log('Change address - Coming soon')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          {checkoutData.deliveryAddress ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{checkoutData.deliveryAddress.name}</Text>
              <Text style={styles.addressText}>{checkoutData.deliveryAddress.address}</Text>
              <Text style={styles.addressPhone}>{checkoutData.deliveryAddress.phone}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => console.log('Add address - Coming soon')}
            >
              <Text style={styles.addAddressText}>Add delivery address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity onPress={() => console.log('Change payment method - Coming soon')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          {checkoutData.paymentMethod ? (
            <View style={styles.paymentCard}>
              <Text style={styles.paymentType}>
                {checkoutData.paymentMethod.type === 'card' ? 'Credit Card' : 'Mobile Money'}
              </Text>
              <Text style={styles.paymentDetails}>
                {checkoutData.paymentMethod.type === 'card'
                  ? `**** ${checkoutData.paymentMethod.last_four}`
                  : checkoutData.paymentMethod.phone_number}
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addPaymentButton}
              onPress={() => console.log('Add payment method - Coming soon')}
            >
              <Text style={styles.addPaymentText}>Add payment method</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Add any special instructions for the restaurant..."
            value={checkoutData.specialInstructions}
            onChangeText={(text) => setCheckoutData(prev => ({ ...prev, specialInstructions: text }))}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${cart.delivery_fee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>${cart.service_fee.toFixed(2)}</Text>
          </View>
          {cart.discount_amount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>-${cart.discount_amount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${cart.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Estimated Delivery Time */}
        <View style={styles.deliveryTimeCard}>
          <Clock size={20} color="#FF6B35" />
          <Text style={styles.deliveryTimeText}>Estimated delivery: 25-35 mins</Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, isCheckingOut && styles.checkoutButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.checkoutButtonText}>
              Place Order • ${cart.total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  scrollView: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  restaurantHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  customizations: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  specialInstructions: {
    fontSize: 12,
    color: '#FF6B35',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  appliedPromoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  promoDiscount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginRight: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addPromoButton: {
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addPromoText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '500',
  },
  addressCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addAddressText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  paymentCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  addPaymentButton: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addPaymentText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  discountLabel: {
    color: '#34C759',
  },
  discountValue: {
    color: '#34C759',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  deliveryTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  deliveryTimeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    marginLeft: 8,
  },
  checkoutContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});