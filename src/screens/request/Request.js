import { Text } from "@rneui/base";
import React from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { FlatList, ActivityIndicator } from "react-native";
import { Header } from "@rneui/themed";

import { Card, Button, Icon } from "@rneui/themed";
import { useEffect, useState } from "react";
import { useTheme } from "@rneui/themed";

const Request = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  const [solicitudes, setSolicitudes] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchSolicitudes = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      //Simular el json de la API
      const data = {
        solicitudes: [
          {
            referencia: "Solicitud 1",
            tipo: "Tipo 1",
            fecha: "2023-10-01",
            descripcion: "Descripción de la solicitud 1",
            status: "Aprobado",
            icono: "check-circle",
          },
          {
            referencia: "Solicitud 2",
            tipo: "Tipo 2",
            fecha: "2023-10-02",
            descripcion: "Descripción de la solicitud 2",
            status: "Rechazado",
            icono: "times-circle",
          },
        ],
        hasMore: false, // Cambia esto para simular más datos
      };
      // const response = await axios.get(`${API_URL}/index.php`, {

      setSolicitudes((prev) => [...prev, ...data.solicitudes]);
      setHasMore(data.hasMore); // o data.total > page * limit
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error al cargar solicitudes", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const renderSolicitud = ({ item }) => (
    <Card containerStyle={theme.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon name={item.icono} type="font-awesome" size={24} color="#1E6091" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontWeight: "bold" }}>{item.referencia}</Text>
          <Text>{item.tipo}</Text>
          <Text>{item.fecha}</Text>
          <Text numberOfLines={2} style={{ color: "#555" }}>
            {item.descripcion}
          </Text>
          <Text
            style={{
              color:
                item.status === "Aprobado"
                  ? "green"
                  : item.status === "Rechazado"
                    ? "red"
                    : "#f7941e",
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Button
        title="Ver Detalle"
        containerStyle={theme.buttonPrimaryContainer}
        buttonStyle={theme.buttonPrimaryStyle}
        onPress={() => verDetalle(item)}
      />
    </Card>
  );

  const verDetalle = (item) => {
    // Aquí navegas a la pantalla de detalle
    navigation.navigate("RequestDetail", { item });
    console.log("Detalle de", item.referencia);
  };

  return (
    <>
      <Header
        backgroundColor={theme.colors.accent}
        barStyle="default"
        centerComponent={{
          text: `Solicitudes`,
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
          data={solicitudes}
          renderItem={renderSolicitud}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={fetchSolicitudes}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#1E6091" />
            ) : null
          }
        />
      </View>
    </>
  );
  
};

export default Request;
