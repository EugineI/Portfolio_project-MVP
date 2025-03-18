import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import HospitalScreen from '../screens/HospitalScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
	    <Tab.Screen name="Home" component={HomeScreen} />
	    <Tab.Screen name="Doc" component={ChatScreen} />
	    <Tab.Screen name="Hospital" component={HospitalScreen} />
        </Tab.Navigator>
    );
}
