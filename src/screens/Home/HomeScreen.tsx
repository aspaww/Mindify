import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GradientBg from '../../components/GradientBg';

export default function HomeScreen({ navigation }: any) {
  return (
    <GradientBg>
      <View style={styles.center}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.welcome}>Mindify'a Hoş Geldiniz</Text>
        </TouchableOpacity>
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});