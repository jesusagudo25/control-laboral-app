import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@rneui/themed";
import { Icon } from "@rneui/themed";
import { Card } from "@rneui/themed";
import { Button } from "@rneui/themed";
import { useState } from "react";

import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { Platform } from "react-native";

const DocumentDetail = ({ navigation, route }) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { document } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  
  const getFileNameFromUrl = (url) => {
    try {
      return url.split("/").pop(); // obtiene el nombre del archivo de la URL
    } catch {
      return "archivo.descargado";
    }
  };

  const downloadFile = async (url) => {
    try {
      setIsLoading(true);
      const fileName = getFileNameFromUrl(url);
      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri, headers } = await FileSystem.downloadAsync(url, fileUri);

      save(uri, fileName, headers["Content-Type"]);
    } catch (error) {
      setIsLoading(false);
      console.error("Error al descargar archivo:", error);
    }
  };

  const save = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimetype
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch((e) => console.log(e));
        setIsLoading(false);
      } else {
        shareAsync(uri);
        setIsLoading(false);
      }
    } else {
      shareAsync(uri);
      setIsLoading(false);
    }
  };

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
            Detalle de documento
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: theme.colors.header,
            }}
          >
            Aquí puedes ver los detalles de tu documento.
          </Text>
        </View>

        <Card containerStyle={theme.card}>
          <View style={theme.headerRequest}>
            <Icon
              name="file-text-o"
              type="font-awesome"
              size={24}
              color="#1E6091"
            />

            <Text style={theme.titleRequest}>{document.nombre}</Text>
          </View>

          <Text style={theme.subtitleRequest}>
            Descripción:{" "}
            <Text style={theme.subtitleTextRequest}>
              {document.descripcion}
            </Text>
          </Text>
          <Text style={theme.dateRequest}>Fecha: {document.fecha}</Text>
          <Text style={theme.descriptionRequest}>Archivo:</Text>
          {document.url ? (
            <Button
              title="Descargar archivo"
              onPress={() => downloadFile(document.url)}
              containerStyle={theme.buttonPrimaryContainer}
              buttonStyle={theme.buttonPrimaryStyle}
              disabled={isLoading}
              loading={isLoading}
            />
          ) : (
            <Text style={theme.descriptionTextRequest}>
              No hay archivo disponible.
            </Text>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

export default DocumentDetail;
