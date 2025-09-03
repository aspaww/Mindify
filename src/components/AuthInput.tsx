import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Colors from '../constants/Colors';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
};

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
}: Props) {
  const [focusAnim] = useState(new Animated.Value(0));

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.grey, Colors.primaryLight],
  });

  const onFocus = () => Animated.timing(focusAnim, { toValue: 1, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(focusAnim, { toValue: 0, useNativeDriver: false }).start();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Animated.Text style={[styles.label, { color: labelColor }]}>{label}</Animated.Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.grey}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 16,
  },
});