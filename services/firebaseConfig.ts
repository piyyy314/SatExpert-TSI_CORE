/// <reference types="vite/client" />

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId: string;
}

/**
 * Hardened Firebase Configuration Loader
 * 
 * Safely resolves configuration prioritizing environment variables (VITE_FIREBASE_*),
 * falling back to local firebase-applet-config.json via Vite's static compile-time glob
 * (which prevents TS2307 on clean CI runners where the file is omitted by .gitignore),
 * and defaulting to the configured project properties.
 */
const localConfigs = import.meta.glob<Record<string, any>>('../firebase-applet-config.json', { eager: true });
const rawConfig: Record<string, any> = localConfigs['../firebase-applet-config.json']?.default 
  || localConfigs['../firebase-applet-config.json'] 
  || {};

export const firebaseConfig: FirebaseAppConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey || 'AIzaSyDGlpyrSMIYSZNrNdW3A2kiHx230TGjuQ4',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain || 'project-a799448d-2c60-4e34-a3f.firebaseapp.com',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId || 'project-a799448d-2c60-4e34-a3f',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket || 'project-a799448d-2c60-4e34-a3f.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId || '1074516085500',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig.appId || '1:1074516085500:web:4692fb95cb82aa1d27a579',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || rawConfig.measurementId || '',
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId || 'ai-studio-f55368ed-a497-4968-b73a-50421b2c02b7',
};

/**
 * Safely masks a sensitive API key for logging or diagnostic display,
 * showing only the prefix and suffix (e.g. AIzaSyD...uQ4).
 */
export function maskSecretKey(key: string): string {
  if (!key || key.length <= 8) return '********';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

export default firebaseConfig;
