import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDfQ8FTdhl9CYezl4MGfRf7vBZ2_qOR_ds',
  authDomain: 'mindify-29823.firebaseapp.com',
  projectId: 'mindify-29823',
  storageBucket: 'mindify-29823.firebasestorage.app',
  messagingSenderId: '522298761378',
  appId: '1:522298761378:web:1d21cfb47f95096c4ff7fb',
};

// Uygulama zaten çalışıyorsa tekrar initialize etme
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth   = getAuth(app);
export const db     = getFirestore(app);
export const storage = getStorage(app);