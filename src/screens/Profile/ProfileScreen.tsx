import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';
import { auth } from '../../services/firebase';

export default function ProfileScreen({ navigation }: any) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login'); // Login ekranına git
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <GradientBg>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={64} color={Colors.white} />
        </View>
        <Text style={styles.name}>{auth.currentUser?.email ?? 'Misafir'}</Text>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: { fontSize: 20, color: Colors.white, marginBottom: 40 },
  logoutBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});