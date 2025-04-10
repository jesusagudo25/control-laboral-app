import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@rneui/themed";
import { Text } from "@rneui/base";
import useAuth from "../hooks/useAuth"; // Importar el hook useAuth

import "dayjs/locale/es"; // Importar el locale español

import ButtonSigning from "./ButtonSigning";

const ActionSigning = ({ actions, navigation, motives }) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { ignoreAppState } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión

  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      ignoreAppState.current = true; // Ignorar el estado de la app
      let { status } = await Location.requestForegroundPermissionsAsync();
      ignoreAppState.current = false; // Dejar de ignorar el estado de la app
      if (status !== "granted") {
        setErrorMsg(
          "Para poder registrar su asistencia, debe permitir el acceso a la ubicación."
        );
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      setIsLoading(false);
    })();
  }, []);

  return (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.accent} />
      ) : errorMsg ? (
        <Text style={theme.textError}>{errorMsg}</Text>
      ) : (
        <ButtonSigning
          location={location}
          actions={actions}
          navigation={navigation}
          motives={motives}
        />
      )}
    </View>
  );
};

export default ActionSigning;
