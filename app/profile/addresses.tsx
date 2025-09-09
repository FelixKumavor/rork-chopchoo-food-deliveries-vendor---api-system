import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Home, 
  Building, 
  MoreHorizontal,
  Star,
} from "lucide-react-native";

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Home",
      address: "123 Main Street, East Legon",
      city: "Accra",
      type: "home",
      isDefault: true,
      coordinates: { latitude: 5.6037, longitude: -0.1870 },
    },
    {
      id: "2",
      name: "Office",
      address: "456 Business District, Airport City",
      city: "Accra",
      type: "work",
      isDefault: false,
      coordinates: { latitude: 5.6037, longitude: -0.1870 },
    },
  ]);

  const handleAddAddress = () => {
    // TODO: Navigate to add address screen
    console.log("Add new address");
  };

  const handleEditAddress = (addressId: string) => {
    // TODO: Navigate to edit address screen
    console.log("Edit address:", addressId);
  };

  const setDefaultAddress = (addressId: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
  };

  const deleteAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    console.log("Delete address:", addressId);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home size={20} color="#FF6B35" />;
      case "work":
        return <Building size={20} color="#FF6B35" />;
      default:
        return <MapPin size={20} color="#FF6B35" />;
    }
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressIcon}>
          {getAddressIcon(item.type)}
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.addressTitleRow}>
            <Text style={styles.addressName}>{item.name}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText}>{item.address}</Text>
          <Text style={styles.cityText}>{item.city}</Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleEditAddress(item.id)}
        >
          <MoreHorizontal size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDefaultAddress(item.id)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditAddress(item.id)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Delivery Addresses",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: "#FAFAFA" },
          headerTitleStyle: { color: "#333", fontWeight: "600" },
        }}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Manage your delivery addresses for faster checkout
          </Text>
        </View>

        {/* Add New Address Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Plus size={24} color="#FF6B35" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>

        {/* Addresses List */}
        <View style={styles.addressesList}>
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
    marginLeft: 12,
  },
  addressesList: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  addressCard: {
    padding: 16,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#B8860B",
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
    lineHeight: 20,
  },
  cityText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  moreButton: {
    padding: 4,
  },
  addressActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  editButton: {
    borderColor: "#FF6B35",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF6B35",
  },
  separator: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginHorizontal: 16,
  },
});