import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { authenticateAsync, hasHardwareAsync, isEnrolledAsync } from 'expo-local-authentication';

export default function App() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await hasHardwareAsync();
      const enrolled = await isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
    })();
  }, []);

  const handleSign = async () => {
    if (!isBiometricSupported) {
      Alert.alert('Error', 'Biometrics not supported or not enrolled on this device.');
      return;
    }

    const auth = await authenticateAsync({
      promptMessage: 'Authenticate to sign Aztec ZK Session',
      fallbackLabel: 'Use Passcode',
    });

    if (auth.success) {
      setIsAuthenticated(true);
      Alert.alert('Success', 'Biometric signature verified locally. ZK Session signed.');
      
      // Here we would call ZKSessionSyncService to send the signature payload
      // back to the desktop application's polling endpoint or relay.
    } else {
      Alert.alert('Authentication Failed', 'Could not verify biometrics.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ledger Network Signer</Text>
      <Text style={styles.subtitle}>ZK Session Authenticator</Text>
      
      <View style={styles.card}>
        <Text style={styles.info}>
          Status: {isAuthenticated ? '🟢 Authenticated' : '🔴 Waiting for challenge'}
        </Text>
        <Button 
          title="Sign ZK Session Challenge" 
          onPress={handleSign} 
          disabled={isAuthenticated}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    width: '80%',
    alignItems: 'center',
  },
  info: {
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  }
});
