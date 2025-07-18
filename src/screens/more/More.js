import { Card, Text } from "@rneui/base";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ScrollView, Dimensions } from "react-native";
import { Divider, Header } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth

const More = () => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { userName, logout } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión
  const currentDate = new Date(); // Obtener la fecha actual

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
      <View style={[theme.container, { marginTop: 0, paddingTop: 15 }]}>
        <Card containerStyle={{ borderRadius: 10, margin: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{userName}</Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Último acceso: {currentDate.toLocaleDateString()}
          </Text>
        </Card>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 20 }}>
          Opciones
        </Text>
        {/* <Card
          containerStyle={{
            borderTopEndRadius: 10,
            borderTopStartRadius: 10,
            margin: 0,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Configuración de la cuenta
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Administrar tu perfil y preferencias
          </Text>
        </Card>
        <Card
          containerStyle={{
            margin: 0,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Centro de ayuda
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Obtener ayuda y soporte técnico
          </Text>
        </Card> */}
        <TouchableOpacity activeOpacity={0.5} onPress={() => logout()}>
          <Card
            containerStyle={{
              borderRadius: 10,
              margin: 0,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Cerrar sesión
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              Salir de la aplicación
            </Text>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default More;
