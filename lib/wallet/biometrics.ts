/**
 * Biometric Authentication Service (WebAuthn/Passkeys)
 * Secure transaction signing and wallet access
 */

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';

// API Endpoints
const API_BASE = '/api/auth/webauthn';

export interface BiometricMonitor {
  isAvailable: boolean;
  type: 'face' | 'fingerprint' | 'unknown';
}

/**
 * Check if biometrics are available on device
 */
export async function checkBiometricAvailability(): Promise<BiometricMonitor> {
  if (typeof window === 'undefined') return { isAvailable: false, type: 'unknown' };

  try {
    // Check for WebAuthn support
    const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    
    // Attempt to guess type (not precise in web, but good enough for UI hints)
    // Most mobile devices/macs allow this
    return {
      isAvailable,
      type: 'unknown' // Browsers don't strictly expose "FaceID" vs "TouchID" via API, usually generic
    };
  } catch (e) {
    return { isAvailable: false, type: 'unknown' };
  }
}

/**
 * Register a new passkey/biometric credential
 */
export async function registerBiometric(deviceName: string): Promise<{ success: boolean; msg?: string }> {
  try {
    // 1. Get registration options from server
    const optionsResp = await fetch(`${API_BASE}/register/options`);
    if (!optionsResp.ok) throw new Error('Failed to fetch registration options');
    
    const options: PublicKeyCredentialCreationOptionsJSON = await optionsResp.json();

    // 2. Prompt user for biometrics
    const attestationResp = await startRegistration(options);

    // 3. Verify on server
    const verificationResp = await fetch(`${API_BASE}/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attestation: attestationResp,
        deviceName
      }),
    });

    if (!verificationResp.ok) throw new Error('Biometric registration failed');
    return { success: true };

  } catch (error: any) {
    console.error('Biometric registration error:', error);
    return { success: false, msg: error.message };
  }
}

/**
 * Authenticate using biometrics
 */
export async function authenticateBiometric(): Promise<{ success: boolean; verified?: boolean; msg?: string }> {
  try {
    // 1. Get auth options from server
    const optionsResp = await fetch(`${API_BASE}/authenticate/options`);
    if (!optionsResp.ok) throw new Error('Failed to fetch authentication options');
    
    const options: PublicKeyCredentialRequestOptionsJSON = await optionsResp.json();

    // 2. Prompt user
    const assertionResp = await startAuthentication(options);

    // 3. Verify
    const verificationResp = await fetch(`${API_BASE}/authenticate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assertionResp),
    });

    if (!verificationResp.ok) throw new Error('Biometric authentication failed');
    
    return { success: true, verified: true };
  } catch (error: any) {
    console.error('Biometric auth error:', error);
    return { success: false, msg: error.message };
  }
}
