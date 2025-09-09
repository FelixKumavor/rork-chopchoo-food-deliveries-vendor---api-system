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
} from 'react-native';
import { router } from 'expo-router';
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
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([
    {
      id: '1',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed by the restaurant',
      time: '2:30 PM',
      completed: true,
      active: false,
    },
    {
      id: '2',
      title: 'Preparing Your Food',
      description: 'The restaurant is preparing your delicious meal',
      time: '2:35 PM',
      completed: true,
      active: true,
    },
    {
      id: '3',
      title: 'Out for Delivery',
      description: 'Your order is on the way to your location',
      completed: false,
      active: false,
    },
    {
      id: '4',
      title: 'Delivered',
      description: 'Enjoy your meal!',
      completed: false,
      active: false,
    },
  ]);

  const [estimatedTime, setEstimatedTime] = useState(25);
  const progressAnimation = new Animated.Value(0.5);

  useEffect(() => {
    // Simulate order progress
    const timer = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    // Animate progress
    Animated.timing(progressAnimation, {
      toValue: 0.7,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: OrderStatus, index: number) => {
    if (status.completed) {
      return <CheckCircle size={24} color="#34C759" />;
    }
    
    if (status.active) {
      switch (index) {
        case 1:
          return <ChefHat size={24} color="#FF6B35" />;
        case 2:
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop&crop=center' }}
              style={styles.restaurantImage}
            />
            <View style={styles.orderInfo}>
              <Text style={styles.restaurantName}>Mama's Kitchen</Text>
              <Text style={styles.orderNumber}>Order #12345</Text>
              <Text style={styles.orderTime}>Placed at 2:30 PM</Text>
            </View>
          </View>
          
          {/* Estimated Time */}
          <View style={styles.estimatedTimeCard}>
            <Clock size={20} color="#FF6B35" />
            <Text style={styles.estimatedTimeText}>
              Estimated delivery: {estimatedTime} mins
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
          {orderStatuses.map((status, index) => (
            <View key={status.id} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                {getStatusIcon(status, index)}
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
                {status.time && (
                  <Text style={styles.timelineTime}>{status.time}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MapPin size={20} color="#FF6B35" />
            <Text style={styles.addressTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressText}>
            123 Main Street, Apt 4B{'\n'}
            New York, NY 10001
          </Text>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.orderItem}>
            <Text style={styles.itemQuantity}>2x</Text>
            <Text style={styles.itemName}>Jollof Rice with Grilled Chicken</Text>
            <Text style={styles.itemPrice}>$24.00</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.itemQuantity}>1x</Text>
            <Text style={styles.itemName}>Kelewele (Spiced Plantain)</Text>
            <Text style={styles.itemPrice}>$8.50</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$35.50</Text>
          </View>
        </View>

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
});