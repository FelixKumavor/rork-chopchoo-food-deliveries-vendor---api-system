import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Globe,
  Moon,
  MapPin,
  Shield,
  Smartphone,
  Download,
  Trash2,
  Info,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [locationServices, setLocationServices] = useState<boolean>(true);
  const [autoDownload, setAutoDownload] = useState<boolean>(false);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  const handleLanguageChange = () => {
    console.log('Change language');
  };

  const handlePrivacySettings = () => {
    console.log('Open privacy settings');
  };

  const handleClearCache = () => {
    console.log('Clear cache');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account');
  };

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: Moon,
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Globe,
          title: 'Language',
          subtitle: 'English',
          type: 'action',
          onPress: handleLanguageChange,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: MapPin,
          title: 'Location Services',
          subtitle: 'Allow location access for delivery',
          type: 'switch',
          value: locationServices,
          onToggle: setLocationServices,
        },
        {
          icon: Shield,
          title: 'Privacy Settings',
          subtitle: 'Manage your privacy preferences',
          type: 'action',
          onPress: handlePrivacySettings,
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          icon: Download,
          title: 'Auto-download Images',
          subtitle: 'Download images on WiFi only',
          type: 'switch',
          value: autoDownload,
          onToggle: setAutoDownload,
        },
        {
          icon: Smartphone,
          title: 'Offline Mode',
          subtitle: 'Browse saved content offline',
          type: 'switch',
          value: offlineMode,
          onToggle: setOfflineMode,
        },
      ],
    },
    {
      title: 'Storage',
      items: [
        {
          icon: Trash2,
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          type: 'action',
          onPress: handleClearCache,
          color: '#FF6B35',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Trash2,
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          type: 'action',
          onPress: handleDeleteAccount,
          color: '#FF3B30',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => (
    <View key={index} style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: item.color ? `${item.color}15` : '#FFF3F0' }]}>
        <item.icon size={20} color={item.color || '#FF6B35'} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: item.color || '#333' }]}>
          {item.title}
        </Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E5EA', true: item.color || '#FF6B35' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <TouchableOpacity onPress={item.onPress} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: item.color || '#C7C7CC' }]}>
            {item.title === 'Language' ? 'Change' : 'Open'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSection = (section: any, sectionIndex: number) => (
    <View key={sectionIndex} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerTitleStyle: { color: '#333' },
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {settingSections.map(renderSection)}

          {/* App Info */}
          <View style={styles.infoCard}>
            <Info size={24} color="#0369A1" />
            <Text style={styles.infoTitle}>About ChopChoo</Text>
            <Text style={styles.infoText}>
              ChopChoo Food Delivery brings the best restaurants in Ghana right
              to your doorstep. Fast, reliable, and delicious.
            </Text>
            <View style={styles.infoDetails}>
              <Text style={styles.infoVersion}>Version 1.0.0</Text>
              <Text style={styles.infoBuild}>Build 2024.1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369A1',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369A1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoDetails: {
    alignItems: 'center',
    gap: 4,
  },
  infoVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
  },
  infoBuild: {
    fontSize: 12,
    color: '#0369A1',
  },
});