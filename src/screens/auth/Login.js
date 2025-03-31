import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, Image, Dialog, Divider } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@rneui/themed";
import Connection from "../../components/Connection";
import axios from "axios";

const Login = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");

  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState("none");

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
      await saveToken(response.data.access_token);
      resetForm();
      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
      showErrorMessage("Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const authenticateUser = async (username, password) => {
    return axios.post(`${API_URL}`, {
      action: "auth",
      grant_type: "client_credentials",
      client_id: username,
      client_secret: password,
    });
  };

  const saveToken = async (token) => {
    await AsyncStorage.setItem("token", token);
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
  };

  const showErrorMessage = (message) => {
    setMessage(message);
    setShowDialog(true);
  };

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
          <Dialog.Title title="Error" />
          <Text>{message}</Text>
        </Dialog>

        <Connection
          setIsConnected={setIsConnected}
          setConnectionType={setConnectionType}
        />

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
            }}
          >
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <Button
          title="Iniciar sesión"
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 25,
            marginBottom: 10,
          }}
          buttonStyle={{
            backgroundColor: theme.colors.accent,
            borderRadius: 3,
            paddingHorizontal: 15,
            paddingVertical: 10,
            width: "100%",
          }}
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
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 20,
          }}
          buttonStyle={{
            borderColor: theme.colors.primary,
            borderWidth: 1.2,
            borderRadius: 3,
            paddingHorizontal: 15,
            paddingVertical: 10,
            width: "100%",
          }}
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </ScrollView>
  );
};

export default Login;
