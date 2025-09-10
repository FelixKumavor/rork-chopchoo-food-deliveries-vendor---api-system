import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { trpc } from '@/lib/trpc';

interface MobileMoneyPaymentProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  onPaymentSuccess: (reference: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
  visible: boolean;
}

type MobileMoneyProvider = 'mtn' | 'vodafone' | 'airtel';

export default function MobileMoneyPayment({
  orderId,
  amount,
  customerEmail,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  visible,
}: MobileMoneyPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [provider, setProvider] = useState<MobileMoneyProvider>('mtn');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [showVerification, setShowVerification] = useState<boolean>(false);

  const initializeMomoMutation = trpc.payment.initializeMomo.useMutation();
  const verifyPaymentQuery = trpc.payment.verify.useQuery(
    { reference: paymentReference },
    { 
      enabled: !!paymentReference && showVerification,
      refetchInterval: 3000,
      refetchIntervalInBackground: false,
    }
  );

  const handleInitializePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile money number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, provider)) {
      Alert.alert('Error', `Please enter a valid ${provider.toUpperCase()} mobile money number`);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await initializeMomoMutation.mutateAsync({
        orderId,
        amount,
        email: customerEmail,
        phone: phoneNumber,
        provider,
        currency: 'GHS',
        metadata: {
          orderId,
          customerEmail,
        },
      });

      if (result.success) {
        setPaymentReference(result.reference);
        setShowVerification(true);
        
        Alert.alert(
          'Payment Initiated',
          `Please check your ${provider.toUpperCase()} mobile money for a payment prompt and enter your PIN to complete the transaction.`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificationResult = () => {
    if (verifyPaymentQuery.data) {
      const { status } = verifyPaymentQuery.data;
      
      if (status === 'success') {
        onPaymentSuccess(paymentReference);
        resetForm();
      } else if (status === 'failed') {
        onPaymentError('Payment was declined or failed');
        resetForm();
      }
    }
  };

  React.useEffect(() => {
    handleVerificationResult();
  }, [verifyPaymentQuery.data, paymentReference]);

  const resetForm = () => {
    setPhoneNumber('');
    setProvider('mtn');
    setIsProcessing(false);
    setPaymentReference('');
    setShowVerification(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const validatePhoneNumber = (phone: string, selectedProvider: MobileMoneyProvider): boolean => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    if (cleanPhone.length !== 10) return false;
    
    switch (selectedProvider) {
      case 'mtn':
        return /^(024|025|053|054|055|059)/.test(cleanPhone);
      case 'vodafone':
        return /^(020|050|051)/.test(cleanPhone);
      case 'airtel':
        return /^(026|056|057)/.test(cleanPhone);
      default:
        return false;
    }
  };

  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getProviderColor = (selectedProvider: MobileMoneyProvider): string => {
    switch (selectedProvider) {
      case 'mtn': return '#FFCC00';
      case 'vodafone': return '#E60000';
      case 'airtel': return '#FF0000';
      default: return '#007AFF';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mobile Money Payment</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
          </View>

          {!showVerification ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Mobile Money Provider</Text>
                <View style={[styles.pickerContainer, { borderColor: getProviderColor(provider) }]}>
                  <Picker
                    selectedValue={provider}
                    onValueChange={(value: MobileMoneyProvider) => setProvider(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="MTN Mobile Money" value="mtn" />
                    <Picker.Item label="Vodafone Cash" value="vodafone" />
                    <Picker.Item label="AirtelTigo Money" value="airtel" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Money Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="e.g., 0241234567"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isProcessing}
                />
                <Text style={styles.hint}>
                  Enter your {provider.toUpperCase()} mobile money number
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: getProviderColor(provider) },
                  isProcessing && styles.disabledButton,
                ]}
                onPress={handleInitializePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay {formatAmount(amount)}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.verificationContainer}>
              <ActivityIndicator size="large" color={getProviderColor(provider)} />
              <Text style={styles.verificationTitle}>Waiting for Payment Confirmation</Text>
              <Text style={styles.verificationText}>
                Please complete the payment on your {provider.toUpperCase()} mobile money by entering your PIN.
              </Text>
              <Text style={styles.referenceText}>
                Reference: {paymentReference}
              </Text>
              
              <TouchableOpacity
                style={styles.cancelVerificationButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelVerificationText}>Cancel Payment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  payButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  referenceText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 40,
  },
  cancelVerificationButton: {
    padding: 12,
  },
  cancelVerificationText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});