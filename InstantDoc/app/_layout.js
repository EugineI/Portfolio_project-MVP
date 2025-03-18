import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabs from "./navigation/BottomTabs";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

const Stack = createStackNavigator();

export default function Layout() {
  return (
	  <Stack.Navigator screenOptions={{ headerShown: false }}>
	  <Stack.Screen name="Landing" component={LandingScreen} />
	  <Stack.Screen name="Login" component={LoginScreen} />
	  <Stack.Screen name="Register" component={RegisterScreen} />
	  <Stack.Screen name="MainTabs" component={BottomTabs} />
	  </Stack.Navigator>
  );
}
