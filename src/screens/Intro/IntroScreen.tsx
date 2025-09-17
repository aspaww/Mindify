import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import GradientBg from '../../components/GradientBg';
import Colors from '../../constants/Colors';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';

const slogans = [
  "Hedeflerine ulaşmanın en akıllı yolu.",
  "Öğrenmeyi oyunlaştır, başarıyı yakala.",
  "Bilgiye giden yolda en iyi partnerin.",
  "Her gün bir adım, her adımda zirveye.",
  "Potansiyelini keşfet, sınırlarını zorla.",
];

export default function IntroScreen({ navigation }: any) {
  const [slogan, setSlogan] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sloganFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * slogans.length);
    setSlogan(slogans[randomIndex]);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(sloganFadeAnim, { toValue: 1, duration: 900, delay: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      // Sadece bir kereliğine kullanıcı durumunu kontrol et
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("Kullanıcı giriş yapmış, Main'e yönlendiriliyor...");
          navigation.replace('Main');
        } else {
          console.log("Kullanıcı giriş yapmamış, Login'e yönlendiriliyor...");
          navigation.replace('Login');
        }
        // Kontrol ettikten sonra dinleyiciyi hemen kapat,
        // çünkü asıl dinleyici RootNavigator'de (veya yakında ekleyeceğimiz yerde) olmalı.
        // Bu sadece bir kerelik bir yönlendirme.
        if (unsubscribe) unsubscribe();
      });
    }, 4000); // 4 saniye bekle

    return () => clearTimeout(timer);
  }, []);

  return (
    <GradientBg>
      <View style={styles.container}>
        <Animated.Text style={[ styles.logo, { opacity: fadeAnim } ]}>Mindify</Animated.Text>
        <Animated.Text style={[styles.slogan, { opacity: sloganFadeAnim }]}>{slogan}</Animated.Text>
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  logo: { fontSize: 52, color: Colors.white, fontWeight: 'bold' },
  slogan: { fontSize: 18, color: Colors.white, marginTop: 10, textAlign: 'center', fontWeight: '300' },
});