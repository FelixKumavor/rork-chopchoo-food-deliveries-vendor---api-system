import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter, Star, Clock } from "lucide-react-native";
import { router } from "expo-router";
import { useVendors } from "@/hooks/use-vendors";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { data: vendors = [] } = useVendors();
  const insets = useSafeAreaInsets();

  const filters = [
    { id: "all", name: "All" },
    { id: "ghanaian", name: "Ghanaian" },
    { id: "fast-food", name: "Fast Food" },
    { id: "chinese", name: "Chinese" },
    { id: "pizza", name: "Pizza" },
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         vendor.cuisine_type.toLowerCase().includes(selectedFilter.replace("-", " "));
    return matchesSearch && matchesFilter;
  });

  const renderVendorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vendorItem}
      onPress={() => router.push(`/restaurant/${item.slug}`)}
    >
      <Image source={{ uri: item.logo }} style={styles.vendorLogo} />
      <View style={styles.vendorDetails}>
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

  const renderFilterItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === item.id && styles.filterChipActive,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.id && styles.filterTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, cuisines, dishes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <FlatList
        data={filters}
        renderItem={renderFilterItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
      />

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {filteredVendors.length} restaurants found
        </Text>
        
        <FlatList
          data={filteredVendors}
          renderItem={renderVendorItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.vendorsList}
        />
      </View>
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
  filterButton: {
    padding: 4,
  },
  filtersList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  filterChipActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  filterTextActive: {
    color: "white",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 16,
  },
  vendorsList: {
    gap: 16,
  },
  vendorItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  vendorDetails: {
    flex: 1,
    marginLeft: 16,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  vendorCuisine: {
    fontSize: 14,
    color: "#8E8E93",
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
    color: "#333",
    fontWeight: "600",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#8E8E93",
  },
});