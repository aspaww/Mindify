import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../navigation/types';

// Beynimizi import ediyoruz!
import  useUserStats  from '../../hooks/useUserStats';

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'HomeTab'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Tüm karmaşık mantık bu tek satırın içinde çalışıyor.
  const { stats, loading } = useUserStats();

  const flameAnimation = useRef(new Animated.Value(1)).current;

  // Animasyon ve Stil Fonksiyonları
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

  const getFlameStyle = () => {
    if (!stats) return { color: Colors.grey, fontSize: 24 };
    let color = Colors.grey; let size = 24;
    if (stats.streak > 0) color = Colors.success; if (stats.streak >= 5) color = Colors.warning; if (stats.streak >= 10) color = Colors.error;
    if (stats.streak >= 7) size = 26; if (stats.streak >= 15) size = 28;
    return { color, fontSize: size };
  };

  // Yükleniyor veya Veri Yoksa Gösterilecek Ekranlar
  if (loading) { return <GradientBg><ActivityIndicator size="large" color={Colors.white} style={{ flex: 1 }} /></GradientBg>; }
  if (!stats) { return <GradientBg><SafeAreaView style={styles.safeArea}><Text style={styles.headerTitle}>Veri bekleniyor...</Text></SafeAreaView></GradientBg>; }

  // Arayüz Hesaplamaları
  const currentLevel = Math.floor((stats.totalXp || 0) / 1000);
  const currentLevelXp = (stats.totalXp || 0) % 1000;
  const xpForNextLevel = 1000;
  const levelProgress = (currentLevelXp / xpForNextLevel) * 100;

  // Arayüz (Vücut)
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
            <Text style={styles.cardTitle}>Seviye {currentLevel}</Text>
            <View style={styles.barBack}><View style={[styles.barFront, { width: `${levelProgress}%` }]} /></View>
            <Text style={styles.xpText}>{`${currentLevelXp}/${xpForNextLevel} XP`}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bu Hafta</Text>
            <View style={styles.dayRow}>
              {(stats.weeklyLog || []).map((isCompleted, i) => ( <View key={i} style={[ styles.dayDot, isCompleted && { backgroundColor: Colors.primary, borderColor: Colors.primaryLight }]} /> ))}
            </View>
            <Text style={styles.subText}>{(stats.weeklyLog || []).filter(Boolean).length}/7 gün tamamlandı</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hızlı Başla</Text>
            <Pressable style={styles.actionRow} onPress={() => navigation.navigate('TopicsTab')}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '20' }]}><Ionicons name="book" size={22} color={Colors.primary} /></View>
                <Text style={styles.actionText}>Konu Çalış</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </Pressable>
            <Pressable style={styles.actionRow} onPress={() => {}}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.warning + '20' }]}><Ionicons name="create" size={22} color={Colors.warning} /></View>
                <Text style={styles.actionText}>10 Soruluk Test</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBg>
  );
}

// Stiller
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
});