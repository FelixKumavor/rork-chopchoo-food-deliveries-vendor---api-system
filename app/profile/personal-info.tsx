import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Camera, User } from "lucide-react-native";
import { useAuth } from "@/providers/auth-provider";
import { trpc } from "@/lib/trpc";

export default function PersonalInfoScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "Felix Kumavor",
    email: user?.email || "katekobla900@gmail.com",
    phone: user?.phone || "+233 20 747 7013",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get profile data
  const profileQuery = trpc.profile.get.useQuery(
    { userId: user?.id || "1" },
    { enabled: !!user?.id }
  );

  // Update profile mutation
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: (data) => {
      Alert.alert("Success", data.message);
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  useEffect(() => {
    if (profileQuery.data?.profile) {
      const profile = profileQuery.data.profile;
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profileQuery.data]);

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    updateProfileMutation.mutate({
      userId: user.id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    });
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker for profile photo
    console.log("Open image picker");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Personal Information",
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
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
              }}
              style={styles.profilePhoto}
            />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleImagePicker}
            >
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoText}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter your email"
                placeholderTextColor="#C7C7CC"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor="#C7C7CC"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.saveButton, (updateProfileMutation.isPending || profileQuery.isLoading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updateProfileMutation.isPending || profileQuery.isLoading}
        >
          <Text style={styles.saveButtonText}>
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
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
  photoSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "white",
    marginBottom: 24,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F2F2F7",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  photoText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  formSection: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 24,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  bottomContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#C7C7CC",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});