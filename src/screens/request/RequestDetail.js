import { View, Text, ScrollView } from "react-native";
import { Icon } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { Card } from "@rneui/themed";
import { Button } from "@rneui/themed";

const RequestDetail = ({ route, navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual
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
            Aquí puedes ver los detalles de tu solicitud.
          </Text>
        </View>

        <Card containerStyle={theme.card}>
          <View style={theme.headerRequest}>
            <Icon
              name={item.icono}
              type="font-awesome"
              size={24}
              color="#1E6091"
            />

            <Text style={theme.titleRequest}>Ref. {item.referencia}</Text>
          </View>

          <Text style={theme.subtitleRequest}>
            Tipo: <Text style={theme.subtitleTextRequest}>{item.tipo}</Text>
          </Text>
          <Text style={theme.dateRequest}>Fecha: {item.fecha}</Text>

          <Text style={theme.descriptionRequest}>Descripción:</Text>
          <Text style={theme.descriptionTextRequest}>{item.descripcion}</Text>

          <Text style={[theme.statusRequest, { color: getStatusColor(item.status) }]}>
            Estado: <Text style={theme.subtitleTextRequest}>{item.status}</Text>
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

// Función para obtener el color del estado de la solicitud
const getStatusColor = (status) => {
  if (status === "Aprobado") return "green";
  if (status === "Rechazado") return "red";
  return "#f7941e"; // Default color for pending or others
};


export default RequestDetail;
