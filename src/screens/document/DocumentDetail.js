import React from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@rneui/themed";
import { StyleSheet } from "react-native";
import { Icon } from "@rneui/themed";

const DocumentDetail = ({ navigation, route }) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { document } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {" "}
          <Icon
            name="file-text-o"
            type="font-awesome"
            size={24}
            color="#1E6091"
            style={{ marginRight: 10 }}
          />
          {document.nombre}
        </Text>
        <Text style={styles.subtitle}>Descripción: {document.descripcion}</Text>
        <Text style={styles.date}>Fecha: {document.fecha}</Text>
      </View>
      <WebView
        source={{
          uri: `https://docs.google.com/gview?embedded=true&url=${document.url}`,
        }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        useWebKit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E6091",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
  date: {
    fontSize: 14,
    color: "#999",
  },
});

export default DocumentDetail;
