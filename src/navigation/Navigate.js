import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { Button, Image, Dialog, Divider } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTheme } from "@rneui/themed";

import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import Home from "../screens/home/Home";
import Signing from "../screens/signing/Signing";


//const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();


const Navigate = () => {

    const { theme } = useTheme(); // Obtener el tema actual
  

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            color: theme.colors.text,
          },
        }}
      >
        <Tab.Screen
          name="Login"
          component={Login}
          options={{
            tabBarLabel: "Iniciar sesión",
            tabBarIcon: () => <Icon name="login" size={24} color={theme.colors.text} />,
          }}
        />

        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: "Inicio",
            tabBarIcon: () => <Icon name="home" size={24} color={theme.colors.text} />,
          }}
        />

        <Tab.Screen
          name="Signing"
          component={Signing}
          options={{
            tabBarLabel: "Jornada",
            tabBarIcon: () => <Icon name="work" size={24} color={theme.colors.text} />,
          }}
        />
      </Tab.Navigator>
      
    </NavigationContainer>
  );
};

export default Navigate;
