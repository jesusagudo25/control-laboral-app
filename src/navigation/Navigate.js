import React from "react";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { useTheme } from "@rneui/themed";

// Auth Screens
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import passwordRecovery from "../screens/auth/PasswordRecovery";

// Home Screens (Tabs) - Acces from Login
import Home from "../screens/home/Home";
import Request from "../screens/request/Request";
import Document from "../screens/document/Document";
import More from "../screens/more/More";

// Signing Screens - Acces from Home
import Signing from "../screens/home/signing/Signing";

//Calendar Screens - Acces from Home
import Calendar from "../screens/home/calendar/Calendar";

// Importar los componentes de navegación
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/** 🚀 1️⃣ Stack de Autenticación */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="PasswordRecovery" component={passwordRecovery} />
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="Signing" component={Signing} />
    <Stack.Screen name="Calendar" component={Calendar} />
  </Stack.Navigator>
);

/** 🚀 2️⃣ Tabs de la App después del Login */
const TabNavigator = () => {
  const { theme } = useTheme(); // Obtener el tema actual

  return (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarStyle: { display: "flex", backgroundColor: theme.colors.header },
      tabBarActiveTintColor: theme.colors.warning,
      tabBarInactiveTintColor: "#8e8e93",
      tabBarLabelStyle: { fontSize: 12 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarLabel: "Inicio",
        tabBarIcon: ({ color }) => (
          <Icon name="home" type="font-awesome" color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Request"
      component={Request}
      options={{
        tabBarLabel: "Solicitudes",
        tabBarIcon: ({ color }) => (
          <Icon name="file-text" type="font-awesome" color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Document"
      component={Document}
      options={{
        tabBarLabel: "Documentos",
        tabBarIcon: ({ color }) => (
          <Icon name="folder" type="font-awesome" color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="More"
      component={More}
      options={{
        tabBarLabel: "Más",
        tabBarIcon: ({ color }) => (
          <Icon name="gear" type="font-awesome" color={color} />
        ),
      }}
    />
  </Tab.Navigator>
  )

};

const Navigate = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigate;
