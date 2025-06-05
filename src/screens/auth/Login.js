import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, Image, Dialog } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import axios from "axios";
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth
import { registerForPushNotificationsAsync } from "../../hooks/usePushNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

const Login = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const { login, isConnected } = useAuth(); // aquí traes la función de login del contexto

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!isConnected) {
      showErrorMessage("Por favor, verifica tu conexión a internet.");
      return;
    }

    if (!username || !password) {
      showErrorMessage("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const response = await authenticateUser(username, password);
      if (response.data && response.data.access_token) {
        // Llamas a login desde el contexto con el token y el nombre de usuario
        await login(response.data.access_token);
        if (Device.isDevice) {
          await sendTokenToServer(); // Enviar el token al servidor
        }
        resetForm();
        navigation.navigate("Home"); // o puedes usar una navegación controlada según auth
      } else {
        showErrorMessage("Por favor, verifica tus credenciales.");
      }
    } catch (error) {
      console.error(error);
      showErrorMessage("Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const authenticateUser = async (username, password) => {
    return axios.post(`${API_URL}/index.php`, {
      action: "auth",
      grant_type: "client_credentials",
      client_id: username,
      client_secret: password,
    });
  };

  const sendTokenToServer = async () => {
    try {
      const token = await AsyncStorage.getItem("expo_push_token");
      if (token) {
        await axios.patch(`${API_URL}/index.php`, {
          action: "user_token",
          expo_token: token,
        });
        console.log("Token enviado al servidor:", token);
      }
    } catch (error) {
      console.error("Error al enviar el token al servidor:", error);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
  };

  const showErrorMessage = (message) => {
    setMessage(message);
    setShowDialog(true);
  };

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      console.log("Token obtenido o recuperado:", token);
      // guardar en el almacenamiento local para usarlo más tarde
      if (token) {
        try {
          await AsyncStorage.setItem("expo_push_token", token);
          console.log("Token guardado en AsyncStorage");
        } catch (error) {
          console.error("Error al guardar el token:", error);
        }
      }
    })();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.container}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../../../assets/logo_small.png")}
            style={{
              width: 180,
              height: 100,
              alignSelf: "center",
              resizeMode: "contain",
            }}
          />
        </View>

        <TextInput
          style={theme.input}
          placeholder="Ingresa tu usuario"
          onChangeText={setUsername}
          placeholderTextColor={theme.colors.text}
          value={username}
        />
        <TextInput
          style={theme.input}
          placeholder="Ingresa tu contraseña"
          onChangeText={setPassword}
          placeholderTextColor={theme.colors.text}
          value={password}
          secureTextEntry={true}
        />

        <Dialog
          isVisible={showDialog}
          onBackdropPress={() => setShowDialog(false)}
          overlayStyle={{
            backgroundColor: theme.colors.header,
            borderRadius: 10,
            padding: 20,
          }}
          dialogStyle={{
            backgroundColor: theme.colors.header,
            borderRadius: 10,
          }}
          dialogContainerStyle={{
            backgroundColor: theme.colors.header,
            borderRadius: 10,
          }}
          dialogTitleStyle={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "bold",
          }}
          titleStyle={{ color: theme.colors.text }}
        >
          <Dialog.Title title="Alerta" />
          <Text>{message}</Text>
        </Dialog>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("PasswordRecovery")}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 15,
              color: theme.colors.text,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <Button
          title="Iniciar sesión"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          disabledStyle={{
            backgroundColor: theme.colors.disabled,
            borderRadius: 3,
            paddingHorizontal: 15,
          }}
          onPress={() => handleLogin()}
          loading={loading}
          disabled={loading}
        />

        <Button
          title="Crea tu usuario o abre tu cuenta"
          type="outline"
          titleStyle={{ color: theme.colors.primary }}
          containerStyle={theme.buttonSecondaryContainer}
          buttonStyle={theme.buttonSecondaryStyle}
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </ScrollView>
  );
};

export default Login;
