import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react-native";
import { useVendorBySlug } from "@/hooks/use-vendors";
import { useCart } from "@/providers/cart-provider";



const mockMenuItems = [
  {
    id: "1",
    name: "Jollof Rice with Chicken",
    description: "Aromatic jollof rice served with grilled chicken and plantain",
    price: 25.50,
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop",
    category: "Main Dishes",
    available: true,
  },
  {
    id: "2",
    name: "Kelewele",
    description: "Spiced fried plantain cubes with ginger and pepper",
    price: 8.00,
    image: "https://images.unsplash.com/photo-1587334274328-64186a80aeee?w=300&h=200&fit=crop",
    category: "Sides",
    available: true,
  },
  {
    id: "3",
    name: "Banku with Tilapia",
    description: "Traditional banku served with grilled tilapia and pepper sauce",
    price: 32.00,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
    category: "Main Dishes",
    available: true,
  },
];

export default function RestaurantScreen() {
  const { slug } = useLocalSearchParams();
  const [localCart, setLocalCart] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const { data: vendor, isLoading } = useVendorBySlug(slug as string);
  const { addToCart: addToCartProvider, cart, itemCount } = useCart();

  const categories = ["All", "Main Dishes", "Sides", "Drinks", "Desserts"];

  const addToCart = async (itemId: string) => {
    if (!vendor) return;
    
    const menuItem = mockMenuItems.find(item => item.id === itemId);
    if (!menuItem) return;
    
    try {
      // Convert mock menu item to proper format
      const menuItemForCart = {
        id: menuItem.id,
        vendor_id: vendor.id,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        image: menuItem.image,
        category: menuItem.category,
        available: menuItem.available,
        created_at: new Date().toISOString(),
      };
      
      await addToCartProvider(vendor, menuItemForCart, 1);
      console.log('✅ Added to cart:', menuItem.name);
      
      // Update local cart for UI
      setLocalCart(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
    }
  };

  const removeFromCart = (itemId: string) => {
    setLocalCart(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  const getCartTotal = () => {
    return Object.entries(localCart).reduce((total, [itemId, quantity]) => {
      const item = mockMenuItems.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(localCart).reduce((total, quantity) => total + quantity, 0);
  };

  const renderMenuItem = ({ item }: { item: any }) => (
    <View style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>GH₵{item.price.toFixed(2)}</Text>
          <View style={styles.quantityControls}>
            {localCart[item.id] > 0 && (
              <>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Minus size={16} color="#FF6B35" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{localCart[item.id]}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => addToCart(item.id)}
            >
              <Plus size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCategoryTab = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item && styles.categoryTabActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.categoryTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Restaurant not found</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.backToHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: vendor.logo }}
          style={styles.headerImage}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.headerGradient}
        />
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{vendor.name}</Text>
          <Text style={styles.restaurantCuisine}>{vendor.cuisine_type}</Text>
          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.metaText}>{vendor.rating || "4.5"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="white" />
              <Text style={styles.metaText}>25-35 min</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={16} color="white" />
              <Text style={styles.metaText}>2.5 km</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        style={styles.categoriesContainer}
      />

      {/* Menu Items */}
      <FlatList
        data={mockMenuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Button */}
      {(getCartItemCount() > 0 || itemCount > 0) && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <LinearGradient
            colors={["#FF6B35", "#FF8E53"]}
            style={styles.cartGradient}
          >
            <View style={styles.cartContent}>
              <View style={styles.cartInfo}>
                <ShoppingBag size={20} color="white" />
                <Text style={styles.cartCount}>{itemCount || getCartItemCount()}</Text>
              </View>
              <Text style={styles.cartText}>View Cart</Text>
              <Text style={styles.cartTotal}>GH₵{cart?.total?.toFixed(2) || getCartTotal().toFixed(2)}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerContainer: {
    height: 250,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    marginBottom: 12,
  },
  restaurantMeta: {
    flexDirection: "row",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  categoriesContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
  },
  categoryTabActive: {
    backgroundColor: "#FF6B35",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  categoryTextActive: {
    color: "white",
  },
  menuList: {
    padding: 20,
    gap: 16,
  },
  menuItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: 100,
    height: 100,
  },
  menuItemContent: {
    flex: 1,
    padding: 16,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  menuItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF3F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  cartGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cartContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  cartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToHomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});