import React, { useEffect, useState } from "react";
import { View, ScrollView, AppState } from "react-native";
import { Card, Divider, Text, useTheme } from "@rneui/themed";

import "dayjs/locale/es"; // Importar el locale español
import useAuth from "../hooks/useAuth";
import ActionSigning from "./ActionSigning";

const CardSigning = ({
  turnData,
  countTurnData,
  totalHours,
  actions,
  navigation,
}) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { userName } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión
  const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME; // Nombre de la app

  return (
    <Card containerStyle={theme.showSigning}>
      <View
        style={{
          flexDirection: "column",
          width: "100%",
        }}
      >
        <View>
          <Text style={theme.textSigning}>{`${userName}`}</Text>
          <Text style={theme.titleSigning}>Empresa</Text>
          <Text style={theme.textSigning}>{`${APP_NAME}`}</Text>
        </View>

        <View>
          <Text style={theme.titleSigning}>
            Jornada laboral ({countTurnData})
          </Text>

          <Divider />

          {Object.keys(turnData).map((key) => {
            const item = turnData[key];
            return (
              <View key={key}>
                <Text style={theme.hoursSigning}>
                  {item.in} a {item.out}
                </Text>
                <Divider />
              </View>
            );
          })}

          <Text style={theme.titleSigning}>Total jornada: {totalHours}</Text>
        </View>

        <ActionSigning actions={actions} navigation={navigation} />
      </View>
    </Card>
  );
};

export default CardSigning;
