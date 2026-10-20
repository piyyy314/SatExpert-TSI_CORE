/// <reference types="vite/client" />
import exampleConfig from '../firebase-applet-config.example.json';

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
 * Safely resolve local dev config if present via Vite's dynamic glob
 * so that TypeScript does not fail with TS2307 on clean CI clones (e.g. GitHub Actions)
 * where firebase-applet-config.json is omitted by .gitignore.
 */
const localConfigs = (import.meta as any).glob 
  ? (import.meta as any).glob('../firebase-applet-config.json', { eager: true }) 
  : {};

const rawConfig: Record<string, any> = localConfigs['../firebase-applet-config.json']?.default 
  || localConfigs['../firebase-applet-config.json'] 
  || {};

/**
 * Hardened Firebase Configuration Loader
 * 
 * Prioritizes environment variables (VITE_FIREBASE_*) so secrets can be provided via
 * environment management or CI/CD pipelines without ever committing sensitive API keys
 * into source control (e.g. GitHub).
 * Falls back gracefully to local dev config or example template.
 */
export const firebaseConfig: FirebaseAppConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey || '',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain || '',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId || '',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket || '',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId || '',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig.appId || '',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || rawConfig.measurementId || '',
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId || exampleConfig?.firestoreDatabaseId || 'ai-studio-f55368ed-a497-4968-b73a-50421b2c02b7',
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
