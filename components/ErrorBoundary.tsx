import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to crash reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to crash reporting service like Sentry
      console.error('Production error:', { error, errorInfo });
    }
  }

  private retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private isNetworkError = (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('offline')
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      const isNetworkError = this.isNetworkError(this.state.error);
      
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.iconContainer}>
            {isNetworkError ? (
              <Wifi size={48} color="#FF6B35" />
            ) : (
              <AlertTriangle size={48} color="#FF6B35" />
            )}
          </View>
          
          <Text style={styles.title}>
            {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
          </Text>
          
          <Text style={styles.message}>
            {isNetworkError 
              ? 'Please check your internet connection and try again.'
              : this.state.error.message || 'An unexpected error occurred'
            }
          </Text>
          
          {process.env.NODE_ENV === 'development' && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{this.state.error.stack}</Text>
              {this.state.errorInfo && (
                <Text style={styles.debugText}>
                  Component Stack: {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
          
          <TouchableOpacity style={styles.button} onPress={this.retry}>
            <RefreshCw size={16} color="white" />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  debugContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

// Network Error Fallback Component
export const NetworkErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Wifi size={48} color="#FF6B35" />
      </View>
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.message}>
        Please check your internet connection and try again.
      </Text>
      <TouchableOpacity style={styles.button} onPress={retry}>
        <RefreshCw size={16} color="white" />
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

// tRPC Error Fallback Component
export const TRPCErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  const isNetworkError = error.message.toLowerCase().includes('network') || 
                        error.message.toLowerCase().includes('fetch') ||
                        error.message.toLowerCase().includes('failed to fetch');
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {isNetworkError ? (
          <Wifi size={48} color="#FF6B35" />
        ) : (
          <AlertTriangle size={48} color="#FF6B35" />
        )}
      </View>
      <Text style={styles.title}>
        {isNetworkError ? 'Connection Problem' : 'Server Error'}
      </Text>
      <Text style={styles.message}>
        {isNetworkError 
          ? 'Unable to connect to the server. Please check your internet connection.'
          : 'There was a problem with the server. Please try again later.'
        }
      </Text>
      <TouchableOpacity style={styles.button} onPress={retry}>
        <RefreshCw size={16} color="white" />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};