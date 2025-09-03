import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import GradientBg from '../../components/GradientBg';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

const TOP_LEVEL_CATEGORIES = ['YKS', 'LGS', 'KPSS'];

export default function TopicListScreen() {
  const [topics, setTopics] = useState<string[]>(TOP_LEVEL_CATEGORIES);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'topics'), (snap) => {
      const docs = snap.docs.map((d) => d.id);
      setTopics(docs.length ? docs : TOP_LEVEL_CATEGORIES);
    });
    return unsub;
  }, []);

  const renderItem = ({ item }: { item: string }) => (
    <Pressable style={{ margin: 8, padding: 16, backgroundColor: '#1E1E1E', borderRadius: 8 }}>
      <Text style={{ color: '#fff', fontSize: 18 }}>{item}</Text>
    </Pressable>
  );

  return (
    <GradientBg>
      <FlatList
        data={topics}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </GradientBg>
  );
}