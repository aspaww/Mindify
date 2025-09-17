import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import GradientBg from '../../components/GradientBg';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import { register } from '../../services/auth';
import Colors from '../../constants/Colors';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  
  const handleRegister = async () => {
    if (!name || !surname || !email || !password || !passwordAgain) {
      showToast('Tüm alanları doldurun', 'error');
      return;
    }
    if (password !== passwordAgain) {
      showToast('Şifreler uyuşmuyor', 'error');
      return;
    }
    // Diğer validasyonlar...

    setLoading(true);
    try {
      await register(email, password, `${name.trim()} ${surname.trim()}`);
      // Başarılı kayıt sonrası Firebase otomatik giriş yapar.
      // Biz de kullanıcıyı direkt ana ekrana yolluyoruz.
      navigation.replace('Main');
    } catch (err: any) {
      const msgMap: Record<string, string> = { 'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı.'};
      showToast(msgMap[err.code] || 'Kayıt sırasında bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GradientBg>
        <View style={styles.container}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <View style={styles.field}><Text style={styles.label}>Ad</Text><TextInput style={styles.input} placeholder="Adınız" placeholderTextColor="#888" value={name} onChangeText={setName} /></View>
          <View style={styles.field}><Text style={styles.label}>Soyad</Text><TextInput style={styles.input} placeholder="Soyadınız" placeholderTextColor="#888" value={surname} onChangeText={setSurname} /></View>
          <View style={styles.field}><Text style={styles.label}>E-posta</Text><TextInput style={styles.input} placeholder="ornek@mail.com" placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
          <View style={styles.field}><Text style={styles.label}>Şifre</Text><TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry /></View>
          <View style={styles.field}><Text style={styles.label}>Şifre Tekrar</Text><TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#888" value={passwordAgain} onChangeText={setPasswordAgain} secureTextEntry /></View>
          <Pressable 
            style={({ pressed }) => [styles.button, (loading || pressed) && styles.buttonPressed]}
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Üye Ol</Text>}
          </Pressable>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Zaten bir hesabın var mı? Giriş Yap
          </Text>
          {toast && <Toast {...toast} onHide={hideToast} />}
        </View>
      </GradientBg>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
    title: { fontSize: 32, color: Colors.white, fontWeight: 'bold', alignSelf: 'center', marginBottom: 24 },
    field: { marginBottom: 16 },
    label: { color: Colors.white, marginBottom: 4, fontSize: 14 },
    input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    button: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 8, marginTop: 12, alignItems: 'center', justifyContent: 'center' },
    buttonPressed: { opacity: 0.8 },
    buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
    link: { color: Colors.primaryLight, marginTop: 16, textAlign: 'center' },
});