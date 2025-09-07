import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import * as Notifications from "expo-notifications";
import { useRef } from "react";
import useAuth from "../hooks/useAuth"; // Importar el hook useAuth

// Auth Screens
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import passwordRecovery from "../screens/auth/PasswordRecovery";

// Home Screens (Tabs) - Acces from Login
import Home from "../screens/home/Home";
import Request from "../screens/request/Request";
import Document from "../screens/document/Document";
import More from "../screens/more/More";

// Screens (Stack) - Acces from Tabs
import Signing from "../screens/home/signing/Signing";
import Calendar from "../screens/home/calendar/Calendar";
import SignDay from "../screens/home/signing/SignDay";
import RequestDetail from "../screens/request/RequestDetail";
import DocumentDetail from "../screens/document/DocumentDetail";
import Notification from "../screens/home/notification/Notification";

// Importar los componentes de navegación
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/** 1. Stack de Autenticación */
const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PasswordRecovery"
        component={passwordRecovery}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

/** 2. Tabs de la App después del Login */
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
      {/* <Tab.Screen
        name="Document"
        component={Document}
        options={{
          tabBarLabel: "Documentos",
          tabBarIcon: ({ color }) => (
            <Icon name="folder" type="font-awesome" color={color} />
          ),
        }}
      /> */}
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
  );
};

///** 3. AppStack de la App después del Login */
const AppStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Signing"
        component={Signing}
        options={{
          headerShown: true,
          title: "Registro de Asistencia",
          headerStyle: { backgroundColor: theme.colors.accent, height: 45 },
          headerTintColor: theme.colors.header,
          headerTitleStyle: {
            textAlign: "center",
            fontSize: 16,
            fontWeight: "ultralight",
          },
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="SignDay"
        component={SignDay}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RequestDetail"
        options={{
          headerShown: true,
          title: "Solicitud",
          headerStyle: {
            backgroundColor: theme.colors.accent,
            height: 45,
          },
          headerTintColor: theme.colors.header,
          headerTitleStyle: {
            textAlign: "center",
            fontSize: 16,
            fontWeight: "ultralight",
          },
          headerTitleAlign: "center",
        }}
        component={RequestDetail}
      />

      <Stack.Screen
        name="DocumentDetail"
        options={{
          headerShown: true,
          title: "Detalles del Documento",
          headerStyle: {
            backgroundColor: theme.colors.accent,
            height: 45,
          },
          headerTintColor: theme.colors.header,
          headerTitleStyle: {
            textAlign: "center",
            fontSize: 16,
            fontWeight: "ultralight",
          },
          headerTitleAlign: "center",
        }}
        component={DocumentDetail}
      />

      <Stack.Screen
        name="Calendar"
        component={Calendar}
        options={{
          headerShown: true,
          title: "Calendario",
          headerStyle: {
            backgroundColor: theme.colors.accent,
            height: 45,
          },
          headerTintColor: theme.colors.header,
          headerTitleStyle: {
            textAlign: "center",
            fontSize: 16,
            fontWeight: "ultralight",
          },
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          headerShown: true,
          title: "Notificaciones",
          headerStyle: {
            backgroundColor: theme.colors.accent,
            height: 45,
          },
          headerTintColor: theme.colors.header,
          headerTitleStyle: {
            textAlign: "center",
            fontSize: 16,
            fontWeight: "ultralight",
          },
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="Document"
        component={Document}
        options={{
          headerShown: true,
          title: "Documentos",
          headerStyle: {
            backgroundColor: theme.colors.accent,
            height: 45,
          },
          headerTintColor: theme.colors.header,
          headerTitleStyle: {
            textAlign: "center",
            fontSize: 16,
            fontWeight: "ultralight",
          },
          headerTitleAlign: "center",
        }}
      />
      
    </Stack.Navigator>
  );
};

const Navigate = () => {
  const { isAuthenticated } = useAuth(); // Consumir el estado de autenticación

  const notificationListener = useRef();
  const responseListener = useRef();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Mostrar badge o actualizar ícono
        console.log("Notificación recibida:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Navegar al buzón si se toca la notificación
        console.log("Respuesta del usuario:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigate;
