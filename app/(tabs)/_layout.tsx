import React from "react";
import { Tabs } from "expo-router";
import colors from "../../assets/colors";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 15,
            borderRadius: 10,
            height: 60,
          }
        }}
    >
      <Tabs.Screen name="index"
          options={{ 
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              focused ?
              <Ionicons name="home" size={size} color={color} /> :
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }} 
      />
      <Tabs.Screen name="report"
        options={{ 
          title: "Report",
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
            <Ionicons name="document-text" size={size} color={color} /> :
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="chat"
        options={{ 
          title: "Chat",
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
            <Ionicons name="chatbubbles" size={size} color={color} /> :
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen name="settings"
        options={{ 
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
            <Ionicons name="settings" size={size} color={color} /> :
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
