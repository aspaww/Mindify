import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import GradientBg from '../../components/GradientBg';
import AuthInput from '../../components/AuthInput';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import { login } from '../../services/auth';
import Colors from '../../constants/Colors';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('E-posta ve şifre boş bırakılamaz', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Başarılı girişten sonra, IntroScreen'deki gibi,
      // RootNavigator'daki auth state değişikliği yönlendirmeyi yapacak.
      // Ama biz kullanıcıyı bekletmeden direkt yönlendiriyoruz.
      navigation.replace('Main');
    } catch (err: any) {
      const msgMap: Record<string, string> = {
        'auth/invalid-credential': 'E-posta veya şifre hatalı.',
        'auth/user-not-found': 'Böyle bir kullanıcı bulunamadı.',
        'auth/wrong-password': 'Şifre yanlış.',
      };
      const msg = msgMap[err.code] || 'Giriş sırasında bir hata oluştu.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBg>
      <View style={styles.container}>
        <Text style={styles.title}>Mindify</Text>

        <AuthInput label="E-posta" placeholder="ornek@mail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AuthInput label="Şifre" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

        <Pressable 
          style={({ pressed }) => [styles.button, (loading || pressed) && styles.buttonPressed]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </Pressable>

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
  title: { fontSize: 40, color: Colors.white, fontWeight: 'bold', alignSelf: 'center', marginBottom: 40 },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: { color: Colors.primaryLight, marginTop: 16, textAlign: 'center' },
});