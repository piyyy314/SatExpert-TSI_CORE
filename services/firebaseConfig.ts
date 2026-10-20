/// <reference types="vite/client" />
import { firebaseConfig as directConfig } from './firebaseService';

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
 * Re-exports the environment-driven Firebase configuration directly sourced
 * from import.meta.env matching .env.example, eliminating any reliance on
 * non-existent json files on clean checkouts.
 */
export const firebaseConfig: FirebaseAppConfig = directConfig;

/**
 * Safely masks a sensitive API key for logging or diagnostic display,
 * showing only the prefix and suffix (e.g. AIzaSyD...uQ4).
 */
export function maskSecretKey(key: string): string {
  if (!key || key.length <= 8) return '********';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

export default firebaseConfig;
