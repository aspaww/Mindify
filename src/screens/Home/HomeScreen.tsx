import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';
import { useNavigation, StackActions } from '@react-navigation/native';
import { auth, db } from '../../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../navigation/TabNavigator';

// Arayüz ve tipler
interface UserStats {
  level: number;
  streak: number;
  xpToday: number;
  weeklyLog: boolean[];
  lastActive: Timestamp | null;
}
type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'HomeTab'>;

// --- YARDIMCI FONKSİYONLAR ---
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


export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const flameAnimation = useRef(new Animated.Value(1)).current;
  const unsubscribeSnapshotRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (user) {
        const statsRef = doc(db, 'users', user.uid, 'stats', 'data');
        
        unsubscribeSnapshotRef.current = onSnapshot(statsRef, (docSnap) => {
          if (docSnap.metadata.hasPendingWrites) {
            return;
          }

          if (docSnap.exists()) {
            const data = docSnap.data() as UserStats;
            setStats(data);
            // SADECE MEVCUT KULLANICILAR İÇİN ÇALIŞACAK DÖNGÜ KIRMA VE GÜNCELLEME
            // YENİ KULLANICI İÇİN GEREKLİ GÜNCELLEME AŞAĞIDA, ELSE BLOĞUNDA YAPILIYOR
            const today = new Date();
            const lastActiveDate = data.lastActive?.toDate();
            if (lastActiveDate && isSameDay(lastActiveDate, today)) {
              setLoading(false);
            } else if (lastActiveDate !== null) { // Mevcut ama günü geçmiş kullanıcı
              checkAndUpdateStats(statsRef, data);
            }
            // Yeni kullanıcı (`lastActive: null`) ise hiçbir şey yapma,
            // çünkü onun güncellemesi zaten aşağıda `setDoc.then` ile yapıldı.
            // Sadece yüklemeyi bitir.
            else {
              setLoading(false);
            }

          } else {
            // --- YENİ MANTIĞIN TAMAMI BURADA ---
            console.log("--- [DURUM] Veri bulunamadı. Yeni kullanıcı için akış başlatılıyor... ---");
            const defaultStats: UserStats = {
              level: 0, streak: 0, xpToday: 0,
              weeklyLog: [false, false, false, false, false, false, false],
              lastActive: null,
            };
            
            // 1. Önce arayüzü hazırla ve yüklemeyi bitir
            setStats(defaultStats);
            setLoading(false);

            // 2. Varsayılan veriyi oluştur, BİTTİĞİNDE ise ilk gün güncellemesini yap
            setDoc(statsRef, defaultStats).then(() => {
                console.log("--- BAŞARI: setDoc (ilk kayıt) başarılı. Şimdi ilk gün güncellemesi tetikleniyor... ---");
                
                const todayIndex = (new Date().getDay() + 6) % 7;
                const initialWeeklyLog = [false, false, false, false, false, false, false];
                initialWeeklyLog[todayIndex] = true;

                // Bu güncelleme, dinleyici tarafından yakalanacak ve arayüzü (streak: 1) olarak güncelleyecek.
                updateDoc(statsRef, {
                    streak: 1,
                    weeklyLog: initialWeeklyLog,
                    lastActive: serverTimestamp()
                });
            }).catch(e => console.error("--- HATA: Yeni kullanıcı oluşturma akışında hata:", e));
          }
        }, (error) => {
            console.error("--- HATA: Firestore dinleme hatası:", error);
        });
      } else {
        navigation.dispatch(StackActions.replace('Login'));
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
      }
    };
  }, []);

  // Bu fonksiyon artık sadece günü geçmiş mevcut kullanıcılar için
  const checkAndUpdateStats = async (statsRef, currentStats: UserStats) => {
    console.log("--- [ADIM 5] 'checkAndUpdateStats' (mevcut kullanıcı için) çalıştı. ---");
    const today = new Date();
    const lastActiveDate = currentStats.lastActive?.toDate();
        
    let newWeeklyLog;
    if (lastActiveDate && areDatesInSameWeek(lastActiveDate, today)) {
      newWeeklyLog = [...currentStats.weeklyLog];
    } else {
      newWeeklyLog = [false, false, false, false, false, false, false];
    }

    const todayIndex = (today.getDay() + 6) % 7;
    newWeeklyLog[todayIndex] = true;

    const newStreak = (lastActiveDate && isYesterday(lastActiveDate, today)) ? currentStats.streak + 1 : 1;
    
    await updateDoc(statsRef, {
        streak: newStreak,
        weeklyLog: newWeeklyLog,
        lastActive: serverTimestamp(),
    });

    // Bu güncelleme zaten dinleyici tarafından yakalanacağı için burada setLoading'e gerek yok.
    console.log("--- [ADIM 7] Veritabanı (mevcut kullanıcı için) güncellendi. ---");
  };
  
  // Geri kalan her şey aynı...
  useEffect(() => {
    if (stats && stats.streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnimation, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(flameAnimation, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [stats?.streak]);

  if (loading) {
    return <GradientBg><ActivityIndicator size="large" color={Colors.white} style={{ flex: 1 }} /></GradientBg>;
  }
  if (!stats) {
    return <GradientBg><SafeAreaView style={styles.safeArea}><Text style={styles.headerTitle}>Kullanıcı verisi bulunamadı.</Text></SafeAreaView></GradientBg>;
  }

  const getFlameStyle = () => {
    let color = Colors.grey;
    let size = 20;
    if (stats.streak > 0) color = Colors.success;
    if (stats.streak >= 5) color = Colors.warning;
    if (stats.streak >= 10) color = Colors.error;
    if (stats.streak >= 7) size = 24;
    if (stats.streak >= 15) size = 28;
    return { color, fontSize: size };
  };
  
  function ActionRow({ icon, text, color, onPress }) {
    return (
      <Pressable style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}><Ionicons name={icon} size={22} color={color} /></View>
        <Text style={styles.actionText}>{text}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
      </Pressable>
    );
  }
  
  return (
    <GradientBg>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mindify</Text>
            <View style={styles.streakBox}>
              <Animated.View style={{ transform: [{ scale: flameAnimation }] }}>
                <Ionicons name="flame" style={getFlameStyle()} />
              </Animated.View>
              <Text style={[styles.streakText, { color: getFlameStyle().color }]}>{stats.streak}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seviye {stats.level}</Text>
            <View style={styles.barBack}><View style={[styles.barFront, { width: `${Math.min((stats.xpToday / 150) * 100, 100)}%` }]} /></View>
            <Text style={styles.xpText}>{stats.xpToday}/150 XP</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bu Hafta</Text>
            <View style={styles.dayRow}>
              {stats.weeklyLog.map((isCompleted, i) => (
                <View key={i} style={[ styles.dayDot, isCompleted && { backgroundColor: Colors.primary, borderColor: Colors.primaryLight }]} />
              ))}
            </View>
            <Text style={styles.subText}>{stats.weeklyLog.filter(Boolean).length}/7 gün tamamlandı</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hızlı Başla</Text>
            <ActionRow icon="book" text="Konu Çalış" color={Colors.primary} onPress={() => navigation.navigate('TopicsTab')} />
            <ActionRow icon="create" text="10 Soruluk Test" color={Colors.warning} onPress={() => {}} />
            <ActionRow icon="time" text="Eski Soruları Tekrar Et" color={Colors.primaryLight} onPress={() => {}} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 28, color: Colors.white, fontWeight: 'bold' },
  streakBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  streakText: { marginLeft: 6, fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: Colors.dark2, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 10 },
  barBack: { height: 10, backgroundColor: Colors.dark3, borderRadius: 8 },
  barFront: { height: 10, backgroundColor: Colors.warning, borderRadius: 8 },
  xpText: { color: Colors.grey, fontSize: 12, marginTop: 4, alignSelf: 'flex-end' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark3, borderWidth: 2, borderColor: Colors.primary },
  subText: { color: Colors.grey, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { flex: 1, color: Colors.white, fontSize: 16 },
  pressed: { opacity: 0.7 },
});