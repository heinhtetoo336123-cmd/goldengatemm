import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const env = import.meta.env;

// Clean-slate Firebase configuration loaded strictly from environment variables (VITE_FIREBASE_*)
export const firebaseConfig = {
  apiKey: (env.VITE_FIREBASE_API_KEY || "").trim(),
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (env.VITE_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (env.VITE_FIREBASE_APP_ID || "").trim(),
};

const firestoreDatabaseId = (env.VITE_FIREBASE_DATABASE_ID || "").trim();

export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  !firebaseConfig.apiKey.startsWith("YOUR_NEW_") &&
  !firebaseConfig.projectId.startsWith("YOUR_NEW_")
);

// Initialize Firebase singletons only when configured
export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const firestore: Firestore | null = firebaseApp
  ? (firestoreDatabaseId ? getFirestore(firebaseApp, firestoreDatabaseId) : getFirestore(firebaseApp))
  : null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser ?? null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate live connection to Firestore on app boot
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isFirebaseConfigured || !firestore) {
    return false;
  }
  try {
    await getDocFromServer(doc(firestore, 'application_links', '_health_check'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or unreachable — falling back to local offline queue.');
      return false;
    }
    return true;
  }
}
