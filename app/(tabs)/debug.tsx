import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, CheckCircle, XCircle, Wifi, Server } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function DebugScreen() {
  const [tests, setTests] = useState<{
    [key: string]: { status: 'pending' | 'success' | 'error'; message: string; data?: any }
  }>({});
  const [isRunning, setIsRunning] = useState(false);

  // tRPC connectivity test
  const hiQuery = trpc.example.hi.useQuery({ name: 'Debug Test' }, {
    enabled: false, // Don't run automatically
  });

  const runConnectivityTests = async () => {
    setIsRunning(true);
    setTests({});

    // Test 1: Basic API endpoint
    try {
      setTests(prev => ({ ...prev, basicApi: { status: 'pending', message: 'Testing basic API...' } }));
      
      const response = await fetch('https://je86yffmqj9hqfu4somgm.rork.com/api/test', {
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
            message: 'Basic API connection successful', 
            data 
          } 
        }));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      setTests(prev => ({ 
        ...prev, 
        basicApi: { 
          status: 'error', 
          message: `Basic API failed: ${error.message}` 
        } 
      }));
    }

    // Test 2: tRPC endpoint
    try {
      setTests(prev => ({ ...prev, trpc: { status: 'pending', message: 'Testing tRPC...' } }));
      
      const result = await hiQuery.refetch();
      
      if (result.data) {
        setTests(prev => ({ 
          ...prev, 
          trpc: { 
            status: 'success', 
            message: 'tRPC connection successful', 
            data: result.data 
          } 
        }));
      } else {
        throw new Error('No data returned from tRPC');
      }
    } catch (error: any) {
      setTests(prev => ({ 
        ...prev, 
        trpc: { 
          status: 'error', 
          message: `tRPC failed: ${error.message}` 
        } 
      }));
    }

    // Test 3: Vendor endpoints
    try {
      setTests(prev => ({ ...prev, vendors: { status: 'pending', message: 'Testing vendor endpoints...' } }));
      
      const response = await fetch('https://je86yffmqj9hqfu4somgm.rork.com/api/trpc/vendors.get', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setTests(prev => ({ 
          ...prev, 
          vendors: { 
            status: 'success', 
            message: 'Vendor endpoints working', 
            data 
          } 
        }));
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      setTests(prev => ({ 
        ...prev, 
        vendors: { 
          status: 'error', 
          message: `Vendor endpoints failed: ${error.message}` 
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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