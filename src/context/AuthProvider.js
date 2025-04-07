import React, { useState } from "react";
import { useRef } from "react";
import AuthContext from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState(null);

  const [appStatus, setAppStatus] = useState(AppState.currentState);

  const [connectionType, setConnectionType] = useState("none");
  const [isConnected, setIsConnected] = useState(true);

  const ignoreAppState = useRef(false);

  const login = async (token) => {
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    console.log("Logout called");
    await AsyncStorage.clear();
    setUserName(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        //Attr
        isAuthenticated,
        userName,
        setUserName,
        
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
