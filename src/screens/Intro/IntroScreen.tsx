import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import GradientBg from '../../components/GradientBg';

export default function IntroScreen({ navigation }: any) {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  /* --------------  SONSUZ LOOP  -------------- */
  const startLoop = () => {
    // ilk giriş animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim,   { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -30, duration: 600, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 0, friction: 4, useNativeDriver: true }),
      ]),
    ]).start(() =>
      // sonsuz hafif zıplama
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -15, duration: 500, useNativeDriver: true }),
          Animated.spring(bounceAnim, { toValue: 0, friction: 4, useNativeDriver: true }),
        ]),
        { iterations: -1 }
      ).start()
    );
  };

  useEffect(() => { startLoop(); }, []);

  /* --------------  BUTONA BASINCA  -------------- */
  const goToLogin = () => {
    fadeAnim.stopAnimation();
    bounceAnim.stopAnimation();
    navigation.replace('Login');
  };

  return (
    <GradientBg>
      <View style={styles.container}>
        <Pressable onPress={goToLogin} style={styles.pressArea}>
          <Animated.Text
            style={[
              styles.logo,
              { opacity: fadeAnim, transform: [{ translateY: bounceAnim }] },
            ]}
          >
            Mindify
          </Animated.Text>
        </Pressable>
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pressArea: { paddingHorizontal: 40, paddingVertical: 20 }, // dokunma alanını büyüt
  logo: { fontSize: 52, color: '#fff', fontWeight: 'bold' },
});