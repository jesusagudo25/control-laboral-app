import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@rneui/themed";
import { Icon } from "@rneui/themed";
import { Card } from "@rneui/themed";

const DocumentDetail = ({ navigation, route }) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const { document } = route.params;

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
          <Text style={theme.descriptionRequest}>Descargar:</Text>
          <Text style={theme.descriptionTextRequest}> {document.url}</Text>

        </Card>
      </View>
    </ScrollView>
  );
};

export default DocumentDetail;
