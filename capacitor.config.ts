import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyflow.app',
  appName: 'StudyFlow',
  webDir: 'out',
  server: {
    // If wrapping a live web app url, uncomment and set the live URL:
    // url: 'https://studyflow.vercel.app',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0f1e',
      showSpinner: false,
    }
  }
};

export default config;
