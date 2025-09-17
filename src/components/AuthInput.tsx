import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  // --- DEĞİŞİKLİK 1: TextInput'ın tüm özelliklerini alabilmek için TextInputProps'u import et ---
  TextInputProps, 
} from 'react-native';
import Colors from '../constants/Colors';

// --- DEĞİŞİKLİK 2: Props tanımını güncelle ---
// Artık bu bileşen, kendi 'label' prop'una EK OLARAK,
// standart bir TextInput'ın alabildiği TÜM özellikleri (keyboardType, autoCapitalize vb.) kabul ediyor.
type Props = TextInputProps & {
  label: string;
};

// --- DEĞİŞİKLİK 3: Fonksiyonun parametrelerini güncelle ---
// 'label'ı ayır, geri kalan tüm propları 'rest' adında bir objede topla.
export default function AuthInput({ label, ...rest }: Props) {
  const [focusAnim] = useState(new Animated.Value(0));

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.grey, Colors.primaryLight],
  });

  const onFocus = () => Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  return (
    // Bonus: Dıştaki gereksiz TouchableWithoutFeedback'i kaldırdım, çünkü bu işi zaten ana ekranlar yapıyor.
    <View style={styles.container}>
      <Animated.Text style={[styles.label, { color: labelColor }]}>{label}</Animated.Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.grey}
        onFocus={onFocus}
        onBlur={onBlur}
        // --- DEĞİŞİKLİK 4: Gelen tüm diğer propları (value, onChangeText, secureTextEntry, keyboardType vb.) buraya yay ---
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 4, marginLeft: 4 }, // Label'a hafif bir iç boşluk verdim, daha iyi duruyor.
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12, // Dikey boşluğu biraz arttırdım
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});