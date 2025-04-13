import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Card, Icon, Header } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@rneui/themed";
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth

const Document = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const { ignoreAppState } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);

    // Simulación paginada
    const newDocs = [
      {
        id: `${page}-1`,
        nombre: `Documento ${page}-A`,
        tipo: "Baja médica",
        fecha: "2025-04-12",
        url: "https://pdfobject.com/pdf/sample.pdf", // URL simulada
      },
      {
        id: `${page}-2`,
        nombre: `Documento ${page}-B`,
        tipo: "Justificante",
        fecha: "2025-04-12",
        url: "https://pdfobject.com/pdf/sample.pdf",
      },
    ];

    setDocuments((prev) => [...prev, ...newDocs]);
    setPage((prev) => prev + 1);
    setIsFetching(false);

    if (page >= 3) setHasMore(false); // Simulación fin
  };

  const handleUpload = async () => {
    ignoreAppState.current = true; // Ignorar el estado de la app

    const result = await DocumentPicker.getDocumentAsync({});

    ignoreAppState.current = false; // Dejar de ignorar el estado de la app

    console.log(result);
    

    if (result.type === "success") {
      alert(`Documento "${result.name}" listo para subir.`);
    }
  };

  const renderItem = ({ item }) => (
    <Card containerStyle={theme.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("DocumentDetail", { document: item })
        }
      >
        <View style={styles.row}>
          <Icon
            name="file-pdf-o"
            type="font-awesome"
            size={24}
            color="#D32F2F"
          />
          <View style={styles.info}>
            <Text style={styles.title}>{item.nombre}</Text>
            <Text style={styles.subtitle}>{item.tipo}</Text>
            <Text style={styles.date}>Fecha: {item.fecha}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <>
      <Header
        backgroundColor={theme.colors.accent}
        barStyle="default"
        centerComponent={{
          text: `Documentos`,
          style: {
            color: theme.colors.header,
            fontSize: 16,
          },
        }}
        containerStyle={{ width: Dimensions.get("window").width }}
        placement="center"
      />
      <View style={[theme.container, { marginTop: 0, paddingTop: 10 }]}>
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={fetchDocuments}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching ? (
              <ActivityIndicator size="large" color="#1E6091" />
            ) : null
          }
        />
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Icon name="upload" type="font-awesome" color="#fff" size={20} />
          <Text style={styles.uploadText}>Subir nuevo documento</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    marginLeft: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7941e",
    padding: 15,
    margin: 10,
    borderRadius: 5,
  },
  uploadText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default Document;
