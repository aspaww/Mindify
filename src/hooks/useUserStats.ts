import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Veri Yapısı
interface UserStats {
  streak: number;
  xpToday: number;
  weeklyXp: number;
  totalXp: number;
  weeklyLog: boolean[];
  lastActive: Timestamp | null;
  completedToday: string[];
}

// Yardımcı Fonksiyonlar
const isSameDay = (d1, d2) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isYesterday = (d1, d2) => { const y = new Date(d2); y.setDate(y.getDate() - 1); return isSameDay(d1, y); };
const areDatesInSameWeek = (d1, d2) => {
  if (!d1 || !d2) return false;
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  return getMonday(d1).getTime() === getMonday(d2).getTime();
};
const calculateMultiplier = (streak: number) => {
  if (!streak || streak <= 1) return 1.0;
  const multiplier = 1 + (streak / 10);
  return Math.min(multiplier, 2.0);
};

// İşte "Beyin" dediğimiz Custom Hook
export default function useUserStats() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isUpdating = useRef(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (!user) {
        setStats(null);
        setLoading(true);
        navigation.dispatch(StackActions.replace('Login'));
        return;
      }

      const statsRef = doc(db, 'users', user.uid, 'stats', 'data');
      unsubscribeSnapshot = onSnapshot(statsRef, (docSnap) => {

        if (docSnap.metadata.hasPendingWrites) {
          console.log("--- [FİLTRE] Yankı algılandı, atlanıyor.");
          return;
        }

        if (!docSnap.exists()) {
          if (isUpdating.current) return;
          console.log("--- [YENİ KULLANICI] Kayıt bulunamadı, oluşturma ve güncelleme akışı başlıyor...");
          isUpdating.current = true;
          
          const defaultStats: UserStats = {
            streak: 0, xpToday: 0, weeklyXp: 0, totalXp: 0,
            weeklyLog: [false, false, false, false, false, false, false],
            lastActive: null, completedToday: [],
          };
          
          setStats(defaultStats);
          setLoading(false);

          setDoc(statsRef, defaultStats).then(() => {
            console.log("--- [YENİ KULLANICI] Adım 1: Varsayılan kayıt oluşturuldu.");
            const todayIndex = (new Date().getDay() + 6) % 7;
            const initialWeeklyLog = [false, false, false, false, false, false, false];
            initialWeeklyLog[todayIndex] = true;
            const initialXp = 50;

            console.log("--- [YENİ KULLANICI] Adım 2: İlk gün bonusu veriliyor...");
            updateDoc(statsRef, {
                streak: 1,
                weeklyLog: initialWeeklyLog,
                lastActive: serverTimestamp(),
                xpToday: initialXp,
                weeklyXp: initialXp,
                totalXp: initialXp,
                completedToday: ["dailyLogin"]
            }).finally(() => {
              isUpdating.current = false;
            });
          });
          return;
        }

        const currentStats = docSnap.data() as UserStats;
        console.log("--- [VERİ GELDİ] Arayüz güncelleniyor. Mevcut Streak:", currentStats.streak);
        setStats(currentStats);
        setLoading(false);

        const today = new Date();
        const lastActiveDate = currentStats.lastActive?.toDate();

        if ((!lastActiveDate || !isSameDay(lastActiveDate, today)) && !isUpdating.current) {
          isUpdating.current = true;
          console.log("--- [GÜNCELLEME] Yeni gün tespit edildi, güncelleme başlıyor...");
          
          const updatePayload: any = { lastActive: serverTimestamp() };
          const streak = currentStats.streak || 0;
          
          updatePayload.completedToday = [];
          if (!lastActiveDate || !areDatesInSameWeek(lastActiveDate, today)) {
            updatePayload.weeklyXp = 0;
          }
          
          const multiplier = calculateMultiplier(streak);
          const dailyXpGained = Math.round(50 * multiplier);
          updatePayload.xpToday = dailyXpGained;
          updatePayload.weeklyXp = (updatePayload.weeklyXp === 0 ? 0 : (currentStats.weeklyXp || 0)) + dailyXpGained;
          updatePayload.totalXp = (currentStats.totalXp || 0) + dailyXpGained;
          updatePayload.completedToday.push("dailyLogin");
          
          updatePayload.streak = (lastActiveDate && isYesterday(lastActiveDate, today)) ? streak + 1 : 1;
          
          const todayIndex = (today.getDay() + 6) % 7;
          const newWeeklyLog = updatePayload.weeklyXp === 0
              ? [false, false, false, false, false, false, false]
              : [...(currentStats.weeklyLog || [false,false,false,false,false,false,false])];
          newWeeklyLog[todayIndex] = true;
          updatePayload.weeklyLog = newWeeklyLog;

          console.log("--- [GÜNCELLEME] Payload:", updatePayload);
          updateDoc(statsRef, updatePayload).finally(() => {
            isUpdating.current = false;
          });
        }
      });
    });

    return () => unsubscribeAuth();
  }, [navigation]); // navigation'ı dependency array'e ekliyoruz.

  return { stats, loading };
}