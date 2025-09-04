import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';

export default function HomeScreen() {
  /* TODO: Firestore’dan çekeceğiz */
  const streak = 7;
  const xpToday = 125;
  const level = 4;
  const weeklyGoal = 5; // hedef gün
  const weeklyProgress = 3; // tamamlanan

  return (
    <GradientBg>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ------  HEADER  ------ */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mindify</Text>
          <View style={styles.streakBox}>
            <Ionicons name="flame" size={20} color={Colors.success} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        {/* ------  SEVİYE & XP BAR  ------ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seviye {level}</Text>
          <View style={styles.barBack}>
            <View style={[styles.barFront, { width: `${(xpToday / 150) * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>{xpToday}/150 XP</Text>
        </View>

        {/* ------  HAFTALIK HEDEF  ------ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bu Hafta</Text>
          <View style={styles.dayRow}>
            {[...Array(7)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dayDot,
                  i < weeklyProgress && { backgroundColor: Colors.primary },
                ]}
              />
            ))}
          </View>
          <Text style={styles.subText}>{weeklyProgress}/{weeklyGoal} gün tamamlandı</Text>
        </View>

        {/* ------  HIZLI EYLEMLER  ------ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hızlı Başla</Text>

          <ActionRow icon="book" text="Konu Çalış" color={Colors.primary} />
          <ActionRow icon="create" text="10 Soruluk Test" color={Colors.warning} />
          <ActionRow icon="time" text="Eski Soruları Tekrar Et" color={Colors.primaryLight} />
        </View>

        {/* ------  GÜNLÜK ÖNERİ ------ */}
        <View style={[styles.card, { backgroundColor: Colors.dark3 }]}>
          <Text style={styles.cardTitle}>Bugün için Öneri</Text>
          <Text style={styles.quote}>
            “Çıkmış soruları çözmek, yarınki sınavda 1 adım önde olmak demektir.”
          </Text>
        </View>
      </ScrollView>
    </GradientBg>
  );
}

/* ----------  ORTAK SATIR BUTONU  ---------- */
function ActionRow({ icon, text, color }: { icon: keyof typeof Ionicons.glyphMap; text: string; color: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]} onPress={() => {}}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionText}>{text}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
    </Pressable>
  );
}

/* ----------  STYLES  ---------- */
const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 28, color: Colors.white, fontWeight: 'bold' },
  streakBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  streakText: { color: Colors.success, marginLeft: 6, fontWeight: '600' },

  card: { backgroundColor: Colors.dark2, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 10 },
  barBack: { height: 10, backgroundColor: Colors.dark3, borderRadius: 8 },
  barFront: { height: 10, backgroundColor: Colors.warning, borderRadius: 8 },
  xpText: { color: Colors.grey, fontSize: 12, marginTop: 4, alignSelf: 'flex-end' },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.dark3, borderWidth: 2, borderColor: Colors.primary },
  subText: { color: Colors.grey, fontSize: 12 },

  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { flex: 1, color: Colors.white, fontSize: 16 },
  pressed: { opacity: 0.7 },
  quote: { color: Colors.grey, fontStyle: 'italic', fontSize: 14, lineHeight: 20 },
});