import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/Home/HomeScreen';
import TopicListScreen from '../screens/Topics/TopicListScreen';
import TestScreen from '../screens/Test/TestScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import Colors from '../constants/Colors';
import useAutoLogout from '../hooks/useAutoLogout';

export type TabParamList = {
  HomeTab: undefined;
  TopicsTab: undefined;
  TestTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator({ navigation }: any) {
  useAutoLogout(() => navigation.replace('Login'));

  return (
    // id="Tabs" SİLİNDİ
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: { backgroundColor: Colors.dark, borderTopColor: Colors.primary },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'TopicsTab') iconName = 'book';
          else if (route.name === 'TestTab') iconName = 'create';
          else if (route.name === 'ProfileTab') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="TopicsTab" component={TopicListScreen} options={{ tabBarLabel: 'Konular' }} />
      <Tab.Screen name="TestTab" component={TestScreen} options={{ tabBarLabel: 'Test' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}