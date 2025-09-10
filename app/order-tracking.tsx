import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
  Truck,
  ChefHat,
  Package,
} from 'lucide-react-native';

interface OrderStatus {
  id: string;
  title: string;
  description: string;
  time?: string;
  completed: boolean;
  active: boolean;
}

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const progressAnimation = new Animated.Value(0.5);

  // Fetch order tracking data
  const { data: trackingData, isLoading, refetch } = trpc.orders.track.useQuery(
    { order_id: orderId || 'demo_order' },
    {
      enabled: !!orderId,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getEstimatedTime = () => {
    if (!trackingData?.estimated_delivery_time) return 'Calculating...';
    
    const estimatedTime = new Date(trackingData.estimated_delivery_time);
    const now = new Date();
    const diffMinutes = Math.max(0, Math.floor((estimatedTime.getTime() - now.getTime()) / (1000 * 60)));
    
    if (diffMinutes === 0) return 'Arriving now';
    if (diffMinutes < 60) return `${diffMinutes} mins`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getProgressValue = () => {
    if (!trackingData) return 0.2;
    
    const statusProgress: { [key: string]: number } = {
      'pending': 0.2,
      'confirmed': 0.4,
      'preparing': 0.6,
      'ready': 0.7,
      'out_for_delivery': 0.9,
      'delivered': 1.0,
    };
    
    return statusProgress[trackingData.status] || 0.2;
  };

  useEffect(() => {
    if (trackingData) {
      // Animate progress based on order status
      Animated.timing(progressAnimation, {
        toValue: getProgressValue(),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [trackingData]);

  const getStatusIcon = (statusKey: string, isCompleted: boolean, isActive: boolean) => {
    if (isCompleted) {
      return <CheckCircle size={24} color="#34C759" />;
    }
    
    if (isActive) {
      switch (statusKey) {
        case 'preparing':
          return <ChefHat size={24} color="#FF6B35" />;
        case 'out_for_delivery':
          return <Truck size={24} color="#FF6B35" />;
        default:
          return <Package size={24} color="#FF6B35" />;
      }
    }
    
    return (
      <View style={styles.inactiveIcon}>
        <View style={styles.iconDot} />
      </View>
    );
  };

  const getOrderStatuses = () => {
    const currentStatus = trackingData?.status || 'pending';
    
    const statuses = [
      { key: 'pending', title: 'Order Placed', description: 'Your order has been received' },
      { key: 'confirmed', title: 'Order Confirmed', description: 'Restaurant confirmed your order' },
      { key: 'preparing', title: 'Preparing Food', description: 'Your delicious meal is being prepared' },
      { key: 'ready', title: 'Ready for Pickup', description: 'Order is ready and waiting for rider' },
      { key: 'out_for_delivery', title: 'Out for Delivery', description: 'Your order is on the way' },
      { key: 'delivered', title: 'Delivered', description: 'Enjoy your meal!' },
    ];
    
    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    
    return statuses.map((status, index) => ({
      ...status,
      completed: index < currentIndex,
      active: index === currentIndex,
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trackingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatuses = getOrderStatuses();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Order Info Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop&crop=center' }}
              style={styles.restaurantImage}
            />
            <View style={styles.orderInfo}>
              <Text style={styles.restaurantName}>{trackingData.vendor.name}</Text>
              <Text style={styles.orderNumber}>Order #{trackingData.order_id.slice(-8)}</Text>
              <Text style={styles.orderTime}>
                Status: {trackingData.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          
          {/* Estimated Time */}
          <View style={styles.estimatedTimeCard}>
            <Clock size={20} color="#FF6B35" />
            <Text style={styles.estimatedTimeText}>
              Estimated delivery: {getEstimatedTime()}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Order Status Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          {orderStatuses.map((status, index) => {
            const matchingUpdate = trackingData.tracking_updates?.find(
              update => update.status === status.key
            );
            
            return (
              <View key={status.key} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  {getStatusIcon(status.key, status.completed, status.active)}
                  {index < orderStatuses.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        status.completed && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      status.active && styles.timelineTitleActive,
                      status.completed && styles.timelineTitleCompleted,
                    ]}
                  >
                    {status.title}
                  </Text>
                  <Text style={styles.timelineDescription}>{status.description}</Text>
                  {matchingUpdate && (
                    <Text style={styles.timelineTime}>
                      {new Date(matchingUpdate.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MapPin size={20} color="#FF6B35" />
            <Text style={styles.addressTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressText}>
            {trackingData.delivery_address.name}{'\n'}
            {trackingData.delivery_address.address}{'\n'}
            {trackingData.delivery_address.city}
          </Text>
        </View>

        {/* Rider Info */}
        {trackingData.rider && (
          <View style={styles.riderCard}>
            <View style={styles.riderHeader}>
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{trackingData.rider.name}</Text>
                <Text style={styles.riderRating}>⭐ {trackingData.rider.rating}</Text>
              </View>
              <View style={styles.riderActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Phone size={20} color="#FF6B35" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={20} color="#FF6B35" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Contact Actions */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={20} color="#FF6B35" />
              <Text style={styles.contactButtonText}>Call Restaurant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <MessageCircle size={20} color="#FF6B35" />
              <Text style={styles.contactButtonText}>Chat Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  orderCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  estimatedTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  estimatedTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  timelineContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  inactiveIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C7C7CC',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E5E7',
    marginTop: 8,
  },
  timelineLineCompleted: {
    backgroundColor: '#34C759',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  timelineTitleActive: {
    color: '#FF6B35',
  },
  timelineTitleCompleted: {
    color: '#1C1C1E',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  addressCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  itemsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  contactCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  riderCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  riderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  riderRating: {
    fontSize: 14,
    color: '#8E8E93',
  },
  riderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});