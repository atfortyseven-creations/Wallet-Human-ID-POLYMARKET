import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.humanidfi.app',
  appName: 'Humanity Ledger',
  webDir: 'public', // Using public as dummy dir, we use remote server
  bundledWebRuntime: false,
  server: {
    url: 'https://humanidfi.com',
    cleartext: false, // Force HTTPS
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  // Extra configuration to ensure WebRTC works well in Capacitor
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
  }
};

export default config;
