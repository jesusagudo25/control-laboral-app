import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Dialog } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import useAuth from "../hooks/useAuth"; // Importar el hook useAuth
import { useFocusEffect } from "@react-navigation/native"; // Importar el hook useFocusEffect

const Connection = (props) => {
  const { logout, setIsConnected, setConnectionType } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión
  const { theme } = useTheme(); // Obtener el tema actual

  const [showDialog, setShowDialog] = useState(false);

  const unsuscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected === false) {
      setIsConnected(false);
      setConnectionType(state.type);
      setShowDialog(true);
    }
  });

  useEffect(() => {
    unsuscribe();
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
      >
        <Dialog.Title title="Alerta" />
        <Text>Por favor, verifica tu conexión a internet.</Text>
      </Dialog>
    </View>
  );
};

export default Connection;
