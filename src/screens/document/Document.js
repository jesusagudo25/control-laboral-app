import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Card, Icon, Header, Button, Dialog, Skeleton } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@rneui/themed";
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth
import useForm from "../../hooks/useForm"; // Importar el hook useForm

import SkeletonDocument from "../../components/SkeletonDocument";

const Document = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const { ignoreAppState } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión

  const { name, descripcion, file, handleInputChange, handleReset } = useForm({
    name: "",
    descripcion: "",
    file: "",
  });

  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setDocuments([]); // Limpiar la lista de documentos al entrar
      setPage(1); // Reiniciar la página
      setHasMore(true); // Reiniciar el estado de más documentos

      fetchDocuments(); // Llamar a la función para cargar documentos
    }, [])
  );

  const fetchDocuments = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/index.php?action=user_documents&page=${page}`
      );
      const data = response.data; // Simular la respuesta de la API

      //Map de la respuesta de la API:  data.data.documents.map
      const newDocs = data.data.documents.map((item) => ({
        id: item.id,
        nombre: item.nombre_original.split(".")[0], // Nombre del archivo sin extensión
        descripcion: item.descripcion || "No hay descripción",
        fecha: item.date.split(" ")[0],
        url: item.document,
      }));

      console.log("newDocs", newDocs); // Verificar los nuevos documentos antes de agregarlos

      setDocuments((prev) => [...prev, ...newDocs]);
      setHasMore(data.total_pages > page); // Cambia esto para simular más datos
      setPage((prev) => prev + 1); // Incrementar la página para la próxima carga
    } catch (error) {
      console.error("Error al cargar documentos", error);
    } finally {
      setIsLoading(false); // Ocultar el indicador de carga
    }
  };

  const handleUpload = async () => {
    ignoreAppState.current = true; // Ignorar el estado de la app

    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf", // ← solo permite seleccionar PDF
      copyToCacheDirectory: true,
    });

    ignoreAppState.current = false; // Dejar de ignorar el estado de la app

    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const file = result.assets[0];

    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    handleInputChange("file", base64); // Guardar el archivo en el estado
    handleInputChange("name", file.name); // Guardar el nombre del archivo en el estado
  };

  const handleSave = async () => {
    setIsLoading(true); // Mostrar el indicador de carga
    setShowDialog(false); // Cerrar el diálogo
    const params = {
      action: "user_documents",
      name,
      descripcion,
      file,
    };

    console.log("params", params); // Verificar los parámetros antes de enviar

    try {
      const response = await axios.post(`${API_URL}/index.php`, params);
      if (response.data.success) {
        console.log("Documento subido correctamente", response.data.data.msg);
        console.log(response.data);

        setDocuments((prev) => [
          ...prev,
          {
            id: response.data.data.file_id, // ID del archivo subido
            nombre: name.split(".")[0], // Nombre del archivo sin extensión
            descripcion,
            fecha: new Date().toLocaleDateString(), // Fecha actual
            url: "https://pdfobject.com/pdf/sample.pdf", // URL simulada
          },
        ]); // Agregar el nuevo documento a la lista

        setIsLoading(false); // Ocultar el indicador de carga
        handleReset(); // Limpiar el formulario
      } else {
        console.error("Error al subir el documento", response.data.msg);
      }
    } catch (error) {
      console.error("Error al subir el documento", error);
      setIsLoading(false); // Ocultar el indicador de carga
    }
  };

  const renderFooter = () => {
    return (
      <View >
        {/* Simula 2 tarjetas en loading */}
        {[1, 2, 3, 4].map((_, index) => (
          <SkeletonDocument
            key={index}
            height={100}
            width="100%"
            style={{ borderRadius: 6, marginBottom: 15 }}
          />
        ))}
      </View>
    );
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
            name="file-text-o"
            type="font-awesome"
            size={24}
            color="#1E6091"
          />
          <View style={styles.info}>
            <Text style={styles.title}>{item.nombre}</Text>
            <Text style={styles.subtitle}>{item.descripcion}</Text>
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
          ListFooterComponent={isLoading ? renderFooter : null}
        />
        {/* Before onPress={handleUpload} */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowDialog(true)}
        >
          <Icon name="upload" type="font-awesome" color="#fff" size={20} />
          <Text style={styles.uploadText}>Subir nuevo documento</Text>
        </TouchableOpacity>
      </View>
      <Dialog
        isVisible={showDialog}
        onBackdropPress={() => setShowDialog(false)}
        overlayStyle={{
          backgroundColor: theme.colors.header,
          borderRadius: 10,
          padding: 20,
        }}
        dialogStyle={{
          backgroundColor: theme.colors.header,
          borderRadius: 10,
        }}
        dialogContainerStyle={{
          backgroundColor: theme.colors.header,
          borderRadius: 10,
        }}
        dialogTitleStyle={{
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: "bold",
        }}
        titleStyle={{ color: theme.colors.text }}
      >
        <Dialog.Title title="Nuevo Documento" />
        <Text>Selecciona el documento que deseas subir.</Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#1E6091",
            padding: 12,
            marginVertical: 15,
          }}
          onPress={handleUpload}
        >
          <Icon name="upload" type="font-awesome" color="#0D0D0D" size={20} />
          <Text style={styles.uploadTextModal}>
            {file ? `Archivo: ${name}` : "Seleccionar archivo"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={theme.input}
          placeholder="Descripción"
          placeholderTextColor={theme.colors.text}
          multiline={true}
          numberOfLines={4}
          value={descripcion}
          onChangeText={(text) => handleInputChange("descripcion", text)}
        />

        <Button
          title="Guardar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={handleSave}
          disabled={isLoading}
          loading={isLoading}
        />
      </Dialog>
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
    color: "#FFF",
    marginLeft: 10,
  },
  uploadTextModal: {
    color: "#0D0D0D",
    marginLeft: 10,
  },
});

export default Document;
