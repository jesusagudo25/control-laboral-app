import React from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { Icon } from "@rneui/themed";

const RequestDetail = ({ route, navigation }) => {
  const { item } = route.params; // Desestructuración de los parámetros

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Icon name={item.icono} type="font-awesome" size={24} color="#1E6091" />

        <Text style={styles.title}>{item.referencia}</Text>
      </View>

      <Text style={styles.subtitle}>Tipo: {item.tipo}</Text>
      <Text style={styles.date}>Fecha: {item.fecha}</Text>

      <Text style={styles.description}>Descripción:</Text>
      <Text style={styles.descriptionText}>{item.descripcion}</Text>

      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
        Estado: {item.status}
      </Text>

      <Button title="Volver al Historial" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

// Función para obtener el color del estado de la solicitud
const getStatusColor = (status) => {
  if (status === "Aprobado") return "green";
  if (status === "Rechazado") return "red";
  return "#f7941e"; // Default color for pending or others
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
