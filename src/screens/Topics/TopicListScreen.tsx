import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import GradientBg from '../../components/GradientBg';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// --- YENİ 1: Navigasyon için gerekli modülleri import et ---
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

// --- YENİ 2: Navigasyon Stack'imizin tip tanımını yapalım ---
// Bu, hangi ekrana ne tür veri göndereceğimizi belirler.
type RootStackParamList = {
  TopicList: undefined; // Bu ekranın kendisi
  TopicDetail: { topicId: string; topicTitle: string; topicPath: string }; // Gideceğimiz yeni ekran
};

type TopicListNavigationProp = StackNavigationProp<RootStackParamList, 'TopicList'>;

type Item = { 
  id: string; 
  title: string; 
  path: string; 
  contentXp?: number; // Artık 'xp' değil, 'contentXp' veya 'storyXp' olabilir
  icon?: keyof typeof Icon.glyphMap;
  color?: keyof typeof Colors;
};
type ScreenState = { headerTitle: string; collectionPath: string };

export default function TopicListScreen() {
  const [stack, setStack] = useState<ScreenState[]>([{ headerTitle: 'Sınavlar', collectionPath: 'topics' }]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  // --- YENİ 3: Navigation hook'unu aktif et ---
  const navigation = useNavigation<TopicListNavigationProp>();

  useEffect(() => {
    setLoading(true);
    const currentScreen = stack[stack.length - 1];
    
    const queryRef = collection(db, currentScreen.collectionPath);

    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        title: d.data().title ?? d.id,
        contentXp: d.data().contentXp, // Veritabanındaki yeni isme göre güncelle
        icon: d.data().icon,
        color: d.data().color,
        path: currentScreen.collectionPath + '/' + d.id,
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

  // --- DEĞİŞİKLİK: handlePress fonksiyonunu akıllandırdık ---
  const handlePress = (item: Item) => {
    const pathSegments = item.path.split('/');
    const currentCollectionName = pathSegments[pathSegments.length - 2];

    // Eğer tıklanan öğe "konular" koleksiyonunun içindeyse, bu nihai bir konudur.
    if (currentCollectionName === 'konular') {
      console.log(`--- NAVIGASYON: TopicDetail ekranına yönlendiriliyor. Konu ID: ${item.id}, Başlık: ${item.title}`);
      navigation.navigate('TopicDetail', {
        topicId: item.id,
        topicTitle: item.title,
        topicPath: item.path,
      });
      return;
    }

    // Eğer bir kategori ise, daha derine inmeye devam et (eski mantık).
    const depth = pathSegments.length / 2;
    let nextSubCollectionName = '';
    if (depth === 1) nextSubCollectionName = 'subCategories';
    else if (depth === 2) nextSubCollectionName = 'subjects';
    else if (depth === 3) nextSubCollectionName = 'konular';
    
    if (nextSubCollectionName) {
      const newCollectionPath = item.path + '/' + nextSubCollectionName;
      console.log(`--- NAVIGASYON: Bir alt kategoriye iniliyor. Yeni yol: ${newCollectionPath}`);
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
      <View style={styles.safeAreaTop} />
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {stack.length > 1 && (
            <Pressable onPress={goBack} style={styles.backButton}>
              <Icon name="chevron-left" size={28} color={Colors.primaryLight} />
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
          key={stack.length}
          data={items}
          numColumns={2}
          renderItem={({ item }) => {
            const itemColor = Colors[item.color] || Colors.primaryLight;
            return (
              <Pressable 
                style={({ pressed }) => [styles.gridCard, pressed && styles.gridCardPressed]} 
                onPress={() => handlePress(item)}
              >
                <View style={[styles.gridIconContainer, { backgroundColor: `${itemColor}33` }]}>
                  <Icon name={item.icon || 'folder-open-outline'} size={40} color={itemColor} />
                </View>
                <Text style={styles.gridCardText} numberOfLines={2}>{item.title}</Text>
                {/* Şimdilik XP metnini kaldırıyoruz, çünkü XP artık detay ekranında kazanılacak */}
              </Pressable>
            )
          }}
          columnWrapperStyle={{ justifyContent: 'center' }}
          contentContainerStyle={styles.gridListContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Bu kategori altında henüz içerik yok.</Text>}
        />
      )}
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  safeAreaTop: { height: Dimensions.get('window').height > 800 ? 50 : 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  headerSide: { flex: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { color: Colors.primaryLight, fontSize: 16, marginLeft: 2 },
  title: { flex: 2, fontSize: 22, color: Colors.white, fontWeight: 'bold', textAlign: 'center' },
  gridListContent: { paddingTop: 10, paddingBottom: 40 },
  gridCard: {
    backgroundColor: Colors.dark2,
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 20,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  gridCardPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: Colors.dark3,
  },
  gridIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridCardText: { 
    color: Colors.white, 
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyText: { color: Colors.grey, textAlign: 'center', marginTop: 50, fontSize: 16 }
});