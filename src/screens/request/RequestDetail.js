import { View, Text, ScrollView } from "react-native";
import { Icon } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { Card } from "@rneui/themed";
import CardCalendar from "../../components/CardCalendar";
import ButtonDocs from "../../components/ButtonDocs";

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

          {/* Fechas principales */}
          <Text style={theme.dateRequest}>Desde: {item.desde}</Text>
          <Text style={theme.dateRequest}>Hasta: {item.hasta}</Text>

          {/* Descripción */}
          {item.descripcion && (
            <>
              <Text style={theme.descriptionRequest}>Descripción:</Text>
              <Text style={theme.descriptionTextRequest}>
                {item.descripcion}
              </Text>
            </>
          )}

          {/* Revisado por */}
          {item.revisado_por && (
            <Text style={theme.subtitleRequest}>
              Revisado por:{" "}
              <Text style={theme.subtitleTextRequest}>
                {item.revisado_por.trim()}
              </Text>
            </Text>
          )}

          {/* Validado */}
          {item.validado_por && (
            <Text style={theme.subtitleRequest}>
              Validado por:{" "}
              <Text style={theme.subtitleTextRequest}>
                {item.validado_por.trim()}
              </Text>
            </Text>
          )}

          {/* Aprobado */}
          {item.aprobado_por && (
            <Text style={theme.subtitleRequest}>
              Aprobado por:{" "}
              <Text style={theme.subtitleTextRequest}>
                {item.aprobado_por.trim()}
              </Text>
            </Text>
          )}

          {/* Rechazo */}
          {item.rechazado_por && (
            <Text style={theme.subtitleRequest}>
              Rechazado por:{" "}
              <Text style={theme.subtitleTextRequest}>
                {item.rechazado_por}
              </Text>
            </Text>
          )}
          {item.motivo_rechazo && (
            <Text style={theme.descriptionTextRequest}>
              Motivo rechazo: {item.motivo_rechazo}
            </Text>
          )}

          {/* Cancelado */}
          {item.cancelado_por && (
            <Text style={theme.subtitleRequest}>
              Cancelado por:{" "}
              <Text style={theme.subtitleTextRequest}>
                {item.cancelado_por.trim()}
              </Text>
            </Text>
          )}

          {/* Días utilizados */}
          {item.dias_utilizados ? (
            <Text style={theme.subtitleRequest}>
              Días utilizados:{" "}
              <Text style={theme.subtitleTextRequest}>
                {item.dias_utilizados}
              </Text>
            </Text>
          ) : null}

          {/* Estado */}
          <Text
            style={[
              theme.statusRequest,
              { color: getStatusColor(item.status) },
            ]}
          >
            Estado: <Text style={theme.subtitleTextRequest}>{item.status}</Text>
          </Text>
        </Card>

        {/* Documentos adjuntos */}
        <CardCalendar>
          <ButtonDocs
            title={`Documentos Adjuntos`}
            theme={theme}
            navigation={navigation}
            screen="Document"
            params={{ item }}
          />
        </CardCalendar>
      </View>
    </ScrollView>
  );
};

// Función para obtener el color del estado de la solicitud
const getStatusColor = (status) => {
  if (status === "Aprobada") return "green";
  if (status === "Rechazada" || status === "Anulada") return "red";
  return "#f7941e"; // Default color for pending or others
};

export default RequestDetail;
