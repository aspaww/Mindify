import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBg from '../../components/GradientBg';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import { register } from '../../services/auth';
import { Metrics } from '../../constants/Metrics';


export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleRegister = async () => {
    if (!name || !surname || !email || !password || !passwordAgain) {
      showToast('Tüm alanları doldurun', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Lütfen geçerli bir e-posta adresi girin', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Şifre en az 6 karakter olmalı', 'error');
      return;
    }
    if (password !== passwordAgain) {
      showToast('Şifreler uyuşmuyor', 'error');
      return;
    }

    try {
      await register(email, password, `${name} ${surname}`);
      showToast('Kaydınız başarılı!', 'success');
      setTimeout(() => navigation.replace('Login'), 1500);
    } catch (err: any) {
      const msgMap: Record<string, string> = {
        'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı.',
        'auth/invalid-email': 'Geçersiz e-posta formatı.',
        'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
        'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
        'auth/internal-error': 'Sunucu hatası. Daha sonra tekrar deneyin.',
      };
      const msg = msgMap[err.code] || err.message;
      showToast(msg, 'error');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GradientBg>
        <View style={styles.container}>
          <Text style={styles.title}>Mindify Üyelik</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Ad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Soyadınız"
              placeholderTextColor="#888"
              value={surname}
              onChangeText={setSurname}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@mail.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Şifre + göz içinde */}
          <View style={styles.field}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.pwdContainer}>
              <TextInput
                style={[styles.input, styles.pwdInput]}
                placeholder="••••••••"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={20} color="#FFF9" />
              </Pressable>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <View style={styles.pwdContainer}>
              <TextInput
                style={[styles.input, styles.pwdInput]}
                placeholder="••••••••"
                placeholderTextColor="#888"
                value={passwordAgain}
                onChangeText={setPasswordAgain}
                secureTextEntry={!showPwd}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={20} color="#FFF9" />
              </Pressable>
            </View>
          </View>

          <Text style={styles.registerBtn} onPress={handleRegister}>
            Üye Ol
          </Text>

          {toast && <Toast {...toast} onHide={hideToast} />}
        </View>
      </GradientBg>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold', alignSelf: 'center', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { color: '#fff', marginBottom: 4, fontSize: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  pwdContainer: { position: 'relative' },
  pwdInput: { paddingRight: 40 },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -15,
    padding: 4,
  },
  registerBtn: {
    backgroundColor: '#7A3E9D',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    fontSize: 16,
  },
});