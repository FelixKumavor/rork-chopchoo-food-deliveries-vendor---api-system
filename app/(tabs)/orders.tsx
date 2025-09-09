import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Star } from "lucide-react-native";

const mockOrders = [
  {
    id: "1",
    restaurant: "Mama's Kitchen",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop&crop=center",
    items: ["Jollof Rice", "Grilled Chicken", "Kelewele"],
    total: "GH₵45.50",
    status: "delivered",
    date: "2024-01-15",
    rating: 4.5,
  },
  {
    id: "2",
    restaurant: "Pizza Palace",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop&crop=center",
    items: ["Margherita Pizza", "Coca Cola"],
    total: "GH₵38.00",
    status: "on_way",
    date: "2024-01-15",
    rating: null,
  },
  {
    id: "3",
    restaurant: "Burger Spot",
    logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop&crop=center",
    items: ["Classic Burger", "Fries", "Milkshake"],
    total: "GH₵52.75",
    status: "preparing",
    date: "2024-01-14",
    rating: null,
  },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#4CAF50";
      case "on_way":
        return "#FF9800";
      case "preparing":
        return "#2196F3";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "on_way":
        return "On the way";
      case "preparing":
        return "Preparing";
      default:
        return "Unknown";
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: item.logo }} style={styles.restaurantLogo} />
        <View style={styles.orderInfo}>
          <Text style={styles.restaurantName}>{item.restaurant}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemsText}>
          {item.items.join(", ")}
        </Text>
        <Text style={styles.totalText}>{item.total}</Text>
      </View>

      {item.status === "delivered" && item.rating && (
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>You rated {item.rating}/5</Text>
        </View>
      )}

      <View style={styles.orderActions}>
        {item.status === "delivered" ? (
          <TouchableOpacity style={styles.reorderButton}>
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.trackButton}>
            <MapPin size={16} color="#FF6B35" />
            <Text style={styles.trackText}>Track Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
      </View>

      <FlatList
        data={mockOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
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
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
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
});