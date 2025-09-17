import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatsProvider } from '../context/StatsContext';

import IntroScreen from '../screens/Intro/IntroScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import TopicDetailScreen from '../screens/Topics/TopicDetailScreen';
import { TabParamList } from './types';

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Register: undefined;
  Main: { screen: keyof TabParamList };
  TopicDetail: { topicId: string; topicTitle: string; topicPath: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <StatsProvider>
        <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
        </Stack.Navigator>
      </StatsProvider>
    </NavigationContainer>
  );
}