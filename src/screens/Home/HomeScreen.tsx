import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';
import { useNavigation, StackActions } from '@react-navigation/native';
import { auth, db } from '../../services/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../navigation/TabNavigator';

interface UserStats {
  level: number;
  streak: number;
  xpToday: number;
  weeklyLog: boolean[];
  lastActive: Timestamp | null;
}

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'HomeTab'>;

const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};
const isYesterday = (d1, d2) => {
    const y = new Date(d2);
    y.setDate(y.getDate() - 1);
    return isSameDay(d1, y);
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const flameAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const statsRef = doc(db, 'users', user.uid, 'stats', 'data');
        const unsubscribeSnapshot = onSnapshot(statsRef, (docSnap) => {
          if (docSnap.exists()) {
            updateStatsOnLogin(statsRef, docSnap.data() as UserStats);
          } else {
            console.log("Kullanıcı verisi Firebase Function tarafından oluşturuluyor, bekleniyor...");
            setLoading(true); 
          }
        }, (error) => {
            console.error("Firestore 'stats' dinleme hatası:", error);
            setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        navigation.dispatch(StackActions.replace('Login'));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const updateStatsOnLogin = async (statsRef, currentStats: UserStats) => {
    const today = new Date();
    const lastActiveDate = currentStats.lastActive?.toDate();
    const todayIndex = (today.getDay() + 6) % 7;
    
    let needsUpdate = false;
    let newStreak = currentStats.streak;
    let newWeeklyLog = [...currentStats.weeklyLog];

    if (!lastActiveDate || !isSameDay(lastActiveDate, today)) {
        needsUpdate = true;
        newWeeklyLog[todayIndex] = true;
        newStreak = (lastActiveDate && isYesterday(lastActiveDate, today)) ? currentStats.streak + 1 : 1;
    }
    
    if (needsUpdate) {
      await updateDoc(statsRef, {
        streak: newStreak,
        weeklyLog: newWeeklyLog,
        lastActive: serverTimestamp(),
      });
    }
    setStats(currentStats);
    setLoading(false);
  };

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
            {/* ... render stats ... */}
          </View>
          {/* ... Diğer kartların JSX kodu ... */}
        </ScrollView>
      </SafeAreaView>
    </GradientBg>
  );
}

// Stiller aynı, değişiklik yok
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