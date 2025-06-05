import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Dialog } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import useAuth from "../hooks/useAuth";
import CustomModal from "./CustomModal"; // Asegúrate de que la ruta sea correcta

const Connection = () => {
  const { logout, setIsConnected, setConnectionType } = useAuth();
  const { theme } = useTheme();

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);

      if (!state.isConnected) {
        setShowDialog(true);
      } else {
        setShowDialog(false); // Oculta el diálogo si vuelve la conexión
      }
    });

    return () => {
      unsubscribe(); // Limpia el listener al desmontar
    };
  }, []);

  const handleClose = () => {
    setShowDialog(false);
    logout(); // Solo cerrar sesión si es tu intención
  };

  return (
    <View>
      <CustomModal isVisible={showDialog} onBackdropPress={handleClose}>
        <Dialog.Title
          title="Alerta"
          titleStyle={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "bold",
          }}
        />
        <Text style={{ color: theme.colors.text }}>
          Por favor, verifica tu conexión a internet.
        </Text>
      </CustomModal>
    </View>
  );
};

export default Connection;
