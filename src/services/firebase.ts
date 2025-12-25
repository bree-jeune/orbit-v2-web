
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { STORAGE_KEYS } from '../config/constants';
import { OrbitItem } from '../engine/types';

// Initialize Firebase only if config is present
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

let db = null;
let isInitialized = false;
let analytics = null;

if (firebaseConfig.apiKey) {
    if (getApps().length === 0) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        analytics = getAnalytics(app);
        isInitialized = true;
        console.log('[Firebase] Initialized with Analytics');
    }
} else {
    console.log('[Firebase] Skipping initialization - no config found');
}

export const firebaseService = {
    isAvailable: isInitialized,

    /**
     * Sync complete state to cloud
     * For MVP, we just overwrite a single document for the user
     * In production, this would be user-specific (auth required)
     */
    async syncState(items: OrbitItem[]) {
        if (!db) return;

        // For MVP demo, we use a single global 'demo-user' doc
        // In real app, use auth.currentUser.uid
        const userId = localStorage.getItem('orbit_user_id') || 'demo_user';

        try {
            await setDoc(doc(db, 'orbits', userId), {
                items,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn('[Firebase] Sync failed', e);
        }
    },

    /**
     * Subscribe to remote changes
     */
    subscribeToRemote(callback: (items: OrbitItem[]) => void) {
        if (!db) return () => { };

        const userId = localStorage.getItem('orbit_user_id') || 'demo_user';

        return onSnapshot(doc(db, 'orbits', userId), (doc) => {
            const data = doc.data();
            if (data && data.items) {
                callback(data.items as OrbitItem[]);
            }
        });
    }
};
