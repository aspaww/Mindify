import React from 'react';
import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientBg({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.dark]} // üst mor → alt siyah
      style={styles.flex}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });