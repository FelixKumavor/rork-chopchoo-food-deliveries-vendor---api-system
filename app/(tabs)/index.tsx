import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Search, MapPin, Star, Clock, Filter, Wifi, WifiOff } from "lucide-react-native";
import { router } from "expo-router";
import { useVendors } from "@/hooks/use-vendors";
import { trpc } from "@/lib/trpc";

const categories = [
  { id: "1", name: "Ghanaian", emoji: "🍛", color: "#FF6B35" },
  { id: "2", name: "Fast Food", emoji: "🍔", color: "#4ECDC4" },
  { id: "3", name: "Chinese", emoji: "🥢", color: "#45B7D1" },
  { id: "4", name: "Pizza", emoji: "🍕", color: "#96CEB4" },
  { id: "5", name: "Desserts", emoji: "🍰", color: "#FFEAA7" },
  { id: "6", name: "Drinks", emoji: "🥤", color: "#DDA0DD" },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { data: vendors = [], isLoading } = useVendors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  console.log('🏠 HomeScreen render - isLoading:', isLoading, 'vendors count:', vendors.length);
  console.log('🏠 HomeScreen vendors data:', vendors);
  
  // Test tRPC connectivity with error handling
  const connectivityTest = trpc.example.hi.useQuery(
    { name: 'ChopChoo' },
    {
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    }
  );
  
  // Fallback to inline procedure if main one fails
  const fallbackTest = trpc.example.hiInline.useQuery(
    { name: 'ChopChoo Fallback' },
    {
      enabled: !!connectivityTest.error, // Only run if main test fails
      retry: 1,
      retryDelay: 500,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    }
  );
  
  // Monitor connection status
  useEffect(() => {
    if (connectivityTest.data) {
      console.log('✅ tRPC connection successful:', connectivityTest.data);
      setConnectionStatus('connected');
    } else if (fallbackTest.data) {
      console.log('✅ tRPC fallback connection successful:', fallbackTest.data);
      setConnectionStatus('connected');
    } else if (connectivityTest.error && fallbackTest.error) {
      console.error('❌ Both tRPC connections failed');
      console.error('❌ Main error:', connectivityTest.error?.message || connectivityTest.error);
      console.error('❌ Fallback error:', fallbackTest.error?.message || fallbackTest.error);
      setConnectionStatus('error');
    } else if (connectivityTest.error && !fallbackTest.error) {
      console.log('🔄 Main tRPC failed, trying fallback...');
      // Keep checking status, fallback might still succeed
    }
  }, [connectivityTest.data, connectivityTest.error, fallbackTest.data, fallbackTest.error]);
  
  // Add error boundary for debugging
  useEffect(() => {
    console.log('🏠 HomeScreen mounted successfully');
    
    // Test basic API connectivity
    const testConnectivity = async () => {
      try {
        const baseUrl = 'https://3wugogu368idzatsalgh3.rork.live';
        console.log('Testing connectivity to:', baseUrl);
        
        const response = await fetch(`${baseUrl}/api/test`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API test response status:', response.status);
        const data = await response.json();
        console.log('API test response data:', data);
        
        if (response.ok) {
          console.log('✅ Basic API connectivity successful');
        } else {
          console.error('❌ API test failed:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Connectivity test failed:', error);
      }
    };
    
    testConnectivity();
    
    return () => {
      console.log('🏠 HomeScreen unmounted');
    };
  }, []);

  const renderVendorCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.vendorCard, { width: width * 0.7 }]}
      onPress={() => router.push(`/restaurant/${item.slug}`)}
    >
      <Image source={{ uri: item.logo }} style={styles.vendorImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.vendorGradient}
      />
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorCuisine}>{item.cuisine_type}</Text>
        <View style={styles.vendorMeta}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{item.rating || "4.5"}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Clock size={14} color="#8E8E93" />
            <Text style={styles.deliveryTime}>25-35 min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => console.log('Category selected:', item.name)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={[styles.connectionStatus, 
          connectionStatus === 'connected' ? styles.connected : 
          connectionStatus === 'error' ? styles.disconnected : styles.checking
        ]}>
          {connectionStatus === 'connected' ? (
            <>
              <Wifi size={16} color="#10B981" />
              <Text style={[styles.connectionText, { color: '#10B981' }]}>Connected</Text>
            </>
          ) : connectionStatus === 'error' ? (
            <>
              <WifiOff size={16} color="#EF4444" />
              <Text style={[styles.connectionText, { color: '#EF4444' }]}>Connection Error</Text>
            </>
          ) : (
            <Text style={[styles.connectionText, { color: '#F59E0B' }]}>Checking connection...</Text>
          )}
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#FF6B35" />
            <View>
              <Text style={styles.deliverTo}>Deliver to</Text>
              <Text style={styles.address}>Accra, Ghana</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => console.log('Filter pressed')}
          >
            <Filter size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants or dishes"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* Promo Banner */}
        <LinearGradient
          colors={["#FF6B35", "#FF8E53"]}
          style={styles.promoBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Free Delivery</Text>
            <Text style={styles.promoSubtitle}>On orders above GH₵50</Text>
          </View>
          <Text style={styles.promoEmoji}>🚚</Text>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Restaurants</Text>
            <TouchableOpacity onPress={() => console.log('See all restaurants')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
          ) : vendors.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>No restaurants available</Text>
            </View>
          ) : (
            <FlatList
              data={vendors}
              renderItem={renderVendorCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vendorsList}
            />
          )}
        </View>

        {/* Vendor Signup CTA */}
        <TouchableOpacity
          style={styles.vendorCTA}
          onPress={() => router.push("/vendor-signup")}
        >
          <LinearGradient
            colors={["#4ECDC4", "#44A08D"]}
            style={styles.vendorCTAGradient}
          >
            <Text style={styles.vendorCTATitle}>Partner with us</Text>
            <Text style={styles.vendorCTASubtitle}>Start earning with Chopchoo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    gap: 8,
  },
  connected: {
    backgroundColor: "#DCFCE7",
  },
  disconnected: {
    backgroundColor: "#FEE2E2",
  },
  checking: {
    backgroundColor: "#FEF3C7",
  },
  connectionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliverTo: {
    fontSize: 12,
    color: "#8E8E93",
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  promoBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  promoSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    marginTop: 4,
  },
  promoEmoji: {
    fontSize: 32,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAll: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  vendorsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  vendorCard: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  vendorImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  vendorGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  vendorInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  vendorCuisine: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    marginBottom: 8,
  },
  vendorMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  vendorCTA: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  vendorCTAGradient: {
    padding: 24,
    alignItems: "center",
  },
  vendorCTATitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  vendorCTASubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
});