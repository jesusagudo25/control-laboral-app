import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Button, Image, Dialog, Icon, CheckBox } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import axios from "axios";
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth
import useApi from "../../hooks/useApi";
import { registerForPushNotificationsAsync } from "../../hooks/usePushNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomModal from "../../components/CustomModal";

const Login = ({ navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual

  const { login, isConnected, rememberMe, saveRememberMe } = useAuth();
  const { apiUrl, setApiUrl, saveCompanyInfo } = useApi();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");

  // Relacionado a url set engranaje
  const [modalVisible, setModalVisible] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const handleSave = () => {
    // Validar que la URL no esté vacía
    if (!newUrl.trim()) {
      showErrorMessage("Por favor, ingresa una URL válida.");
      return;
    }

    // Validar que la URL tenga el formato correcto
    if (!isValidUrl(newUrl)) {
      showErrorMessage("Por favor, ingresa una URL válida.");
      return;
    }

    setApiUrl(newUrl);
    setModalVisible(false);
  };

  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    if (!isConnected) {
      showErrorMessage("Por favor, verifica tu conexión a internet.");
      return;
    }

    // Validar que haya una URL configurada
    if (!apiUrl || !isValidUrl(apiUrl)) {
      showErrorMessage("Por favor, configura una URL válida en el engranaje.");
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
        await login(response.data.access_token, rememberMe, username, password);
        await saveCompanyInfo();
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
    return axios.post(`${apiUrl}/custom/fichajes/api/index.php`, {
      action: "auth",
      grant_type: "client_credentials",
      client_id: username,
      client_secret: password,
    });
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
      setLoadingForm(true);
      const token = await registerForPushNotificationsAsync();
      // guardar en el almacenamiento local para usarlo más tarde
      if (token) {
        try {
          await AsyncStorage.setItem("expo_push_token", token);
        } catch (error) {
          console.error("Error al guardar el token:", error);
        }
      }

      // Cargar la URL de la API desde AsyncStorage al iniciar
      const storedApiUrl = await AsyncStorage.getItem("apiUrl");
      console.log("Stored API URL:", storedApiUrl);

      if (storedApiUrl) {
        setApiUrl(storedApiUrl);
        setNewUrl(storedApiUrl); // Inicializar el campo de entrada con la URL almacenada
      }

      // Cargar las últimas credenciales si "Recordarme" está activado
      const storedRememberMe = await AsyncStorage.getItem("rememberMe");
      console.log("Stored rememberMe:", storedRememberMe);
      if (storedRememberMe === "true") {
        saveRememberMe(true);
        const lastUsername = await AsyncStorage.getItem("lastUsername");
        const lastPassword = await AsyncStorage.getItem("lastPassword");
        if (lastUsername) setUsername(lastUsername);
        if (lastPassword) setPassword(lastPassword);
      } else {
        saveRememberMe(false);
        setUsername("");
        setPassword("");
      }
      setLoadingForm(false);
    })();
  }, []);

  if (loadingForm) {
    return (
      <ActivityIndicator
        size="large"
        color="#f7941e"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.container}>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 5,
            right: 30,
            zIndex: 1,
          }}
          onPress={() => {
            setModalVisible(true);
            setNewUrl(apiUrl || ""); // Inicializar con la URL actual o vacía
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              padding: 10,
              borderRadius: "50%",
              borderColor: theme.colors.primary,
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Icon
              name="cog"
              type="font-awesome"
              color={theme.colors.primary}
              size={24}
            />
          </View>
        </TouchableOpacity>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
            marginTop: 20,
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

        {/* Remember me checkbox*/}
        <CheckBox
          title="Recordarme"
          checkedColor={theme.colors.primary}
          uncheckedColor={theme.colors.primary}
          containerStyle={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.background,
            margin: 0,
            padding: 0,
            marginBottom: 2,
            marginTop: 2,
            alignSelf: "flex-start",
          }}
          textStyle={{ color: theme.colors.text }}
          checked={rememberMe}
          onPress={() => saveRememberMe(!rememberMe)}
        />

        {/* Modals */}

        <CustomModal
          isVisible={showDialog}
          onBackdropPress={() => setShowDialog(false)}
        >
          <Dialog.Title
            title="Alerta"
            titleStyle={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "bold",
            }}
          />
          <Text style={{ color: theme.colors.text }}>{message}</Text>
        </CustomModal>

        <CustomModal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
        >
          <Dialog.Title
            title="Configurar Acceso"
            titleStyle={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "bold",
            }}
          />
          <Text style={{ color: theme.colors.text, marginVertical: 10 }}>
            Ingresa la URL de tu API:
          </Text>
          <TextInput
            placeholder="https://tuempresa.com/api"
            style={theme.input}
            value={newUrl}
            onChangeText={setNewUrl}
            multiline
          />
          <Button
            containerStyle={{
              marginTop: 10,
              marginBottom: 10,
              width: "100%",
            }}
            buttonStyle={theme.buttonPrimaryStyle}
            disabledStyle={{
              backgroundColor: theme.colors.disabled,
              borderRadius: 3,
              paddingHorizontal: 15,
            }}
            loading={loading}
            disabled={loading}
            title="Guardar"
            onPress={handleSave}
          />
        </CustomModal>

        {/* <TouchableOpacity
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
        </TouchableOpacity> */}

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

        {/* <Button
          title="Crea tu usuario o abre tu cuenta"
          type="outline"
          titleStyle={{ color: theme.colors.primary }}
          containerStyle={theme.buttonSecondaryContainer}
          buttonStyle={theme.buttonSecondaryStyle}
          onPress={() => navigation.navigate("Register")}
        /> */}
      </View>
    </ScrollView>
  );
};

export default Login;
