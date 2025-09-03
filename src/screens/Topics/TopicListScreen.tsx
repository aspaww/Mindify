import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientBg from '../../components/GradientBg';

export default function TopicListScreen() {
  return (
    <GradientBg>
      <View style={styles.center}>
        <Text style={styles.text}>Konular</Text>
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 24 },
});