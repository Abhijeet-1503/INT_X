// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

const env = import.meta.env;

// Support both build-time Vite envs and runtime-injected window.__APP_ENV__ (via /env.js)
let runtimeEnv: Record<string, string> = {};
if (typeof window !== 'undefined') {
  const w = (window as unknown) as Record<string, unknown>;
  if (w.__APP_ENV__ && typeof w.__APP_ENV__ === 'object') {
    runtimeEnv = Object.fromEntries(Object.entries(w.__APP_ENV__ as Record<string, unknown>).map(([k, v]) => [k, String(v)]));
  }
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || runtimeEnv.VITE_FIREBASE_API_KEY || "AIzaSyDrNM4bWhdh_7sNQ65o4notdD6w7NMDSdU",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || runtimeEnv.VITE_FIREBASE_AUTH_DOMAIN || "sample-firebase-ai-app-948ed.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || runtimeEnv.VITE_FIREBASE_PROJECT_ID || "sample-firebase-ai-app-948ed",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || runtimeEnv.VITE_FIREBASE_STORAGE_BUCKET || "sample-firebase-ai-app-948ed.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || runtimeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "342192194469",
  appId: env.VITE_FIREBASE_APP_ID || runtimeEnv.VITE_FIREBASE_APP_ID || "1:342192194469:web:7a70635d08efa15767de4c",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || runtimeEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-LCYQW6EZY2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize analytics only when supported (browser) and when measurementId is present
if (typeof window !== 'undefined') {
  ;(async () => {
    try {
      const supported = await isAnalyticsSupported();
      if (supported && process.env.VITE_FIREBASE_MEASUREMENT_ID) {
        getAnalytics(app);
      }
    } catch (err) {
      // ignore analytics init errors in non-browser or unsupported environments
      // console.debug('Analytics not supported or failed to initialize', err)
    }
  })()
}

export default app;
