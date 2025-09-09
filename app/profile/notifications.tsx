import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Smartphone,
  Mail,
  Volume2,
  ShoppingBag,
  Truck,
  Star,
  Gift,
} from 'lucide-react-native';

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  enabled: boolean;
  type: 'push' | 'email' | 'sms';
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: '1',
      title: 'Order Updates',
      subtitle: 'Get notified about your order status',
      icon: ShoppingBag,
      enabled: true,
      type: 'push',
    },
    {
      id: '2',
      title: 'Delivery Updates',
      subtitle: 'Track your delivery in real-time',
      icon: Truck,
      enabled: true,
      type: 'push',
    },
    {
      id: '3',
      title: 'Promotions & Offers',
      subtitle: 'Special deals and discounts',
      icon: Gift,
      enabled: false,
      type: 'push',
    },
    {
      id: '4',
      title: 'New Restaurants',
      subtitle: 'When new restaurants join',
      icon: Star,
      enabled: true,
      type: 'push',
    },
    {
      id: '5',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      icon: Mail,
      enabled: true,
      type: 'email',
    },
    {
      id: '6',
      title: 'SMS Notifications',
      subtitle: 'Important updates via SMS',
      icon: Smartphone,
      enabled: false,
      type: 'sms',
    },
  ]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const renderNotificationItem = (item: NotificationSetting) => (
    <View key={item.id} style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <item.icon size={20} color="#FF6B35" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleNotification(item.id)}
        trackColor={{ false: '#E5E5EA', true: '#FF6B35' }}
        thumbColor={item.enabled ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const pushNotifications = notifications.filter(n => n.type === 'push');
  const otherNotifications = notifications.filter(n => n.type !== 'push');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerTitleStyle: { color: '#333' },
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Sound Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound</Text>
            <View style={styles.soundCard}>
              <View style={styles.soundIcon}>
                <Volume2 size={20} color="#FF6B35" />
              </View>
              <View style={styles.soundContent}>
                <Text style={styles.soundTitle}>Notification Sounds</Text>
                <Text style={styles.soundSubtitle}>
                  Play sound for notifications
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#E5E5EA', true: '#FF6B35' }}
                thumbColor={soundEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Push Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Push Notifications</Text>
            <View style={styles.notificationsList}>
              {pushNotifications.map(renderNotificationItem)}
            </View>
          </View>

          {/* Other Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Notifications</Text>
            <View style={styles.notificationsList}>
              {otherNotifications.map(renderNotificationItem)}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Bell size={24} color="#0369A1" />
            <Text style={styles.infoTitle}>Stay Updated</Text>
            <Text style={styles.infoText}>
              Enable notifications to get real-time updates about your orders,
              special offers, and new restaurants in your area.
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
    marginBottom: 16,
  },
  soundCard: {
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
  soundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  soundContent: {
    flex: 1,
  },
  soundTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  soundSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notificationsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    alignItems: 'center',
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369A1',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
    textAlign: 'center',
  },
});