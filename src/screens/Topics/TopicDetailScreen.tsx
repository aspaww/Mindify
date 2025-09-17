import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { doc, onSnapshot, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import useUserStats from '../../hooks/useUserStats';

// Tipler ve Sekme içerikleri (Değişiklik yok)
type TopicDetailScreenRouteProp = RouteProp<{ params: { topicId: string; topicTitle: string; topicPath: string; } }, 'params'>;
type TopicContentPage = { type: string; title: string; body: string; };
type TopicData = { title: string; contentXp: number; storyXp: number; story: string; content: TopicContentPage[]; };

const KonuRoute = ({ topicData, onComplete }: { topicData: TopicData, onComplete: () => void }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const currentPage = topicData.content[pageIndex];
  const isLastPage = pageIndex === topicData.content.length - 1;
  useEffect(() => { if (isLastPage) { onComplete(); } }, [pageIndex, isLastPage, onComplete]);
  return ( <View style={styles.scene}><ScrollView contentContainerStyle={styles.pageContent}><Text style={styles.pageTitle}>{currentPage.title}</Text><Text style={styles.pageBody}>{currentPage.body}</Text></ScrollView><View style={styles.pageNavigation}><Pressable onPress={() => setPageIndex(p => p - 1)} disabled={pageIndex === 0} style={pageIndex === 0 ? styles.arrowDisabled : styles.arrow}><Ionicons name="chevron-back" size={32} color={Colors.white} /></Pressable><Text style={styles.pageIndicator}>{pageIndex + 1} / {topicData.content.length}</Text><Pressable onPress={() => setPageIndex(p => p + 1)} disabled={isLastPage} style={isLastPage ? styles.arrowDisabled : styles.arrow}><Ionicons name="chevron-forward" size={32} color={Colors.white} /></Pressable></View></View> );
};
const HikayeRoute = ({ topicData }: { topicData: TopicData }) => ( <ScrollView style={styles.scene}><Text style={styles.storyBody}>{topicData.story}</Text></ScrollView> );
const TestRoute = () => ( <View style={styles.scene}><View style={{ alignItems: 'center', paddingHorizontal: 20 }}><Ionicons name="lock-closed" size={32} color={Colors.grey} /><Text style={[styles.placeholderText, { marginTop: 10, padding: 0 }]}>Test şu an kilitli.</Text><Text style={styles.subPlaceholderText}>Konu ve hikaye bölümünde 30 dakika geçirince açılacak.</Text></View></View> );

export default function TopicDetailScreen() {
  const route = useRoute<TopicDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { topicId, topicTitle, topicPath } = route.params;
  
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { stats } = useUserStats();

  // --- YENİ 1: Ekrana kendi hafızasını ekliyoruz ---
  const [isContentCompletedThisSession, setIsContentCompletedThisSession] = useState(false);

  useEffect(() => {
    const docRef = doc(db, topicPath);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) { setTopicData(docSnap.data() as TopicData); } 
      else { console.error("--- HATA: Konu verisi bulunamadı!"); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [topicPath]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([ { key: 'konu', title: 'Konu' }, { key: 'hikaye', title: 'Hikaye' }, { key: 'test', title: 'Test' }, ]);

  const handleContentComplete = useCallback(async () => {
    // --- YENİ 2: Önce ekranın kendi hafızasını kontrol et ---
    if (isContentCompletedThisSession) {
      console.log(`--- XP KAZANIMI: Bu oturumda konu XP'si zaten verildi. İşlem yapılmayacak.`);
      return;
    }
    
    if (!stats || !auth.currentUser || !topicData) { return; }
    if (stats.completedToday.includes(topicId)) {
      console.log(`--- XP KAZANIMI: '${topicId}' konusundan bugün zaten XP kazanılmış.`);
      // Ekranın hafızasını da güncelleyelim ki tutarlı olsun
      setIsContentCompletedThisSession(true);
      return;
    }
    
    const multiplier = calculateMultiplier(stats.streak);
    const xpGained = Math.round(topicData.contentXp * multiplier);
    console.log(`--- XP HESAPLAMA: ${topicData.contentXp} (temel) * ${multiplier}x (seri) = ${xpGained} XP`);

    const statsRef = doc(db, 'users', auth.currentUser.uid, 'stats', 'data');
    await updateDoc(statsRef, {
      xpToday: increment(xpGained), weeklyXp: increment(xpGained),
      totalXp: increment(xpGained), completedToday: arrayUnion(topicId)
    });
    
    // --- YENİ 3: XP verdikten sonra ekranın hafızasına not al ---
    setIsContentCompletedThisSession(true);
    showToast(`Tebrikler! +${xpGained} XP kazandın!`, 'success');

  }, [stats, topicData, topicId, showToast, isContentCompletedThisSession]);

  if (loading || !topicData) { return <GradientBg><ActivityIndicator size="large" color={Colors.white} style={{flex: 1}} /></GradientBg>; }

  return (
    <GradientBg>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Pressable onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={28} color={Colors.white} /></Pressable><Text style={styles.title}>{topicTitle}</Text><View style={{ width: 40 }} /></View>
        <TabView
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'konu': return <KonuRoute topicData={topicData} onComplete={handleContentComplete} />;
              case 'hikaye': return <HikayeRoute topicData={topicData} />;
              case 'test': return <TestRoute />;
              default: return null;
            }
          }}
          renderTabBar={props => ( <TabBar {...props} indicatorStyle={{ backgroundColor: Colors.primaryLight }} style={{ backgroundColor: 'transparent' }} /> )}
        />
        {toast && <Toast {...toast} onHide={hideToast} />}
      </SafeAreaView>
    </GradientBg>
  );
}

// Stiller ve calculateMultiplier (Değişiklik yok)
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, },
    backButton: { padding: 4 },
    title: { color: Colors.white, fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1, },
    scene: { flex: 1, },
    placeholderText: { color: Colors.white, fontSize: 18, textAlign: 'center', paddingHorizontal: 20, },
    subPlaceholderText: { color: Colors.grey, fontSize: 14, textAlign: 'center', paddingHorizontal: 40, marginTop: 4 },
    pageContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.white, marginBottom: 16, textAlign: 'center' },
    pageBody: { fontSize: 18, color: Colors.white, textAlign: 'center', lineHeight: 26 },
    pageNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    arrow: { opacity: 1 },
    arrowDisabled: { opacity: 0.3 },
    pageIndicator: { color: Colors.white, fontSize: 16, fontWeight: '600' },
    storyBody: { fontSize: 18, color: Colors.white, padding: 20, lineHeight: 28 },
});

const calculateMultiplier = (streak: number) => {
  if (!streak || streak <= 1) return 1.0;
  const multiplier = 1 + (streak / 10);
  return Math.min(multiplier, 2.0);
};