import { useEffect } from 'react';
import { AppState } from 'react-native';
import { auth } from '../services/firebase';

const INACTIVE_MS = 60 * 60 * 1000; // 1 saat

export default function useAutoLogout(onLogout: () => void) {
  useEffect(() => {
    let backgroundAt: number | null = null;

    const sub = AppState.addEventListener('change', next => {
      if (next === 'background') backgroundAt = Date.now();
      if (next === 'active' && backgroundAt) {
        if (Date.now() - backgroundAt >= INACTIVE_MS) {
          auth.signOut().then(onLogout);
        }
        backgroundAt = null;
      }
    });

    return () => sub.remove();
  }, [onLogout]);
}