import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import GradientBg from '../../components/GradientBg';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Cihazın ekranına göre üst boşluğu ayarlar (Dynamic Island/Notch için)
const { height } = Dimensions.get('window');
const TOP_SAFE_AREA = height > 800 ? 50 : 30;

// Ekranda gösterilecek her bir öğenin tipi
type Item = { id: string; title: string; path: string; xp?: number };
// Navigasyon yığınındaki her bir ekranın tipi
type ScreenState = { headerTitle: string; collectionPath: string };

export default function TopicListScreen() {
  const [stack, setStack] = useState<ScreenState[]>([{ headerTitle: 'Sınavlar', collectionPath: 'topics' }]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const currentScreen = stack[stack.length - 1];
    
    // Stack'ten alınan yola göre ilgili koleksiyonu dinle.
    const queryRef = collection(db, currentScreen.collectionPath);

    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id, // Belgenin ID'si (YKS, TYT, Matematik...)
        title: d.data().title ?? d.id, // Belgenin içindeki asıl başlık
        xp: d.data().xp,
        path: currentScreen.collectionPath + '/' + d.id, // Bu, dokümanın kendi yoludur
      }));
      setItems(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Dinleme Hatası: ", error);
      setItems([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [stack]);

  const handlePress = (item: Item) => {
    // Eğer 'xp' alanı varsa, bu bir nihai konudur, daha derine inme.
    if (item.xp !== undefined) {
      console.log('Seçilen Nihai Konu:', item.title, `(ID: ${item.id})`);
      // Gelecekte burası: navigation.navigate('KonuDetay', { documentPath: item.path });
      return;
    }

    // Bu bir kategori. Hiyerarşide bir sonraki seviyenin yolunu belirle.
    // item.path -> topics/YKS (2 segment) -> depth = 1
    // item.path -> topics/YKS/subCategories/TYT (4 segment) -> depth = 2
    const depth = item.path.split('/').length / 2;

    let nextSubCollectionName = '';
    if (depth === 1) nextSubCollectionName = 'subCategories'; // Sınav -> Alt Kategoriler
    else if (depth === 2) nextSubCollectionName = 'subjects'; // Aşama -> Dersler
    else if (depth === 3) nextSubCollectionName = 'konular';  // Ders -> Konular
    
    if (nextSubCollectionName) {
      const newCollectionPath = item.path + '/' + nextSubCollectionName;
      // Yeni ekranı yığına ekle. Başlık olarak belgenin içindeki "title" alanını kullan.
      setStack(s => [...s, { headerTitle: item.title, collectionPath: newCollectionPath }]);
    }
  };

  const goBack = () => {
    if (stack.length > 1) {
      setStack((s) => s.slice(0, -1));
    }
  };

  const currentHeaderTitle = stack[stack.length - 1].headerTitle;

  return (
    <GradientBg>
      <View style={{ height: TOP_SAFE_AREA }} />
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {stack.length > 1 && (
            <Pressable onPress={goBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.primaryLight} />
              <Text style={styles.backText}>Geri</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>{currentHeaderTitle}</Text>
        <View style={styles.headerSide} />
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginTop: 20 }}/>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => handlePress(item)}>
              {/* Butonun üzerinde belgenin ID'si (YKS, TYT gibi) yazacak */}
              <Text style={styles.cardText}>{item.id}</Text> 
              {item.xp === undefined ? (
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
              ) : (
                <Text style={styles.xp}>+{item.xp} XP</Text>
              )}
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Bu kategori altında henüz içerik yok.</Text>}
        />
      )}
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  headerSide: { flex: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { color: Colors.primaryLight, fontSize: 16, marginLeft: 4 },
  title: { flex: 2, fontSize: 22, color: Colors.white, fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: Colors.dark2, padding: 20, borderRadius: 16, marginBottom: 12, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardText: { color: Colors.white, fontSize: 18 },
  xp: { color: Colors.warning, fontSize: 14, fontWeight: 'bold' },
  listContent: { paddingTop: 10, paddingBottom: 40 },
  emptyText: { color: Colors.grey, textAlign: 'center', marginTop: 50, fontSize: 16 }
});