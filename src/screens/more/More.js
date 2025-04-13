import { Card, Text } from "@rneui/base";
import React from "react";
import { View } from "react-native";
import { ScrollView, Dimensions } from "react-native";
import { Divider, Header } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { useAuth } from "../../hooks/useAuth"; // Importar el hook useAuth

const More = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <Header
        backgroundColor={theme.colors.accent}
        barStyle="default"
        centerComponent={{
          text: `Más`,
          style: {
            color: theme.colors.header,
            fontSize: 16,
          },
        }}
        containerStyle={{ width: Dimensions.get("window").width }}
        placement="center"
      />
      <View style={[theme.container, { marginTop: 0, paddingTop: 10 }]}>
        <Card>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Nombre de usuario
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>Usuario actual</Text>
        </Card>

        <Card>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Configuración
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Ajustes de la aplicación
          </Text>
        </Card>
        <Card>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Ayuda</Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Preguntas frecuentes
          </Text>
        </Card>
        <Card>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Acerca de</Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Información sobre la aplicación
          </Text>
        </Card>
        <Card>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Cerrar sesión
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Salir de la aplicación
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

export default More;
