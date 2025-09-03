import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import GradientBg from '../../components/GradientBg';
import AuthInput from '../../components/AuthInput';
import Colors from '../../constants/Colors';
import { register } from '../../services/auth';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !surname || !email || !password || !passwordAgain)
      return Alert.alert('Tüm alanları doldurun');
    if (password !== passwordAgain) return Alert.alert('Şifreler uyuşmuyor');
    setLoading(true);
    try {
      await register(email, password, `${name} ${surname}`);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBg>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Mindify Üyelik</Text>

          <AuthInput label="Ad" placeholder="Adınız" value={name} onChangeText={setName} />
          <AuthInput label="Soyad" placeholder="Soyadınız" value={surname} onChangeText={setSurname} />
          <AuthInput label="E-posta" placeholder="ornek@mail.com" value={email} onChangeText={setEmail} />
          <AuthInput label="Şifre" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          <AuthInput label="Şifre Tekrar" placeholder="••••••••" value={passwordAgain} onChangeText={setPasswordAgain} secureTextEntry />

          <Text style={styles.button} onPress={handleRegister}>
            {loading ? 'Kayıt yapılıyor...' : 'Üye Ol'}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 32, color: Colors.white, fontWeight: 'bold', alignSelf: 'center', marginBottom: 24 },
  button: {
    backgroundColor: Colors.primary,
    color: Colors.white,
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    fontSize: 16,
  },
});