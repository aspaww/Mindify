import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import IntroScreen from '../screens/Intro/IntroScreen'; // 1) en yukarıda kalsın
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import TopicListScreen from '../screens/Topics/TopicListScreen';
import TabNavigator from './TabNavigator'; // TabNavigator'ı ekle

export type RootStackParamList = {
  Intro: undefined; // 2) tip tanımına ekle
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Topics: undefined;
  Main: undefined; // TabNavigator için
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro" // 3) ilk açılacak ekran
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabNavigator} /> 
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Topics" component={TopicListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}