import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "@rneui/themed";

import "dayjs/locale/es"; // Importar el locale español
import { Button } from "@rneui/base";

const ButtonSigning = ({ actions }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  console.log(actions);
  console.log(API_URL);

  return (
    <View>
      {actions.includes("ficharentrada") && (
        <Button
          title="Iniciar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => handleLogin()}
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
          type="outline"
          titleStyle={{ color: theme.colors.primary }}
          containerStyle={theme.buttonSecondaryContainer}
          buttonStyle={theme.buttonSecondaryStyle}
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
