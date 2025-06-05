import { View, Text, AppState } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "@rneui/themed";
import useAuth from "../hooks/useAuth";
import { useTheme } from "@rneui/themed";
import CustomModal from "./CustomModal";

const StatusApp = () => {
  const { logout, setAppStatus, ignoreAppState } = useAuth();
  const { theme } = useTheme();

  const [showDialog, setShowDialog] = useState(false);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef(null);

  const AUTO_LOGOUT_DELAY = 5 * 60 * 1000; // 5 minutos

  const handleAppStateChange = (nextAppState) => {
    console.log("Estado de la app:", nextAppState);

    if (ignoreAppState?.current) {
      console.log("Cambio de estado ignorado.");
      return;
    }

    if (nextAppState === "active") {
      setAppStatus("active");
      appState.current = "active";
      setShowDialog(false);

      // Si el usuario regresa, cancelamos el logout programado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (appState.current === "active") {
      setAppStatus(nextAppState);
      appState.current = nextAppState;
      setShowDialog(true);

      // Programar logout en 5 minutos si no regresa
      timeoutRef.current = setTimeout(() => {
        console.log("Auto logout ejecutado por inactividad.");
        logout();
      }, AUTO_LOGOUT_DELAY);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDialogClose = () => {
    setShowDialog(false);
    logout();
  };

  return (
    <View>
      <CustomModal isVisible={showDialog} onBackdropPress={handleDialogClose}>
        <Dialog.Title
          title="Alerta"
          titleStyle={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "bold",
          }}
        />
        <Text style={{ color: theme.colors.text }}>
          Has salido de la aplicación. Si no regresas en 5 minutos, cerraremos
          tu sesión por seguridad.
        </Text>
      </CustomModal>
    </View>
  );
};

export default StatusApp;
