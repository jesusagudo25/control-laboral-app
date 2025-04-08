import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { View } from "react-native";
import { useTheme } from "@rneui/themed";
import axios from "axios";

import "dayjs/locale/es"; // Importar el locale español
import { Button } from "@rneui/base";

import useForm from "../hooks/useForm";

const ButtonSigning = ({ location, actions, navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { description, motivo_pausa, longitude, latitude } = useForm({
    description: "",
    motivo_pausa: "",
    longitude: location?.longitude,
    latitude: location?.latitude,
  });

  const handleSignIn = async () => {
    const params = {
      action: "user_fichaje",
      fichaje: "ficharentrada",
      description,
      motivo_pausa,
      long: longitude,
      lat: latitude,
    };
    console.log("ButtonSigning params: ", params);

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/index.php`, params);
      //console.log("Response: ", response.data);
      if (response.data.success) {
        console.log("Success: ", response.data);
        setErrorMsg(null);

        navigation.navigate("Signing", {
          message: "Entrada registrada correctamente.",
          type: "success",
        });
      } else {
        console.log("Error: ", response.data.msg);
        setErrorMsg(response.data.msg);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error: ", error);
      setErrorMsg("Error al registrar la entrada. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  console.log("ButtonSigning location: ", location);
  //console.log("ButtonSigning actions: ", actions);

  return (
    <View>
      {actions.includes("ficharentrada") && (
        <Button
          title="Iniciar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => handleSignIn()}
          disabled={isLoading}
          loading={isLoading}
        />
      )}

      {actions.includes("ficharpausa") && (
        <View>
          <Button
            title="Pausar"
            containerStyle={theme.buttonPrimaryContainer}
            buttonStyle={theme.buttonPrimaryStyle}
          />

          <Button
            title="Finalizar"
            type="outline"
            titleStyle={{ color: theme.colors.primary }}
            containerStyle={theme.buttonSecondaryContainer}
            buttonStyle={theme.buttonSecondaryStyle}
          />
        </View>
      )}

      {actions.includes("ficharfirma") && (
        <Button
          title="Firmar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => navigation.navigate("SignDay")}
        />
      )}

      {actions.includes("ficharreanudacion") && (
        <Button
          title="Reanudar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
        />
      )}
    </View>
  );
};

export default ButtonSigning;
