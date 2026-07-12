import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  ArrowRight,
  Store,
  User,
  MapPin,
  Clock,
  Camera,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Lock,
  FileText,
  Navigation,
} from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { trpc } from "@/lib/trpc";
import type { BusinessCategory } from "@/types/vendor";

const steps = [
  { id: 1, title: "Business", icon: Store },
  { id: 2, title: "Owner", icon: User },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Photos", icon: Camera },
  { id: 5, title: "Hours", icon: Clock },
];

const businessCategories: BusinessCategory[] = [
  "Restaurant",
  "Grocery",
  "Pharmacy",
  "Bakery",
  "Cafe",
  "Fast Food",
  "Beverages",
  "Other",
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayMap: Record<string, string> = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

interface UploadImage {
  uri: string;
  type: string;
  name: string;
}

export default function VendorSignupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [logoImage, setLogoImage] = useState<UploadImage | null>(null);
  const [coverImage, setCoverImage] = useState<UploadImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadImage[]>([]);
  const [documentImages, setDocumentImages] = useState<UploadImage[]>([]);

  const createVendorMutation = trpc.vendors.create.useMutation();

  const [formData, setFormData] = useState({
    businessName: "",
    businessCategory: "" as BusinessCategory | "",
    businessDescription: "",
    cuisine: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    deliveryRadius: "",
    openTime: "",
    closeTime: "",
    operatingDays: [] as string[],
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    termsAccepted: false,
  });

  const updateFormData = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" && libraryStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "ChopChoo needs access to your camera and photo library to upload images. Please enable these permissions in your phone settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return false;
    }
    return true;
  };

  const compressAndPickImage = async (
    source: "camera" | "library"
  ): Promise<UploadImage | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        allowsMultipleSelection: false,
      };

      let result: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      return {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: fileName,
      };
    } catch (error) {
      console.error("❌ Image picker error:", error);
      Alert.alert(
        "Upload Error",
        "Failed to pick image. Please try again.",
        [{ text: "OK" }]
      );
      return null;
    }
  };

  const pickLogo = async (source: "camera" | "library") => {
    const image = await compressAndPickImage(source);
    if (image) setLogoImage(image);
  };

  const pickCover = async (source: "camera" | "library") => {
    const image = await compressAndPickImage(source);
    if (image) setCoverImage(image);
  };

  const pickGalleryImage = async (source: "camera" | "library") => {
    const image = await compressAndPickImage(source);
    if (image) {
      setGalleryImages((prev) => [...prev, image]);
    }
  };

  const pickDocument = async (source: "camera" | "library") => {
    const image = await compressAndPickImage(source);
    if (image) {
      setDocumentImages((prev) => [...prev, image]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocumentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to capture your GPS coordinates. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      updateFormData("latitude", location.coords.latitude.toFixed(6));
      updateFormData("longitude", location.coords.longitude.toFixed(6));
      Alert.alert(
        "Location Captured",
        `GPS coordinates: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
      );
    } catch (error) {
      console.error("❌ Location error:", error);
      Alert.alert(
        "Location Error",
        "Failed to get your current location. Please try again or enter coordinates manually."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const showImageSourceSheet = (
    onPick: (source: "camera" | "library") => void
  ) => {
    Alert.alert("Choose Image Source", "", [
      {
        text: "Take Photo",
        onPress: () => onPick("camera"),
      },
      {
        text: "Choose from Library",
        onPress: () => onPick("library"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.businessName.trim()) {
          Alert.alert("Error", "Business name is required");
          return false;
        }
        if (!formData.businessCategory) {
          Alert.alert("Error", "Please select a business category");
          return false;
        }
        if (!formData.cuisine.trim()) {
          Alert.alert("Error", "Cuisine type is required");
          return false;
        }
        if (!formData.businessDescription.trim()) {
          Alert.alert("Error", "Business description is required");
          return false;
        }
        break;
      case 2:
        if (!formData.ownerName.trim()) {
          Alert.alert("Error", "Owner's full name is required");
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          Alert.alert("Error", "Valid email address is required");
          return false;
        }
        if (!formData.phone.trim()) {
          Alert.alert("Error", "Phone number is required");
          return false;
        }
        if (formData.password.length < 6) {
          Alert.alert("Error", "Password must be at least 6 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          Alert.alert("Error", "Passwords do not match");
          return false;
        }
        break;
      case 3:
        if (!formData.address.trim()) {
          Alert.alert("Error", "Business address is required");
          return false;
        }
        if (!formData.city.trim()) {
          Alert.alert("Error", "City is required");
          return false;
        }
        if (
          !formData.deliveryRadius.trim() ||
          isNaN(Number(formData.deliveryRadius))
        ) {
          Alert.alert("Error", "Valid delivery radius is required");
          return false;
        }
        break;
      case 5:
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
        if (!formData.termsAccepted) {
          Alert.alert("Error", "Please accept the terms and conditions");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("🚀 Submitting vendor application...", formData);

      const slug = formData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const openingHours: Record<
        string,
        { open: string; close: string; is_open: boolean }
      > = {};
      Object.values(dayMap).forEach((day) => {
        openingHours[day] = {
          open: formData.openTime,
          close: formData.closeTime,
          is_open: false,
        };
      });
      formData.operatingDays.forEach((day) => {
        const fullDay = dayMap[day];
        if (fullDay) openingHours[fullDay].is_open = true;
      });

      const vendorData = {
        name: formData.businessName,
        slug,
        logo: logoImage?.uri || "",
        cover_image: coverImage?.uri || "",
        gallery_images: galleryImages.map((img) => img.uri),
        cuisine_type: formData.cuisine,
        business_category: formData.businessCategory as BusinessCategory,
        business_description: formData.businessDescription,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        rating: 0,
        is_active: false,
        status: "pending" as const,
        delivery_radius: Number(formData.deliveryRadius),
        opening_hours: openingHours,
        owner_name: formData.ownerName,
        business_type: formData.businessCategory as string,
        bank_account: {
          bank_name: formData.bankName || "Not provided",
          account_number: formData.accountNumber || "Not provided",
          account_holder: formData.accountHolder || formData.ownerName,
        },
        commission_rate: 15,
        payout_frequency: "weekly" as const,
        coordinates:
          formData.latitude && formData.longitude
            ? {
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
              }
            : undefined,
        documents:
          documentImages.length > 0
            ? {
                business_registration: documentImages[0]?.uri,
                food_license: documentImages[1]?.uri,
              }
            : undefined,
      };

      console.log("📝 Vendor data to submit:", vendorData);
      const result = await createVendorMutation.mutateAsync(vendorData);
      console.log("✅ Vendor application submitted:", result);

      Alert.alert(
        "Application Submitted!",
        `Thank you ${formData.ownerName}! Your vendor application for "${formData.businessName}" has been submitted for review.\n\nYour account status is now PENDING. We'll notify you at ${formData.email} within 2-3 business days once your application has been reviewed.\n\nApplication ID: ${result.vendor?.id || "N/A"}`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error submitting vendor application:", error);
      Alert.alert(
        "Submission Failed",
        `There was an error submitting your application: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
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

  const renderImageUploader = (
    label: string,
    image: UploadImage | null,
    onSet: (source: "camera" | "library") => void,
    onRemove: () => void,
    height: number = 120
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {image ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: image.uri }}
            style={[styles.imagePreview, { height }]}
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={onRemove}
          >
            <X size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => showImageSourceSheet(onSet)}
          >
            <Text style={styles.changeImageText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { height }]}
          onPress={() => showImageSourceSheet(onSet)}
        >
          <Camera size={28} color="#FF6B35" />
          <Text style={styles.uploadButtonText}>Tap to upload</Text>
          <Text style={styles.uploadButtonSubtext}>
            Camera or Photo Library
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Step 1: Business Info
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your business</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.businessName}
          onChangeText={(text) => updateFormData("businessName", text)}
          placeholder="Enter business name"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Category *</Text>
        <View style={styles.categoryContainer}>
          {businessCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                formData.businessCategory === cat &&
                  styles.categoryButtonActive,
              ]}
              onPress={() => updateFormData("businessCategory", cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  formData.businessCategory === cat &&
                    styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.businessDescription}
          onChangeText={(text) => updateFormData("businessDescription", text)}
          placeholder="Describe your business, what you offer, what makes you special..."
          multiline
          numberOfLines={4}
          placeholderTextColor="#8E8E93"
        />
      </View>
    </View>
  );

  // Step 2: Owner Details + Password
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Owner Details</Text>
      <Text style={styles.stepSubtitle}>Contact information & credentials</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Owner's Full Name *</Text>
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <Lock size={18} color="#8E8E93" style={styles.passwordIcon} />
          <TextInput
            style={styles.passwordInput}
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            placeholder="At least 6 characters"
            secureTextEntry
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={styles.passwordContainer}>
          <Lock size={18} color="#8E8E93" style={styles.passwordIcon} />
          <TextInput
            style={styles.passwordInput}
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData("confirmPassword", text)}
            placeholder="Re-enter password"
            secureTextEntry
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>
    </View>
  );

  // Step 3: Location & Banking
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location Details</Text>
      <Text style={styles.stepSubtitle}>Where is your business located?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.address}
          onChangeText={(text) => updateFormData("address", text)}
          placeholder="Enter complete business address"
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
        <Text style={styles.label}>GPS Location (Optional)</Text>
        <Text style={styles.helperText}>
          Capture your exact location for accurate deliveries
        </Text>
        <View style={styles.gpsRow}>
          <TextInput
            style={[styles.input, styles.gpsInput]}
            value={formData.latitude}
            onChangeText={(text) => updateFormData("latitude", text)}
            placeholder="Latitude"
            keyboardType="numeric"
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={[styles.input, styles.gpsInput]}
            value={formData.longitude}
            onChangeText={(text) => updateFormData("longitude", text)}
            placeholder="Longitude"
            keyboardType="numeric"
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity
            style={[
              styles.gpsButton,
              isGettingLocation && styles.gpsButtonDisabled,
            ]}
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Navigation size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
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

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Banking Details (Optional)</Text>

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

  // Step 4: Photos & Documents
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Photos & Documents</Text>
      <Text style={styles.stepSubtitle}>
        Upload images of your business (optional but recommended)
      </Text>

      {renderImageUploader(
        "Business Logo *",
        logoImage,
        pickLogo,
        () => setLogoImage(null),
        140
      )}

      {renderImageUploader(
        "Cover Photo",
        coverImage,
        pickCover,
        () => setCoverImage(null),
        160
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Photos (Gallery)</Text>
        <Text style={styles.helperText}>
          Upload one or more photos of your business
        </Text>
        <View style={styles.galleryContainer}>
          {galleryImages.map((img, index) => (
            <View key={index} style={styles.galleryItem}>
              <Image
                source={{ uri: img.uri }}
                style={styles.galleryImage}
              />
              <TouchableOpacity
                style={styles.removeGalleryButton}
                onPress={() => removeGalleryImage(index)}
              >
                <X size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addGalleryButton}
            onPress={() => showImageSourceSheet(pickGalleryImage)}
          >
            <ImageIcon size={24} color="#FF6B35" />
            <Text style={styles.addGalleryText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Documents</Text>
        <Text style={styles.helperText}>
          Upload business registration, food license, or tax ID documents
        </Text>
        <View style={styles.galleryContainer}>
          {documentImages.map((img, index) => (
            <View key={index} style={styles.galleryItem}>
              <Image
                source={{ uri: img.uri }}
                style={styles.galleryImage}
              />
              <TouchableOpacity
                style={styles.removeGalleryButton}
                onPress={() => removeDocument(index)}
              >
                <X size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addGalleryButton}
            onPress={() => showImageSourceSheet(pickDocument)}
          >
            <FileText size={24} color="#FF6B35" />
            <Text style={styles.addGalleryText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Step 5: Operating Hours
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Operating Hours</Text>
      <Text style={styles.stepSubtitle}>When are you open for business?</Text>

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
        <Text style={styles.helperText}>Select the days you're open</Text>
        <View style={styles.daysContainer}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                formData.operatingDays.includes(day) &&
                  styles.dayButtonActive,
              ]}
              onPress={() => {
                const updatedDays = formData.operatingDays.includes(day)
                  ? formData.operatingDays.filter((d) => d !== day)
                  : [...formData.operatingDays, day];
                updateFormData("operatingDays", updatedDays);
              }}
            >
              <Text
                style={[
                  styles.dayText,
                  formData.operatingDays.includes(day) &&
                    styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() =>
            updateFormData("termsAccepted", !formData.termsAccepted)
          }
        >
          <View
            style={[
              styles.checkbox,
              formData.termsAccepted && styles.checkboxActive,
            ]}
          >
            {formData.termsAccepted && (
              <CheckCircle2 size={20} color="white" />
            )}
          </View>
          <Text style={styles.termsText}>
            I accept the terms and conditions and confirm that all information
            provided is accurate. I understand my application will be reviewed
            before approval.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>What happens next?</Text>
        <Text style={styles.infoCardText}>
          1. Your application will be reviewed by our admin team{"\n"}
          2. You'll receive an email notification with the decision{"\n"}
          3. Once approved, you can access your vendor dashboard{"\n"}
          4. Start adding products and receiving orders!
        </Text>
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
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

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
            colors={
              isSubmitting
                ? ["#CCCCCC", "#AAAAAA"]
                : ["#FF6B35", "#FF8E53"]
            }
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
                  {currentStep === steps.length
                    ? "Submit Application"
                    : "Next"}
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
    paddingHorizontal: 12,
    paddingVertical: 20,
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
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: "#FF6B35",
  },
  stepText: {
    fontSize: 11,
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
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
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
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  categoryButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  categoryTextActive: {
    color: "white",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordIcon: {
    marginRight: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  gpsRow: {
    flexDirection: "row",
    gap: 8,
  },
  gpsInput: {
    flex: 1,
  },
  gpsButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  gpsButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: "#8E8E93",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    borderRadius: 16,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,107,53,0.9)",
  },
  changeImageText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryItem: {
    position: "relative",
  },
  galleryImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeGalleryButton: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  addGalleryButton: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addGalleryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6B35",
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
    paddingVertical: 10,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#FFF5F0",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FFE0D0",
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
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
    paddingVertical: 14,
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
    paddingVertical: 14,
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
