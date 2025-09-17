import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut, // <-- 1. ADIM: signOut'u Firebase'den import et
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<void> { // Promise<UserCredential> yerine void daha doğru olabilir, çünkü asıl credential'ı kullanmıyoruz.
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
}

export function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// --- 2. ADIM: İşte eksik olan fonksiyon ---
export function logout(): Promise<void> {
  return signOut(auth);
}