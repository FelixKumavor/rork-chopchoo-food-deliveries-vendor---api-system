import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw, CheckCircle, XCircle, Wifi, Server } from 'lucide-react-native';


export default function DebugScreen() {
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState<{
    [key: string]: { status: 'pending' | 'success' | 'error'; message: string; data?: any }
  }>({});
  const [isRunning, setIsRunning] = useState(false);

  // Remove unused hiQuery to fix lint warning

  const runConnectivityTests = async () => {
    setIsRunning(true);
    setTests({});

    // Test 0: Network connectivity
    try {
      setTests(prev => ({ ...prev, network: { status: 'pending', message: 'Testing network connectivity...' } }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setTests(prev => ({ 
          ...prev, 
          network: { 
            status: 'success', 
            message: 'Network connectivity working',
            data: { status: response.status, origin: data.origin }
          } 
        }));
      } else {
        throw new Error(`Network test failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Connectivity test failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        network: { 
          status: 'error', 
          message: `❌ Connectivity test failed: ${error.name === 'AbortError' ? 'Request timeout' : error.message}` 
        } 
      }));
    }

    // Test 1: Basic API endpoint
    try {
      setTests(prev => ({ ...prev, basicApi: { status: 'pending', message: 'Testing basic API...' } }));
      
      const response = await fetch('https://chopchoofooddeliveries.rork.ai/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTests(prev => ({ 
          ...prev, 
          basicApi: { 
            status: 'success', 
            message: '✅ Basic API connection successful', 
            data 
          } 
        }));
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Basic API failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        basicApi: { 
          status: 'error', 
          message: `❌ Basic API failed: ${error.message}` 
        } 
      }));
    }

    // Test 1.5: Debug endpoint
    try {
      setTests(prev => ({ ...prev, debugApi: { status: 'pending', message: 'Testing debug endpoint...' } }));
      
      const response = await fetch('https://chopchoofooddeliveries.rork.ai/api/debug', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTests(prev => ({ 
          ...prev, 
          debugApi: { 
            status: 'success', 
            message: '✅ Debug endpoint working', 
            data 
          } 
        }));
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Debug API failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        debugApi: { 
          status: 'error', 
          message: `❌ Debug API failed: ${error.message}` 
        } 
      }));
    }

    // Test 2: Direct tRPC endpoint test
    try {
      setTests(prev => ({ ...prev, trpcDirect: { status: 'pending', message: 'Testing tRPC endpoint directly...' } }));
      
      const response = await fetch('https://chopchoofooddeliveries.rork.ai/api/trpc/example.hi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "0": {
            "json": { "name": "Direct Test" }
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTests(prev => ({ 
          ...prev, 
          trpcDirect: { 
            status: 'success', 
            message: '✅ Direct tRPC endpoint working!', 
            data 
          } 
        }));
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Direct tRPC failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        trpcDirect: { 
          status: 'error', 
          message: `❌ Direct tRPC failed: ${error.message}` 
        } 
      }));
    }

    // Test 3: Direct test procedure
    try {
      setTests(prev => ({ ...prev, directTest: { status: 'pending', message: 'Testing direct test procedure...' } }));
      
      const { trpcClient } = await import('@/lib/trpc');
      const data = await trpcClient.test.query();
      
      setTests(prev => ({ 
        ...prev, 
        directTest: { 
          status: 'success', 
          message: '✅ Direct test procedure working!', 
          data 
        } 
      }));
    } catch (error: any) {
      console.error('❌ Direct test failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        directTest: { 
          status: 'error', 
          message: `❌ Direct test failed: ${error.message}` 
        } 
      }));
    }

    // Test 4: tRPC client test (example.hi)
    try {
      setTests(prev => ({ ...prev, trpc: { status: 'pending', message: 'Testing tRPC client (example.hi)...' } }));
      
      // Use tRPC client directly
      const { trpcClient } = await import('@/lib/trpc');
      const data = await trpcClient.example.hi.query({ name: 'Debug Test' });
      
      setTests(prev => ({ 
        ...prev, 
        trpc: { 
          status: 'success', 
          message: '✅ tRPC client working!', 
          data 
        } 
      }));
    } catch (error: any) {
      console.error('❌ tRPC client failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        trpc: { 
          status: 'error', 
          message: `❌ tRPC connection failed: ${error.message}` 
        } 
      }));
    }

    // Test 4.5: tRPC client test (example.hiInline)
    try {
      setTests(prev => ({ ...prev, trpcInline: { status: 'pending', message: 'Testing tRPC client (example.hiInline)...' } }));
      
      // Use tRPC client directly
      const { trpcClient } = await import('@/lib/trpc');
      const data = await trpcClient.example.hiInline.query({ name: 'Inline Debug Test' });
      
      setTests(prev => ({ 
        ...prev, 
        trpcInline: { 
          status: 'success', 
          message: '✅ tRPC inline client working!', 
          data 
        } 
      }));
    } catch (error: any) {
      console.error('❌ tRPC inline client failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        trpcInline: { 
          status: 'error', 
          message: `❌ tRPC inline connection failed: ${error.message}` 
        } 
      }));
    }

    // Test 5: Vendor endpoints
    try {
      setTests(prev => ({ ...prev, vendors: { status: 'pending', message: 'Testing vendor endpoints...' } }));
      
      // Use tRPC client for vendor endpoints
      const { trpcClient } = await import('@/lib/trpc');
      const data = await trpcClient.vendors.get.query();
      
      if ((data as any).error) {
        throw new Error((data as any).message || 'Vendor endpoint returned error');
      }
      
      setTests(prev => ({ 
        ...prev, 
        vendors: { 
          status: 'success', 
          message: `✅ Vendor endpoint working: ${(data as any).vendors ? (data as any).vendors.length + ' vendors' : 'fallback response'}`, 
          data 
        } 
      }));
    } catch (error: any) {
      console.error('❌ Vendor endpoints failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        vendors: { 
          status: 'error', 
          message: `❌ Vendor endpoints failed: ${error.message}` 
        } 
      }));
    }

    // Test 6: Vendor by slug test
    try {
      setTests(prev => ({ ...prev, vendorBySlug: { status: 'pending', message: 'Testing vendor by slug...' } }));
      
      const { trpcClient } = await import('@/lib/trpc');
      const data = await trpcClient.vendors.getBySlug.query();
      
      if ((data as any).error) {
        throw new Error((data as any).message || 'Vendor by slug endpoint returned error');
      }
      
      setTests(prev => ({ 
        ...prev, 
        vendorBySlug: { 
          status: 'success', 
          message: `✅ Vendor by slug endpoint working: ${(data as any).vendor ? (data as any).vendor.name : 'fallback response'}`, 
          data 
        } 
      }));
    } catch (error: any) {
      console.error('❌ Vendor by slug failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        vendorBySlug: { 
          status: 'error', 
          message: `❌ Vendor by slug failed: ${error.message}` 
        } 
      }));
    }

    // Test 7: Cart functionality
    try {
      setTests(prev => ({ ...prev, cart: { status: 'pending', message: 'Testing cart functionality...' } }));
      
      const { CartManager } = await import('@/utils/cart');
      
      // Test cart operations
      await CartManager.clearCart();
      const emptyCart = await CartManager.getCart();
      
      if (emptyCart === null) {
        setTests(prev => ({ 
          ...prev, 
          cart: { 
            status: 'success', 
            message: '✅ Cart functionality working', 
            data: { emptyCart: 'null', operations: 'clear, get' }
          } 
        }));
      } else {
        throw new Error('Cart should be null after clearing');
      }
    } catch (error: any) {
      console.error('❌ Cart test failed:', error.message);
      setTests(prev => ({ 
        ...prev, 
        cart: { 
          status: 'error', 
          message: `❌ Cart test failed: ${error.message}` 
        } 
      }));
    }

    setIsRunning(false);
  };

  const renderTestResult = (testName: string, test: any) => {
    const getIcon = () => {
      switch (test.status) {
        case 'success':
          return <CheckCircle size={20} color="#10B981" />;
        case 'error':
          return <XCircle size={20} color="#EF4444" />;
        case 'pending':
          return <RefreshCw size={20} color="#F59E0B" />;
        default:
          return <Wifi size={20} color="#8E8E93" />;
      }
    };

    const getBackgroundColor = () => {
      switch (test.status) {
        case 'success':
          return '#DCFCE7';
        case 'error':
          return '#FEE2E2';
        case 'pending':
          return '#FEF3C7';
        default:
          return '#F3F4F6';
      }
    };

    return (
      <View key={testName} style={[styles.testResult, { backgroundColor: getBackgroundColor() }]}>
        <View style={styles.testHeader}>
          {getIcon()}
          <Text style={styles.testName}>{testName}</Text>
        </View>
        <Text style={styles.testMessage}>{test.message}</Text>
        {test.data && (
          <TouchableOpacity 
            onPress={() => console.log('Test Data:', JSON.stringify(test.data, null, 2))}
            style={styles.dataButton}
          >
            <Text style={styles.dataButtonText}>View Data</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Server size={24} color="#FF6B35" />
          <Text style={styles.title}>Connectivity Debug</Text>
        </View>

        <TouchableOpacity 
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runConnectivityTests}
          disabled={isRunning}
        >
          <RefreshCw size={20} color="white" />
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running Tests...' : 'Run Connectivity Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.testsContainer}>
          {Object.entries(tests).map(([testName, test]) => 
            renderTestResult(testName, test)
          )}
        </View>

        {Object.keys(tests).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Tap &quot;Run Connectivity Tests&quot; to start debugging</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  runButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  runButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  runButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testsContainer: {
    gap: 12,
  },
  testResult: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  testMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dataButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dataButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});