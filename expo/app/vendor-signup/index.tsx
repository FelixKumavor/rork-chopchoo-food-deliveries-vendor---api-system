import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Store, User, MapPin, Clock } from "lucide-react-native";
import { router } from "expo-router";
import { trpc } from '@/lib/trpc';


const steps = [
  { id: 1, title: "Business Info", icon: Store },
  { id: 2, title: "Owner Details", icon: User },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Operating Hours", icon: Clock },
];

export default function VendorSignupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // tRPC mutation for creating vendor
  const createVendorMutation = trpc.vendors.create.useMutation();
  const [formData, setFormData] = useState({
    restaurantName: "",
    businessType: "",
    cuisine: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    deliveryRadius: "",
    openTime: "",
    closeTime: "",
    operatingDays: [] as string[],
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.restaurantName.trim()) {
          Alert.alert("Error", "Restaurant name is required");
          return false;
        }
        if (!formData.businessType.trim()) {
          Alert.alert("Error", "Business type is required");
          return false;
        }
        if (!formData.cuisine.trim()) {
          Alert.alert("Error", "Cuisine type is required");
          return false;
        }
        break;
      case 2:
        if (!formData.ownerName.trim()) {
          Alert.alert("Error", "Owner name is required");
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          Alert.alert("Error", "Valid email address is required");
          return false;
        }
        if (!formData.phone.trim()) {
          Alert.alert("Error", "Phone number is required");
          return false;
        }
        break;
      case 3:
        if (!formData.address.trim()) {
          Alert.alert("Error", "Address is required");
          return false;
        }
        if (!formData.city.trim()) {
          Alert.alert("Error", "City is required");
          return false;
        }
        if (!formData.deliveryRadius.trim() || isNaN(Number(formData.deliveryRadius))) {
          Alert.alert("Error", "Valid delivery radius is required");
          return false;
        }
        break;
      case 4:
        if (!formData.openTime.trim()) {
          Alert.alert("Error", "Opening time is required");
          return false;
        }
        if (!formData.closeTime.trim()) {
          Alert.alert("Error", "Closing time is required");
          return false;
        }
        if (formData.operatingDays.length === 0) {
          Alert.alert("Error", "Please select at least one operating day");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('🚀 Submitting vendor application...', formData);
      
      // Validate all required fields one more time
      if (!formData.restaurantName.trim() || !formData.businessType.trim() || 
          !formData.cuisine.trim() || !formData.ownerName.trim() || 
          !formData.email.trim() || !formData.phone.trim() || 
          !formData.address.trim() || !formData.city.trim() || 
          !formData.deliveryRadius.trim() || !formData.openTime.trim() || 
          !formData.closeTime.trim() || formData.operatingDays.length === 0) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      // Generate slug from restaurant name
      const slug = formData.restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create opening hours object
      const openingHours: { [key: string]: { open: string; close: string; is_open: boolean } } = {};
      const dayMap: { [key: string]: string } = {
        'Mon': 'monday',
        'Tue': 'tuesday', 
        'Wed': 'wednesday',
        'Thu': 'thursday',
        'Fri': 'friday',
        'Sat': 'saturday',
        'Sun': 'sunday'
      };

      // Initialize all days as closed
      Object.values(dayMap).forEach(day => {
        openingHours[day] = {
          open: formData.openTime,
          close: formData.closeTime,
          is_open: false
        };
      });

      // Set selected days as open
      formData.operatingDays.forEach(day => {
        const fullDay = dayMap[day];
        if (fullDay) {
          openingHours[fullDay].is_open = true;
        }
      });

      // Create vendor data
      const vendorData = {
        name: formData.restaurantName,
        slug,
        logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop&crop=center", // Default logo
        cuisine_type: formData.cuisine,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        rating: 0,
        is_active: true, // Set to true for testing - in production, admin would approve
        status: "approved" as const, // Set to approved for testing - in production, would be pending
        delivery_radius: Number(formData.deliveryRadius),
        opening_hours: openingHours,
        owner_name: formData.ownerName,
        business_type: formData.businessType,
        bank_account: {
          bank_name: formData.bankName || "Not provided",
          account_number: formData.accountNumber || "Not provided",
          account_holder: formData.accountHolder || formData.ownerName,
        },
        commission_rate: 15, // Default 15% commission
        payout_frequency: "weekly" as const,
      };

      // Submit vendor to backend
      console.log('📝 Vendor data to submit:', vendorData);
      const result = await createVendorMutation.mutateAsync(vendorData);
      console.log('✅ Vendor application submitted successfully:', result);

      Alert.alert(
        "Application Submitted!",
        `Thank you ${formData.ownerName}! Your vendor application for "${formData.restaurantName}" has been submitted for review. We'll contact you at ${formData.email} within 2-3 business days.\n\n${result.message}`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error submitting vendor application:', error);
      Alert.alert(
        "Submission Failed",
        `There was an error submitting your application: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step.id && styles.stepCircleActive,
            ]}
          >
            <step.icon
              size={16}
              color={currentStep >= step.id ? "white" : "#8E8E93"}
            />
          </View>
          <Text
            style={[
              styles.stepText,
              currentStep >= step.id && styles.stepTextActive,
            ]}
          >
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step.id && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your restaurant</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Restaurant Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.restaurantName}
          onChangeText={(text) => updateFormData("restaurantName", text)}
          placeholder="Enter restaurant name"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Type *</Text>
        <TextInput
          style={styles.input}
          value={formData.businessType}
          onChangeText={(text) => updateFormData("businessType", text)}
          placeholder="e.g., Restaurant, Fast Food, Cafe"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cuisine Type *</Text>
        <TextInput
          style={styles.input}
          value={formData.cuisine}
          onChangeText={(text) => updateFormData("cuisine", text)}
          placeholder="e.g., Ghanaian, Chinese, Italian"
          placeholderTextColor="#8E8E93"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Owner Details</Text>
      <Text style={styles.stepSubtitle}>Contact information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.ownerName}
          onChangeText={(text) => updateFormData("ownerName", text)}
          placeholder="Enter full name"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => updateFormData("phone", text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          placeholderTextColor="#8E8E93"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location Details</Text>
      <Text style={styles.stepSubtitle}>Where is your restaurant located?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.address}
          onChangeText={(text) => updateFormData("address", text)}
          placeholder="Enter complete address"
          multiline
          numberOfLines={3}
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={formData.city}
          onChangeText={(text) => updateFormData("city", text)}
          placeholder="Enter city"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Delivery Radius (km) *</Text>
        <TextInput
          style={styles.input}
          value={formData.deliveryRadius}
          onChangeText={(text) => updateFormData("deliveryRadius", text)}
          placeholder="e.g., 5"
          keyboardType="numeric"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name</Text>
        <TextInput
          style={styles.input}
          value={formData.bankName}
          onChangeText={(text) => updateFormData("bankName", text)}
          placeholder="Enter bank name"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          value={formData.accountNumber}
          onChangeText={(text) => updateFormData("accountNumber", text)}
          placeholder="Enter account number"
          keyboardType="numeric"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name</Text>
        <TextInput
          style={styles.input}
          value={formData.accountHolder}
          onChangeText={(text) => updateFormData("accountHolder", text)}
          placeholder="Enter account holder name"
          placeholderTextColor="#8E8E93"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Operating Hours</Text>
      <Text style={styles.stepSubtitle}>When are you open?</Text>

      <View style={styles.timeContainer}>
        <View style={styles.timeGroup}>
          <Text style={styles.label}>Opening Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.openTime}
            onChangeText={(text) => updateFormData("openTime", text)}
            placeholder="e.g., 09:00"
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.timeGroup}>
          <Text style={styles.label}>Closing Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.closeTime}
            onChangeText={(text) => updateFormData("closeTime", text)}
            placeholder="e.g., 22:00"
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Operating Days</Text>
        <Text style={styles.helperText}>Select the days you&apos;re open</Text>
        <View style={styles.daysContainer}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                formData.operatingDays.includes(day) && styles.dayButtonActive,
              ]}
              onPress={() => {
                const days = formData.operatingDays.includes(day)
                  ? formData.operatingDays.filter((d) => d !== day)
                  : [...formData.operatingDays, day];
                updateFormData("operatingDays", days);
              }}
            >
              <Text
                style={[
                  styles.dayText,
                  formData.operatingDays.includes(day) && styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Registration</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
            <Text style={styles.prevText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]} 
          onPress={nextStep}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={isSubmitting ? ["#CCCCCC", "#AAAAAA"] : ["#FF6B35", "#FF8E53"]}
            style={styles.nextGradient}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.nextText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.nextText}>
                  {currentStep === steps.length ? "Submit Application" : "Next"}
                </Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "white",
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: "#FF6B35",
  },
  stepText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  stepTextActive: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  stepLine: {
    position: "absolute",
    top: 16,
    left: "60%",
    right: "-40%",
    height: 2,
    backgroundColor: "#F2F2F7",
  },
  stepLineActive: {
    backgroundColor: "#FF6B35",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  timeContainer: {
    flexDirection: "row",
    gap: 16,
  },
  timeGroup: {
    flex: 1,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  dayButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  dayTextActive: {
    color: "white",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  prevButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  prevText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
});