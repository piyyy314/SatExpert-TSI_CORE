import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
/// <reference types="vite/client" />
import { TacticalEvent, Coordinates, JammingSession } from '../types';

export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || 'AIzaSyDGlpyrSMIYSZNrNdW3A2kiHx230TGjuQ4',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'project-a799448d-2c60-4e34-a3f.firebaseapp.com',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'project-a799448d-2c60-4e34-a3f',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'project-a799448d-2c60-4e34-a3f.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '1074516085500',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || '1:1074516085500:web:4692fb95cb82aa1d27a579',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || '',
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || 'ai-studio-f55368ed-a497-4968-b73a-50421b2c02b7',
};

// Initialize the Firebase core application
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// CRITICAL: The app will break without specifying the firestoreDatabaseId
// Allowing Firestore to connect natively using modern web socket protocols
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

// Connection test collection string
const TEST_REF_PATH = 'test/connection';

// Verify Firestore Server Connection
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, TEST_REF_PATH));
    console.log("Firebase connection established successfully.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
    return false;
  }
}

// Manually trigger Firestore network reconnection
export async function reconnectFirestore() {
  try {
    await disableNetwork(db);
    await enableNetwork(db);
    console.log("Firestore network re-enabled successfully.");
    return true;
  } catch (error) {
    console.error("Failed to cycle Firestore network state:", error);
    return false;
  }
}

// Ensure the Google Authentication provider is loaded
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication methods
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Authentication popup integration rejected:", error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Failed to terminate active authentication session:", error);
    throw error;
  }
}

// Standard Operation Enum for precise error reporting
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Settings Persistence Wrapper
export interface UserSettingsDoc {
  lat: number;
  lng: number;
  selectedSatId: string;
  defcon: number;
  isStealthMode: boolean;
  updatedAt: string;
}

export async function saveUserSettingsToCloud(userId: string, settings: UserSettingsDoc) {
  const path = `users/${userId}/settings/current`;
  try {
    await setDoc(doc(db, 'users', userId, 'settings', 'current'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserSettingsFromCloud(userId: string): Promise<UserSettingsDoc | null> {
  const path = `users/${userId}/settings/current`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'settings', 'current'));
    if (docSnap.exists()) {
      return docSnap.data() as UserSettingsDoc;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Operational Logs (WORM: Write Once, Read Many) Persistence Wrapper
export async function saveEventToCloud(userId: string, event: TacticalEvent) {
  const eventId = event.id;
  const path = `users/${userId}/events/${eventId}`;
  try {
    const payload = {
      id: event.id,
      timestamp: event.timestamp,
      satName: event.satName,
      satId: event.satId,
      status: event.status,
      detail: event.detail,
      userId: userId
    };
    await setDoc(doc(db, 'users', userId, 'events', eventId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchEventsFromCloud(userId: string): Promise<TacticalEvent[]> {
  const path = `users/${userId}/events`;
  try {
    const q = query(
      collection(db, 'users', userId, 'events'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const events: TacticalEvent[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: data.id,
        timestamp: data.timestamp,
        satName: data.satName,
        satId: data.satId,
        status: data.status,
        detail: data.detail
      });
    });
    return events;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Jamming Sessions Persistence Wrapper
export async function saveJammingSessionToCloud(userId: string, session: JammingSession) {
  const path = `users/${userId}/jamming_sessions/${session.id}`;
  try {
    const payload = {
      id: session.id,
      timestamp: session.timestamp,
      targetSatellite: session.targetSatellite,
      frequency: session.frequency,
      power: session.power,
      effectiveness: session.effectiveness,
      userId: userId
    };
    await setDoc(doc(db, 'users', userId, 'jamming_sessions', session.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchJammingSessionsFromCloud(userId: string): Promise<JammingSession[]> {
  const path = `users/${userId}/jamming_sessions`;
  try {
    const q = query(
      collection(db, 'users', userId, 'jamming_sessions'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const sessions: JammingSession[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: data.id,
        timestamp: data.timestamp,
        targetSatellite: data.targetSatellite,
        frequency: Number(data.frequency || 0),
        power: Number(data.power || 0),
        effectiveness: Number(data.effectiveness || 0)
      });
    });
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
