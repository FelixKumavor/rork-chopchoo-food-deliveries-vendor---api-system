import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Star, ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle, ChefHat, Package, Truck } from "lucide-react-native";
import { useCart } from "@/providers/cart-provider";
import { trpc } from '@/lib/trpc';
import { router } from "expo-router";



export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { cart, updateQuantity, removeFromCart, itemCount } = useCart();
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders data
  const { data: ordersData, isLoading, refetch } = trpc.orders.get.useQuery(
    {
      customer_id: 'demo_customer_123',
      limit: 20,
      offset: 0,
    },
    {
      enabled: activeTab === 'orders',
      refetchInterval: 30000, // Refetch every 30 seconds for ongoing orders
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#8E8E93";
      case "confirmed":
        return "#34C759";
      case "preparing":
        return "#FF6B35";
      case "ready":
        return "#FF9800";
      case "out_for_delivery":
        return "#007AFF";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Placed";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "out_for_delivery":
        return "On the way";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const formatOrderTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const handleQuantityChange = async (menuItemId: string, customizations: any[], newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        await removeFromCart(menuItemId, customizations);
      } else {
        await updateQuantity(menuItemId, customizations, newQuantity);
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const handleRemoveItem = async (menuItemId: string, customizations: any[]) => {
    try {
      await removeFromCart(menuItemId, customizations);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/order-tracking?orderId=${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Image 
          source={{ uri: item.vendor?.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' }} 
          style={styles.orderRestaurantLogo} 
        />
        <View style={styles.orderInfo}>
          <Text style={styles.orderRestaurantName}>{item.vendor?.name || 'Restaurant'}</Text>
          <Text style={styles.orderDate}>{formatOrderTime(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemsText}>
          {item.items.map((orderItem: any) => `${orderItem.quantity}x ${orderItem.menu_item?.name}`).join(", ")}
        </Text>
        <Text style={styles.totalText}>GH₵{item.total.toFixed(2)}</Text>
      </View>

      {item.status === "delivered" && (
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>Rate this order</Text>
        </View>
      )}

      <View style={styles.orderActions}>
        {item.status === "delivered" ? (
          <TouchableOpacity style={styles.reorderButton}>
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => router.push(`/order-tracking?orderId=${item.id}`)}
          >
            <MapPin size={16} color="#FF6B35" />
            <Text style={styles.trackText}>Track Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCartContent = () => {
    if (!cart || cart.items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ShoppingCart size={60} color="#E5E5E7" />
          <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
          <Text style={styles.emptyStateSubtitle}>
            Add some delicious items to get started
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.cartContent} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantCard}>
          <Image source={{ uri: cart.vendor.logo }} style={styles.restaurantLogo} />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{cart.vendor.name}</Text>
            <Text style={styles.restaurantAddress}>{cart.vendor.address}</Text>
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.cartItemsSection}>
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
                <Trash2 size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
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

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.checkoutButtonText}>
            Proceed to Checkout • ${cart.total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cart' && styles.activeTab]}
            onPress={() => setActiveTab('cart')}
          >
            <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
              Cart {itemCount > 0 && `(${itemCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'cart' ? (
        renderCartContent()
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : (
        <FlatList
          data={ordersData?.orders || []}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={60} color="#E5E5E7" />
              <Text style={styles.emptyStateTitle}>No orders yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Your order history will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FF6B35',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cartContent: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cartItemsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemImage: {
    width: 50,
    height: 50,
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
    fontSize: 12,
    color: '#8E8E93',
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
    marginRight: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    padding: 4,
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
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
  checkoutButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ordersList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  orderRestaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderRestaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  orderDetails: {
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reorderButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reorderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF3F0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  trackText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});