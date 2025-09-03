import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import GradientBg from '../../components/GradientBg';
import AuthInput from '../../components/AuthInput';
import Colors from '../../constants/Colors';
import { login } from '../../services/auth';


export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Boş alan bırakmayın');
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main'); // giriş başarılı ana sayfaya geç
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
          <Text style={styles.title}>Mindify</Text>

          <AuthInput label="E-posta" placeholder="ornek@mail.com" value={email} onChangeText={setEmail} />
          <AuthInput label="Şifre" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.button} onPress={handleLogin}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Text>

          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Üyeliğin yok mu? Hemen oluştur
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 40, color: Colors.white, fontWeight: 'bold', alignSelf: 'center', marginBottom: 40 },
  button: {
    backgroundColor: Colors.primary,
    color: Colors.white,
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    fontSize: 16,
  },
  link: { color: Colors.primaryLight, marginTop: 16, textAlign: 'center' },
});