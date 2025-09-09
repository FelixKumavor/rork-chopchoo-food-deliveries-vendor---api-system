import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  HelpCircle,
  Clock,
  Users,
} from 'lucide-react-native';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  const handleContactSupport = () => {
    Linking.openURL('tel:+233207477013');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:katekobla900@gmail.com?subject=ChopChoo Support Request');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/233207477013?text=Hello, I need help with my ChopChoo order');
  };

  const handleFAQ = () => {
    console.log('Open FAQ');
  };

  const handleTerms = () => {
    console.log('Open Terms & Conditions');
  };

  const handlePrivacy = () => {
    console.log('Open Privacy Policy');
  };

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      onPress: handleWhatsApp,
      color: '#25D366',
    },
    {
      icon: Phone,
      title: 'Call Support',
      subtitle: '+233 20 747 7013',
      onPress: handleContactSupport,
      color: '#007AFF',
    },
    {
      icon: Mail,
      title: 'Email Support',
      subtitle: 'katekobla900@gmail.com',
      onPress: handleEmailSupport,
      color: '#FF6B35',
    },
  ];

  const helpResources = [
    {
      icon: HelpCircle,
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      onPress: handleFAQ,
    },
    {
      icon: FileText,
      title: 'Terms & Conditions',
      subtitle: 'Read our terms of service',
      onPress: handleTerms,
    },
    {
      icon: FileText,
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      onPress: handlePrivacy,
    },
  ];

  const renderSupportOption = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.supportCard}
      onPress={option.onPress}
    >
      <View style={[styles.supportIcon, { backgroundColor: `${option.color}15` }]}>
        <option.icon size={24} color={option.color} />
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
      </View>
      <ExternalLink size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderHelpResource = (resource: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.resourceItem}
      onPress={resource.onPress}
    >
      <View style={styles.resourceIcon}>
        <resource.icon size={20} color="#FF6B35" />
      </View>
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{resource.title}</Text>
        <Text style={styles.resourceSubtitle}>{resource.subtitle}</Text>
      </View>
      <ExternalLink size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerTitleStyle: { color: '#333' },
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contact Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.sectionSubtitle}>
              Need immediate help? Get in touch with our support team
            </Text>
            <View style={styles.supportList}>
              {supportOptions.map(renderSupportOption)}
            </View>
          </View>

          {/* Support Hours */}
          <View style={styles.hoursCard}>
            <View style={styles.hoursIcon}>
              <Clock size={24} color="#34C759" />
            </View>
            <View style={styles.hoursContent}>
              <Text style={styles.hoursTitle}>Support Hours</Text>
              <Text style={styles.hoursText}>Monday - Sunday: 8:00 AM - 10:00 PM</Text>
              <Text style={styles.hoursSubtext}>We typically respond within 5 minutes</Text>
            </View>
          </View>

          {/* Help Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help Resources</Text>
            <View style={styles.resourcesList}>
              {helpResources.map(renderHelpResource)}
            </View>
          </View>

          {/* Community */}
          <View style={styles.communityCard}>
            <View style={styles.communityIcon}>
              <Users size={32} color="#4ECDC4" />
            </View>
            <Text style={styles.communityTitle}>Join Our Community</Text>
            <Text style={styles.communityText}>
              Connect with other ChopChoo users, share experiences, and get tips
              from fellow food lovers.
            </Text>
            <TouchableOpacity style={styles.communityButton}>
              <Text style={styles.communityButtonText}>Join Community</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoTitle}>ChopChoo Food Delivery</Text>
            <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
            <Text style={styles.appInfoText}>
              Made with ❤️ for food lovers in Ghana
            </Text>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  supportList: {
    gap: 12,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 32,
  },
  hoursIcon: {
    marginRight: 16,
  },
  hoursContent: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 14,
    color: '#15803D',
    marginBottom: 2,
  },
  hoursSubtext: {
    fontSize: 12,
    color: '#22C55E',
  },
  resourcesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  communityCard: {
    backgroundColor: '#F0FDFC',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    marginBottom: 32,
  },
  communityIcon: {
    marginBottom: 16,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  communityText: {
    fontSize: 14,
    color: '#44A08D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  communityButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  communityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});