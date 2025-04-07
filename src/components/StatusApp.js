import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { AppState } from "react-native";
import { Dialog } from "@rneui/themed";
import useAuth from "../hooks/useAuth"; // Importar el hook useAuth
import { useTheme } from "@rneui/themed";

const StatusApp = (props) => {
  const [showDialog, setShowDialog] = useState(false);
  const { logout, setAppStatus, ignoreAppState } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión
  const { theme } = useTheme(); // Obtener el tema actual

  const handleChange = async (newState) => {
    console.log("Estado de la app:", newState);

    if (ignoreAppState.current) {
      console.log(
        "Ignorando el cambio de estado de la app por permisos u otra accion temporales."
      );
      return;
    }

    if (newState === "active") {
      setAppStatus(newState);
    } else {
      setAppStatus(newState);
      setShowDialog(true);
    }
  };

  useEffect(() => {
    const suscription = AppState.addEventListener("change", handleChange);
    return () => {
      suscription.remove();
    };
  }, []);

  return (
    <View>
      <Dialog
        isVisible={showDialog}
        onBackdropPress={() => {
          setShowDialog(false);
          logout();
        }}
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
        <Text>Has salido de la aplicación, por favor, vuelve a ingresar.</Text>
      </Dialog>
    </View>
  );
};

export default StatusApp;
