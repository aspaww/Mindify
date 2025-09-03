import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message: string;
  type: 'error' | 'success';
  onHide: () => void;
}

export default function Toast({ message, type, onHide }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(onHide);
  }, []);

  const bgColor = type === 'error' ? '#E53935' : '#4CAF50';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: bgColor }]}>
      <Ionicons
        name={type === 'error' ? 'alert-circle' : 'checkmark-circle'}
        size={24}
        color="#fff"
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  text: { color: '#fff', marginLeft: 8, fontSize: 14, fontWeight: '600' },
});