import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Button, Image, Dialog, Icon, CheckBox } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import axios from "axios";
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth
import useApi from "../../hooks/useApi";
import { registerForPushNotificationsAsync } from "../../hooks/usePushNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomModal from "../../components/CustomModal";
import ModeSwitch from "../../components/common/ModeSwitch";
import KioskFlow from "../../components/kiosk/KioskFlow";

const Login = ({ navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual

  const { login, isConnected, rememberMe, saveRememberMe } = useAuth();
  const { apiUrl, setApiUrl, saveCompanyInfo } = useApi();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("personal");
  const [isKioskOperational, setIsKioskOperational] = useState(false);

  const showInitialScreenControls = !isKioskOperational;

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setIsKioskOperational(false);
  };

  const now = new Date();
  const weekdays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const renderedDate = `${weekdays[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]} • ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Relacionado a url set engranaje
  const [modalVisible, setModalVisible] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const handleSave = () => {
    const newUrlClear = newUrl.trim().toLowerCase();

    // Validar que la URL no esté vacía
    if (!newUrlClear) {
      showErrorMessage("Por favor, ingresa una URL válida.");
      return;
    }

    // Validar que la URL tenga el formato correcto
    if (!isValidUrl(newUrlClear)) {
      showErrorMessage("Por favor, ingresa una URL válida.");
      return;
    }

    setApiUrl(newUrlClear);
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

      if (storedApiUrl) {
        setApiUrl(storedApiUrl);
        setNewUrl(storedApiUrl); // Inicializar el campo de entrada con la URL almacenada
      }

      // Cargar las últimas credenciales si "Recordarme" está activado
      const storedRememberMe = await AsyncStorage.getItem("rememberMe");
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
      <View style={styles.header}>
        <View style={styles.headerModeGroup}>
          <Icon
            name={mode === "personal" ? "user" : "desktop"}
            type="font-awesome"
            color="#ffffff"
            size={15}
          />
          <Text style={styles.headerMode}>
            {mode === "personal" ? "Modo personal" : "Modo kiosco"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text numberOfLines={1} style={styles.headerDate}>
            {renderedDate}
          </Text>
          {showInitialScreenControls && (
            <TouchableOpacity
              accessibilityLabel="Configurar URL de acceso"
              accessibilityRole="button"
              onPress={() => {
                setModalVisible(true);
                setNewUrl(apiUrl || "");
              }}
              style={styles.settingsButton}
            >
              <Icon name="cog" type="font-awesome" color="#ffffff" size={17} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showInitialScreenControls && (
        <ModeSwitch mode={mode} onChange={handleModeChange} />
      )}

      {mode === "kiosk" ? (
        <KioskFlow onOperationalStateChange={setIsKioskOperational} />
      ) : (
        <View style={theme.container}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
              marginTop: 8,
            }}
          >
            <Image
              source={require("../../../assets/logo_small.png")}
              style={{
                width: 150,
                height: 78,
                alignSelf: "center",
                resizeMode: "contain",
              }}
            />
          </View>

          <Text style={theme.label}>Usuario</Text>
          <TextInput
            style={theme.input}
            placeholder="Ingresa tu usuario"
            onChangeText={setUsername}
            placeholderTextColor={theme.colors.text}
            value={username}
          />

          <Text style={theme.label}>Contraseña</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[theme.input, { paddingRight: 45 }]}
              placeholder="Ingresa tu contraseña"
              onChangeText={setPassword}
              placeholderTextColor={theme.colors.text}
              value={password}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((current) => !current)}
              style={{
                position: "absolute",
                right: 12,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              <Icon
                name={showPassword ? "eye-slash" : "eye"}
                type="font-awesome"
                color={theme.colors.text}
                size={20}
              />
            </TouchableOpacity>
          </View>

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
      )}

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
          containerStyle={{ marginTop: 10, marginBottom: 10, width: "100%" }}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    backgroundColor: "#f7941e",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerModeGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
  },
  headerMode: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  headerRight: { alignItems: "center", flexDirection: "row", flexShrink: 1 },
  headerDate: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: 12,
    marginLeft: 12,
    textAlign: "right",
    textTransform: "capitalize",
  },
  settingsButton: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.55)",
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    marginLeft: 10,
    width: 32,
  },
});

export default Login;
