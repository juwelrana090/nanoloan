/**
 * Network Debug Screen
 * Add this screen to test API connectivity and diagnose issues
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  runFullDiagnostics,
  testNetworkConnectivity,
  testAuthEndpoint,
} from '@/shared/utils/networkDebug';
import {
  runComprehensiveDiagnostics,
  getDiagnosticSummary,
} from '@/shared/utils/networkDiagnostics';

export const NetworkDebugScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const reduxState = useAppSelector((state) => state);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const diagnostics = await runFullDiagnostics();
      setResults(diagnostics);
      console.log('🔍 Diagnostic Results:', diagnostics);
    } catch (error: any) {
      console.error('Diagnostics failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testConnectivityOnly = async () => {
    setLoading(true);
    try {
      const result = await testNetworkConnectivity();
      setResults({ connectivity: result });
      console.log('Connectivity Result:', result);
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveTest = async () => {
    setLoading(true);
    try {
      const diagnostics = await runComprehensiveDiagnostics();
      const summary = getDiagnosticSummary(diagnostics);
      setResults({ comprehensive: diagnostics, summary });
      console.log('🔍 Comprehensive Diagnostic Results:', diagnostics);
      console.log('📊 Summary:', summary);
    } catch (error: any) {
      console.error('Comprehensive diagnostics failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🔍 Network Debug Screen</Text>

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={testConnectivityOnly}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Connectivity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={runDiagnostics}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Quick Diagnostics</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonComprehensive]}
          onPress={runComprehensiveTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🔍 Run Comprehensive Diagnostics</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C897" />
            <Text style={styles.loadingText}>Running diagnostics...</Text>
          </View>
        )}

        {/* Results */}
        {results && !loading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Results:</Text>

            {results.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error:</Text>
                <Text style={styles.errorText}>{results.error}</Text>
              </View>
            )}

            {/* Comprehensive Diagnostics Results */}
            {results.comprehensive && (
              <>
                {results.summary && (
                  <View style={[styles.resultBox, styles.summaryBox]}>
                    <Text style={styles.resultTitle}>📊 Diagnostic Summary:</Text>
                    <Text style={styles.resultText}>
                      Total Tests: {results.summary.total}
                    </Text>
                    <Text style={styles.resultText}>
                      ✅ Passed: {results.summary.passed}
                    </Text>
                    <Text style={styles.resultText}>
                      ❌ Failed: {results.summary.failed}
                    </Text>
                    <Text style={styles.resultText}>
                      Success Rate: {results.summary.successRate}
                    </Text>
                  </View>
                )}

                {results.comprehensive.map((result: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.resultBox,
                      result.success ? styles.successBox : styles.errorBox,
                    ]}
                  >
                    <Text style={styles.resultTitle}>
                      {result.success ? '✅' : '❌'} {result.test}
                    </Text>
                    <Text style={styles.resultText}>{result.message}</Text>
                    {result.details && (
                      <Text style={styles.detailsText}>
                        {JSON.stringify(result.details, null, 2)}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Regular Results */}
            {results.connectivity && !results.comprehensive && (
              <View
                style={[
                  styles.resultBox,
                  results.connectivity.success ? styles.successBox : styles.errorBox,
                ]}
              >
                <Text style={styles.resultTitle}>Network Connectivity:</Text>
                <Text style={styles.resultText}>
                  {results.connectivity.success ? '✅' : '❌'} {results.connectivity.message}
                </Text>
                {results.connectivity.details && (
                  <Text style={styles.detailsText}>
                    {JSON.stringify(results.connectivity.details, null, 2)}
                  </Text>
                )}
              </View>
            )}

            {results.authEndpoint && !results.comprehensive && (
              <View
                style={[
                  styles.resultBox,
                  results.authEndpoint.success ? styles.successBox : styles.errorBox,
                ]}
              >
                <Text style={styles.resultTitle}>Auth Endpoint:</Text>
                <Text style={styles.resultText}>
                  {results.authEndpoint.success ? '✅' : '❌'} {results.authEndpoint.message}
                </Text>
                {results.authEndpoint.details && (
                  <Text style={styles.detailsText}>
                    {JSON.stringify(results.authEndpoint.details, null, 2)}
                  </Text>
                )}
              </View>
            )}

            {results.storage && !results.comprehensive && (
              <View
                style={[
                  styles.resultBox,
                  results.storage.success ? styles.successBox : styles.errorBox,
                ]}
              >
                <Text style={styles.resultTitle}>Storage:</Text>
                <Text style={styles.resultText}>
                  {results.storage.success ? '✅' : '❌'} {results.storage.message}
                </Text>
                {results.storage.details && (
                  <Text style={styles.detailsText}>
                    {JSON.stringify(results.storage.details, null, 2)}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Redux State */}
        <View style={styles.reduxContainer}>
          <Text style={styles.sectionTitle}>Redux State:</Text>
          <Text style={styles.reduxText}>
            Is Authenticated: {reduxState.auth?.isAuthenticated ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.reduxText}>
            Has Token: {reduxState.auth?.token ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.reduxText}>
            Token Length: {reduxState.auth?.token?.length || 0}
          </Text>
          <Text style={styles.reduxText}>
            Has User: {reduxState.auth?.user ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Troubleshooting Steps:</Text>
          <Text style={styles.instructionsText}>
            1. Check your internet connection
          </Text>
          <Text style={styles.instructionsText}>
            2. Verify API URL in .env file
          </Text>
          <Text style={styles.instructionsText}>
            3. Check if server is running
          </Text>
          <Text style={styles.instructionsText}>
            4. Look at console logs for detailed errors
          </Text>
          <Text style={styles.instructionsText}>
            5. Try clearing app cache and restart
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#00C897',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#0DB7AF',
  },
  buttonComprehensive: {
    backgroundColor: '#FF6B6B',
    marginTop: 10,
    padding: 18,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  summaryBox: {
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#721c24',
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
  },
  reduxContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reduxText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  instructionsContainer: {
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#856404',
  },
});

export default NetworkDebugScreen;
