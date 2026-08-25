import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.humanidfi.app',
  appName: 'Humanity Ledger',
  webDir: 'public', // Using public as dummy dir, we use remote server

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
    // [iOS FIX] Allow audio and video to play inline (not fullscreen) in WKWebView.
    // Without this, audio elements in CustomAudioPlayer trigger the system media player
    // and can't be played within the app UI. Required for voice notes & WebRTC.
    allowsInlineMediaPlayback: true,
    // [iOS FIX] Allow audio-only content to autoplay without a user gesture lock.
    // This is needed so that incoming call audio (remoteAudioRef) plays immediately
    // when the WebRTC stream is attached after the user taps "Answer".
    mediaTypesRequiringUserActionForPlayback: 'none' as any,
  }
};

export default config;
