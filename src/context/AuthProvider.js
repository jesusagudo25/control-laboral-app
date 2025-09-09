import React, { useState } from "react";
import { useRef } from "react";
import AuthContext from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import useApi from "../hooks/useApi"; // Importar el hook useApi

const AuthProvider = ({ children }) => {
  const { setApiUrl, clearApiUrl } = useApi(); // Importar el hook useApi

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(null);
  const [geoLocation, setGeoLocation] = useState(null);
  const [countNotifications, setCountNotifications] = useState(0);

  const [rememberMe, setRememberMe] = useState(false);
  const [lastUsername, setLastUsername] = useState(null);
  const [lastPassword, setLastPassword] = useState(null);

  const [appStatus, setAppStatus] = useState(AppState.currentState);

  const [connectionType, setConnectionType] = useState("none");
  const [isConnected, setIsConnected] = useState(true);

  const ignoreAppState = useRef(false);

  const login = async (token, remember, username, password) => {
    if (remember) {
      await saveLastCredentials(username, password);
    } else {
      await clearLastCredentials();
    }
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const lastUrl = await AsyncStorage.getItem("apiUrl");
    const lastUsername = await AsyncStorage.getItem("lastUsername");
    const lastPassword = await AsyncStorage.getItem("lastPassword");
    const lastRememberMe = await AsyncStorage.getItem("rememberMe");

    await AsyncStorage.clear();
    await saveRememberMe(lastRememberMe === "true");

    setUserName(null);
    setIsAuthenticated(false);
    clearApiUrl(); // Limpiar la URL de la API al cerrar sesión
    clearLastCredentials();

    if (lastUrl) {
      setApiUrl(lastUrl); // Restaurar la última URL de la API
    }

    if (lastRememberMe === "true") {
      await saveLastCredentials(lastUsername, lastPassword);
    }
  };

  const saveLastCredentials = async (username, password) => {
    await AsyncStorage.setItem("lastUsername", username);
    await AsyncStorage.setItem("lastPassword", password);
    setLastUsername(username);
    setLastPassword(password);
  };

  const clearLastCredentials = async () => {
    await AsyncStorage.removeItem("lastUsername");
    await AsyncStorage.removeItem("lastPassword");
    setLastUsername(null);
    setLastPassword(null);
  };

  const loadLastCredentials = async () => {
    const username = await AsyncStorage.getItem("lastUsername");
    const password = await AsyncStorage.getItem("lastPassword");
    if (username) setLastUsername(username);
    if (password) setLastPassword(password);
  };

  const saveRememberMe = async (value) => {
    setRememberMe(value);
    await AsyncStorage.setItem("rememberMe", value ? "true" : "false");
  };

  React.useEffect(() => {
    loadLastCredentials();
    AsyncStorage.getItem("rememberMe").then((value) => {
      if (value === "true") {
        setRememberMe(true);
      } else {
        setRememberMe(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        //Attr
        isAuthenticated,
        userName,
        geoLocation,
        countNotifications,
        rememberMe,
        lastUsername,
        lastPassword,

        appStatus,
        ignoreAppState,
        connectionType,
        isConnected,

        //Methods
        login,
        logout,
        setConnectionType,
        setIsConnected,
        setAppStatus,
        setUserName,
        setGeoLocation,
        setCountNotifications,
        saveRememberMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
