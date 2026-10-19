/// <reference types="vite/client" />
import rawConfig from '../firebase-applet-config.json';

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
 * Prioritizes environment variables (VITE_FIREBASE_*) so secrets can be provided via
 * environment management or CI/CD pipelines without ever committing sensitive API keys
 * into source control (e.g. GitHub).
 * Falls back gracefully to local firebase-applet-config.json in dev environments.
 */
export const firebaseConfig: FirebaseAppConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig?.apiKey || '',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig?.authDomain || '',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig?.projectId || '',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig?.storageBucket || '',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig?.messagingSenderId || '',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig?.appId || '',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || rawConfig?.measurementId || '',
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || rawConfig?.firestoreDatabaseId || 'ai-studio-f55368ed-a497-4968-b73a-50421b2c02b7',
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
