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
const isSameDay = (d1, d2) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isYesterday = (d1, d2) => { const y = new Date(d2); y.setDate(y.getDate() - 1); return isSameDay(d1, y); };

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const flameAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log("--- [ADIM 1] HomeScreen yüklendi. Kullanıcı girişi dinleniyor... ---");
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`--- [ADIM 2] Kullanıcı GİRİŞ YAPTI. UID: ${user.uid} ---`);
        const statsRef = doc(db, 'users', user.uid, 'stats', 'data');
        
        const unsubscribeSnapshot = onSnapshot(statsRef, (docSnap) => {
          if (docSnap.exists()) {
            console.log("--- [ADIM 3A] Kullanıcının 'stats' verisi bulundu. Döngüyü kıran kontrol fonksiyonu çağrılıyor... ---");
            const data = docSnap.data() as UserStats;
            setStats(data); // Önce arayüzü anında güncelle
            checkAndUpdateStats(statsRef, data);
          } else {
            console.log("--- [ADIM 3B] BU YENİ BİR KULLANICI! 'stats' verisi bulunamadı. Varsayılan veri OLUŞTURULUYOR... ---");
            const defaultStats: UserStats = {
              level: 0,
              streak: 0,
              xpToday: 0,
              weeklyLog: [false, false, false, false, false, false, false],
              lastActive: null,
            };
            setDoc(statsRef, defaultStats);
            // onSnapshot bu yeni veriyi yakalayıp yukarıdaki if'e girecek.
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        console.log("--- [ADIM 2B] Kullanıcı ÇIKIŞ YAPMIŞ. Login ekranına yönlendiriliyor... ---");
        navigation.dispatch(StackActions.replace('Login'));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- DÖNGÜYÜ KIRAN FONKSİYON ---
  const checkAndUpdateStats = async (statsRef, currentStats: UserStats) => {
    console.log("--- [ADIM 5] 'checkAndUpdateStats' fonksiyonu çalıştı. Streak ve hafta kontrolü yapılıyor... ---");
    const today = new Date();
    const lastActiveDate = currentStats.lastActive?.toDate();
    
    // SADECE VE SADECE kullanıcı bugün daha önce GİRMEMİŞSE bu blok çalışır.
    if (!lastActiveDate || !isSameDay(lastActiveDate, today)) {
        console.log("--- [ADIM 6A] Kullanıcı bugün ilk kez giriş yapıyor. Veri güncellenecek. ---");
        const todayIndex = (today.getDay() + 6) % 7;
        const newWeeklyLog = [...currentStats.weeklyLog];
        newWeeklyLog[todayIndex] = true;

        const newStreak = (lastActiveDate && isYesterday(lastActiveDate, today)) ? currentStats.streak + 1 : 1;
        
        // Veritabanını SADECE BİR KERE güncelle. Bu, döngüyü kırar.
        await updateDoc(statsRef, {
            streak: newStreak,
            weeklyLog: newWeeklyLog,
            lastActive: serverTimestamp(),
        });
        console.log("--- [ADIM 7] Streak ve hafta bilgisi Firestore'da güncellendi. onSnapshot bunu algılayacak ama bir sonraki kontrolde 6B'ye girecek. ---");
    } else {
        console.log("--- [ADIM 6B] Kullanıcı bugün zaten giriş yapmış. Veri güncellenmeyecek. DÖNGÜ KIRILDI. ---");
    }
    // Her durumda (güncelleme olsa da olmasa da) yüklemeyi bitir.
    setLoading(false);
    console.log("--- [ADIM 8] Yüklenme tamamlandı. Arayüz gösteriliyor. ---");
  };
  
  // Animasyon...
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

  // JSX...
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

// Stiller...
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