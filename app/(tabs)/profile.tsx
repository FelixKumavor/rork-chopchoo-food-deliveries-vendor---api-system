import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/providers/auth-provider";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: User,
      title: "Personal Information",
      subtitle: "Update your details",
      onPress: () => router.push("/(tabs)/../profile/personal-info" as any)
    },
    {
      icon: MapPin,
      title: "Addresses",
      subtitle: "Manage delivery addresses",
      onPress: () => router.push("/(tabs)/../profile/addresses" as any)
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      subtitle: "Cards and mobile money",
      onPress: () => router.push("/(tabs)/../profile/payment-methods" as any)
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Order updates and offers",
      onPress: () => router.push("/(tabs)/../profile/notifications" as any)
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help with your orders",
      onPress: () => router.push("/(tabs)/../profile/help" as any)
    },
    {
      icon: Settings,
      title: "Settings",
      subtitle: "App preferences",
      onPress: () => router.push("/(tabs)/../profile/settings" as any)
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuIcon}>
        <item.icon size={20} color="#FF6B35" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Felix Kumavor"}</Text>
            <Text style={styles.userEmail}>{user?.email || "katekobla900@gmail.com"}</Text>
            <Text style={styles.userPhone}>{user?.phone || "+233 20 747 7013"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push("/(tabs)/../profile/personal-info" as any)}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Vendor Section */}
        <TouchableOpacity
          style={styles.vendorCard}
          onPress={() => router.push("/vendor-signup")}
        >
          <View style={styles.vendorContent}>
            <Text style={styles.vendorTitle}>Become a Partner</Text>
            <Text style={styles.vendorSubtitle}>
              Start earning with your restaurant
            </Text>
          </View>
          <ChevronRight size={20} color="#4ECDC4" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#8E8E93",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  editText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  menuContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFC",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#4ECDC4",
  },
  vendorContent: {
    flex: 1,
  },
  vendorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 4,
  },
  vendorSubtitle: {
    fontSize: 14,
    color: "#44A08D",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  version: {
    fontSize: 14,
    color: "#8E8E93",
  },
});