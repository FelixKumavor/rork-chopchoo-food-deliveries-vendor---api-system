import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Store, Users, TrendingUp, DollarSign, Plus } from "lucide-react-native";
import { router } from "expo-router";

export default function VendorsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Vendor Portal</Text>
          <Text style={styles.subtitle}>Grow your business with Chopchoo</Text>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={["#FF6B35", "#FF8E53"]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Partner with Chopchoo</Text>
            <Text style={styles.heroSubtitle}>
              Join thousands of restaurants earning more with our platform
            </Text>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push("/vendor-signup")}
            >
              <Plus size={20} color="#FF6B35" />
              <Text style={styles.signupText}>Start Your Journey</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Chopchoo?</Text>
          
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: "#E3F2FD" }]}>
                <Users size={24} color="#2196F3" />
              </View>
              <Text style={styles.benefitTitle}>Reach More Customers</Text>
              <Text style={styles.benefitText}>
                Access thousands of hungry customers in your area
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: "#E8F5E8" }]}>
                <TrendingUp size={24} color="#4CAF50" />
              </View>
              <Text style={styles.benefitTitle}>Increase Sales</Text>
              <Text style={styles.benefitText}>
                Boost your revenue with our marketing tools
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: "#FFF3E0" }]}>
                <DollarSign size={24} color="#FF9800" />
              </View>
              <Text style={styles.benefitTitle}>Easy Payments</Text>
              <Text style={styles.benefitText}>
                Get paid weekly with transparent reporting
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: "#FCE4EC" }]}>
                <Store size={24} color="#E91E63" />
              </View>
              <Text style={styles.benefitTitle}>Manage Orders</Text>
              <Text style={styles.benefitText}>
                Easy-to-use dashboard for order management
              </Text>
            </View>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sign Up</Text>
                <Text style={styles.stepText}>
                  Complete your restaurant profile and menu
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Approved</Text>
                <Text style={styles.stepText}>
                  Our team reviews and approves your application
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start Earning</Text>
                <Text style={styles.stepText}>
                  Receive orders and grow your business
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/vendor-signup")}
        >
          <LinearGradient
            colors={["#4ECDC4", "#44A08D"]}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Become a Partner Today</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 24,
  },
  signupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  signupText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  benefitCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 20,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  ctaButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});