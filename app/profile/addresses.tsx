import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
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
import { useAuth } from "@/providers/auth-provider";
import { trpc } from "@/lib/trpc";

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
  phone?: string;
  instructions?: string;
}

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Get addresses data
  const addressesQuery = trpc.addresses.get.useQuery(
    { userId: user?.id || "1" },
    { enabled: !!user?.id }
  );

  // Delete address mutation
  const deleteAddressMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Address deleted successfully");
      addressesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Update address mutation (for setting default)
  const updateAddressMutation = trpc.addresses.update.useMutation({
    onSuccess: () => {
      addressesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const addresses: Address[] = (addressesQuery.data?.addresses || []).map(addr => ({
    ...addr,
    type: addr.type as "home" | "work" | "other"
  }));

  const handleAddAddress = () => {
    // TODO: Navigate to add address screen with map picker
    Alert.alert("Add Address", "Address creation with map picker will be implemented");
  };

  const handleEditAddress = (addressId: string) => {
    // TODO: Navigate to edit address screen
    Alert.alert("Edit Address", "Address editing will be implemented");
  };

  const setDefaultAddress = (addressId: string) => {
    if (!user?.id) return;
    
    updateAddressMutation.mutate({
      addressId,
      userId: user.id,
      isDefault: true,
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAddressMutation.mutate({
              addressId,
              userId: user.id,
            });
          },
        },
      ]
    );
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
        {addressesQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : addresses.length > 0 ? (
          <View style={styles.addressesList}>
            <FlatList
              data={addresses}
              renderItem={renderAddress}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No Addresses</Text>
            <Text style={styles.emptySubtitle}>
              Add your first delivery address to get started
            </Text>
          </View>
        )}
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
    marginHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});