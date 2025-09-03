import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientBg from '../../components/GradientBg';
import AuthInput from '../../components/AuthInput';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import { login } from '../../services/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('E-posta ve şifre boş bırakılamaz', 'error');
      return;
    }

    try {
      await login(email, password);
      showToast('Giriş yapıldı!', 'success');
      setTimeout(() => navigation.replace('Main'), 1000);
    } catch (err: any) {
      const msgMap: Record<string, string> = {
        'auth/invalid-credential': 'E-posta veya şifre hatalı.',
        'auth/invalid-email': 'Geçersiz e-posta formatı.',
        'auth/user-disabled': 'Hesap devre dışı bırakılmış.',
        'auth/user-not-found': 'Böyle bir kullanıcı bulunamadı.',
        'auth/wrong-password': 'Şifre yanlış.',
        'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen biraz bekleyin.',
        'auth/internal-error': 'Sunucu hatası. Daha sonra tekrar deneyin.',
      };
      const msg = msgMap[err.code] || err.message;
      showToast(msg, 'error');
    }
  };

  return (
    <GradientBg>
      <View style={styles.container}>
        <Text style={styles.title}>Mindify</Text>

        <AuthInput label="E-posta" placeholder="ornek@mail.com" value={email} onChangeText={setEmail} />
        <AuthInput label="Şifre" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.loginBtn} onPress={handleLogin}>
          Giriş Yap
        </Text>

        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Üyeliğin yok mu? Hemen oluştur
        </Text>

        {toast && <Toast {...toast} onHide={hideToast} />}
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 40, color: '#fff', fontWeight: 'bold', alignSelf: 'center', marginBottom: 40 },
  loginBtn: {
    backgroundColor: '#7A3E9D',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    fontSize: 16,
  },
  link: { color: '#9B5FBF', marginTop: 16, textAlign: 'center' },
});