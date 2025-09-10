import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { trpc } from '@/lib/trpc';

interface OtpVerificationProps {
  visible: boolean;
  phoneNumber: string;
  otpType: 'registration' | 'login' | 'payment_verification';
  onVerificationSuccess: () => void;
  onVerificationError: (error: string) => void;
  onCancel: () => void;
}

export default function OtpVerification({
  visible,
  phoneNumber,
  otpType,
  onVerificationSuccess,
  onVerificationError,
  onCancel,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  React.useEffect(() => {
    if (visible && phoneNumber) {
      handleSendOtp();
    }
  }, [visible, phoneNumber]);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await sendOtpMutation.mutateAsync({
        phone: phoneNumber,
        type: otpType,
      });
      setCountdown(300); // 5 minutes
      console.log('OTP sent successfully');
    } catch (error) {
      console.error('OTP sending error:', error);
      onVerificationError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      onVerificationError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtpMutation.mutateAsync({
        phone: phoneNumber,
        otp: otpToVerify,
        type: otpType,
      });
      
      onVerificationSuccess();
      resetForm();
    } catch (error) {
      console.error('OTP verification error:', error);
      onVerificationError(error instanceof Error ? error.message : 'OTP verification failed');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setOtp(['', '', '', '', '', '']);
    setIsVerifying(false);
    setIsSendingOtp(false);
    setCountdown(0);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getOtpTypeTitle = (): string => {
    switch (otpType) {
      case 'registration': return 'Verify Your Phone Number';
      case 'login': return 'Login Verification';
      case 'payment_verification': return 'Payment Verification';
      default: return 'Verification Required';
    }
  };

  const getOtpTypeMessage = (): string => {
    switch (otpType) {
      case 'registration': 
        return 'We\'ve sent a 6-digit verification code to your phone number to complete your registration.';
      case 'login': 
        return 'We\'ve sent a 6-digit verification code to your phone number to secure your login.';
      case 'payment_verification': 
        return 'We\'ve sent a 6-digit verification code to your phone number to verify this payment.';
      default: 
        return 'We\'ve sent a 6-digit verification code to your phone number.';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{getOtpTypeTitle()}</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.message}>{getOtpTypeMessage()}</Text>
          
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={`otp-${index}`}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                editable={!isVerifying}
                selectTextOnFocus
              />
            ))}
          </View>

          {countdown > 0 && (
            <Text style={styles.countdown}>
              Code expires in {formatCountdown(countdown)}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isVerifying || otp.join('').length !== 6) && styles.disabledButton,
            ]}
            onPress={() => handleVerifyOtp()}
            disabled={isVerifying || otp.join('').length !== 6}
          >
            {isVerifying ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendButton,
              (countdown > 0 || isSendingOtp) && styles.disabledButton,
            ]}
            onPress={handleSendOtp}
            disabled={countdown > 0 || isSendingOtp}
          >
            {isSendingOtp ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={[
                styles.resendButtonText,
                (countdown > 0) && styles.disabledText,
              ]}>
                {countdown > 0 ? `Resend in ${formatCountdown(countdown)}` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  otpInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  countdown: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 200,
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  disabledText: {
    color: '#999999',
  },
});