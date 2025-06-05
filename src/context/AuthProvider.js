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

  const [appStatus, setAppStatus] = useState(AppState.currentState);

  const [connectionType, setConnectionType] = useState("none");
  const [isConnected, setIsConnected] = useState(true);

  const ignoreAppState = useRef(false);

  const login = async (token) => {
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const lastUrl = await AsyncStorage.getItem("apiUrl");
    
    await AsyncStorage.clear();
    setUserName(null);
    setIsAuthenticated(false);
    clearApiUrl(); // Limpiar la URL de la API al cerrar sesión

    if (lastUrl) {
      setApiUrl(lastUrl); // Restaurar la última URL de la API
    }
  };

  return (
    <AuthContext.Provider
      value={{
        //Attr
        isAuthenticated,
        userName,
        geoLocation,
        countNotifications,

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
