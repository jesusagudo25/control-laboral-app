import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function registerForPushNotificationsAsync() {
  try {
    // Verifica si ya lo tienes guardado
    const storedToken = await AsyncStorage.getItem("expo_push_token");
    if (storedToken) return storedToken;

    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permiso para notificaciones denegado");
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Nuevo token Expo:", token);

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("expo_push_token", token);
    } else {
      console.log("Debes usar un dispositivo físico para obtener el token.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (error) {
    console.error("Error al registrar notificaciones:", error);
    return null;
  }
}
