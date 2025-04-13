import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Icon } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { Card } from "@rneui/themed";
import { Button } from "@rneui/themed";
import useAuth from "../../hooks/useAuth";

const RequestDetail = ({ route, navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { userName } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión
  const { item } = route.params; // Desestructuración de los parámetros

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.boxHidden} />
      <View style={theme.containerBoxHidden}>
        <View
          style={{
            marginBottom: 10,
            marginHorizontal: 10,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 10,
              color: theme.colors.header,
            }}
          >
            Detalle de Solicitud
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: theme.colors.header,
            }}
          >
            {userName}
          </Text>
        </View>

        <Card containerStyle={theme.card}>
          <View style={styles.header}>
            <Icon
              name={item.icono}
              type="font-awesome"
              size={24}
              color="#1E6091"
            />

            <Text style={styles.title}>Ref. {item.referencia}</Text>
          </View>

          <Text style={styles.subtitle}>
            Tipo: <Text style={styles.subtitleText}>{item.tipo}</Text>
          </Text>
          <Text style={styles.date}>Fecha: {item.fecha}</Text>

          <Text style={styles.description}>Descripción:</Text>
          <Text style={styles.descriptionText}>{item.descripcion}</Text>

          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            Estado: <Text style={styles.subtitleText}>{item.status}</Text>
          </Text>

          <Button
            title="Volver al Historial"
            containerStyle={theme.buttonPrimaryContainer}
            buttonStyle={theme.buttonPrimaryStyle}
            onPress={() => navigation.goBack()}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

// Función para obtener el color del estado de la solicitud
const getStatusColor = (status) => {
  if (status === "Aprobado") return "black";
  if (status === "Rechazado") return "black";
  return "black"; // Default color for pending or others
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E6091",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
  },
  subtitleText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "400",
  },
  date: {
    fontSize: 16,
    marginTop: 5,
    color: "#777",
  },
  description: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 16,
    marginTop: 5,
    color: "#555",
  },
  status: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
});

export default RequestDetail;
