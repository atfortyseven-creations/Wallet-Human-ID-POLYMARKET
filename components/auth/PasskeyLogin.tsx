'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

interface PasskeyLoginProps {
  onSuccess?: (userData: { userId: string; email: string; name?: string | null }) => void;
  onError?: (error: string) => void;
}

export function PasskeyLogin({ onSuccess, onError }: PasskeyLoginProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasskeyLogin = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Get authentication options from server
      const optionsRes = await fetch('/api/auth/webauthn/authenticate');
      if (!optionsRes.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsRes.json();

      // 2. Trigger biometric prompt (FaceID/TouchID/Fingerprint)
      const credential = await startAuthentication(options);

      // 3. Verify with backend and create session
      const verifyRes = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const result = await verifyRes.json();

      if (result.verified) {
        onSuccess?.(result);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Biometric authentication failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="legendary-passkey-login">
      <button
        onClick={handlePasskeyLogin}
        disabled={isAuthenticating}
        className="passkey-button"
      >
        {isAuthenticating ? (
          <div className="flex items-center gap-3">
            <div className="spinner" />
            <span>Verificando biometría...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Login with FaceID/TouchID</span>
          </div>
        )}
      </button>

      {error && (
        <div className="error-message">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .legendary-passkey-login {
          width: 100%;
        }

        .passkey-button {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .passkey-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .passkey-button:active:not(:disabled) {
          transform: translateY(0px);
        }

        .passkey-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

