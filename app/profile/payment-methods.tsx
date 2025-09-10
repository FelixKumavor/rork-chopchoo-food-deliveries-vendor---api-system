import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money';
  name: string;
  details: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa Card',
      details: '**** **** **** 1234',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mobile_money',
      name: 'MTN Mobile Money',
      details: '0207477013',
      isDefault: false,
    },
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose payment method type',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit/Debit Card', onPress: () => handleAddCard() },
        { text: 'Mobile Money', onPress: () => handleAddMobileMoney() },
      ]
    );
  };

  const handleAddCard = () => {
    // Simulate adding a card
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: 'New Card',
      details: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods(prev => [...prev, newCard]);
    Alert.alert('Success', 'Card added successfully!');
  };

  const handleAddMobileMoney = () => {
    // Simulate adding mobile money
    const providers = ['MTN', 'Vodafone', 'AirtelTigo'];
    const randomProvider = providers[Math.floor(Math.random() * providers.length)];
    const newMobileMoney: PaymentMethod = {
      id: Date.now().toString(),
      type: 'mobile_money',
      name: `${randomProvider} Mobile Money`,
      details: '0' + Math.floor(200000000 + Math.random() * 99999999),
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods(prev => [...prev, newMobileMoney]);
    Alert.alert('Success', 'Mobile Money account added successfully!');
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentCard}>
      <View style={styles.paymentIcon}>
        {method.type === 'card' ? (
          <CreditCard size={24} color="#FF6B35" />
        ) : (
          <Smartphone size={24} color="#4ECDC4" />
        )}
      </View>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>{method.name}</Text>
        <Text style={styles.paymentDetails}>{method.details}</Text>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <CheckCircle size={16} color="#34C759" />
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.paymentActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={styles.setDefaultText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMethod(method.id)}
        >
          <Trash2 size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Payment Methods',
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerTitleStyle: { color: '#333' },
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptySubtitle}>
                Add a payment method to start ordering
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Secure Payments</Text>
            <Text style={styles.infoText}>
              Your payment information is encrypted and secure. We use Paystack
              to process payments safely.
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  methodsList: {
    gap: 12,
    marginBottom: 24,
  },
  paymentCard: {
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
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  paymentActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
});