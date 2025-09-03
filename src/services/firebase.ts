//@ts-nocheck
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyDfQ8FTdhl9CYezl4MGfRf7vBZ2_qOR_ds',
  authDomain: 'mindify-29823.firebaseapp.com',
  projectId: 'mindify-29823',
  storageBucket: 'mindify-29823.firebasestorage.app',
  messagingSenderId: '522298761378',
  appId: '1:522298761378:web:1d21cfb47f95096c4ff7fb',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export async function addTopic(
  path: string[],
  title: string,
  description?: string
) {
  let colRef = collection(db, 'topics', ...path);
  const docRef = await addDoc(colRef, {
    title,
    description,
    createdAt: new Date(),
  });
  return docRef.id;
}

export const auth = initializeAuth(app, {
  persistence: require('firebase/auth').getReactNativePersistence(AsyncStorage),
});
export const db     = getFirestore(app);
export const storage = getStorage(app);