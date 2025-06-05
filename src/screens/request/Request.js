import { Text } from "@rneui/base";
import React from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { FlatList, ActivityIndicator } from "react-native";
import { Header, Skeleton } from "@rneui/themed";
import { TouchableOpacity } from "react-native";

import { Card, Button, Icon } from "@rneui/themed";
import { useEffect, useState } from "react";
import { useTheme } from "@rneui/themed";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import SkeletonRequest from "../../components/SkeletonRequest";

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
      const response = await axios.get(
        `${API_URL}/index.php?action=user_requests&page=${page}`
      );
      const data = response.data; // Simular la respuesta de la API

      //Map de la respuesta de la API:  data.data.requests.map
      const solicitudesMapped = data.data.requests.map((item) => ({
        referencia: item.referencia,
        tipo: item.tipo,
        fecha: item.fecha_creacion.split(" ")[0],
        descripcion: item.descripcion || "No hay descripción",
        status: item.status,
        icono:
          item.status === "Aprobada"
            ? "check-circle"
            : item.status === "Rechazada"
              ? "times-circle"
              : "exclamation-circle",
      }));

      setSolicitudes((prev) => [...prev, ...solicitudesMapped]);
      setHasMore(data.total_pages > page); // Cambia esto para simular más datos
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error al cargar solicitudes", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSolicitudes([]); // Reiniciar solicitudes al cargar la pantalla
      setPage(1); // Reiniciar página al cargar la pantalla
      setHasMore(true); // Reiniciar hasMore al cargar la pantalla

      fetchSolicitudes(); // Llamar a la función para cargar solicitudes
      console.log("Solicitudes cargadas");
      
    }, [])
  );

  const renderFooter = () => {
    return (
      <View>
        {/* Simula 2 tarjetas en loading */}
        {[1, 2, 3, 4].map((_, index) => (
          <SkeletonRequest
            key={index}
            height={100}
            width="100%"
            style={{ borderRadius: 6, marginBottom: 15 }}
          />
        ))}
      </View>
    );
  };

  const renderSolicitud = ({ item }) => (
    <Card containerStyle={theme.card}>
      <TouchableOpacity onPress={() => verDetalle(item)}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name={item.icono}
            type="font-awesome"
            size={24}
            color="#1E6091"
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text
              style={{ fontWeight: "bold", marginBottom: 2, color: "#000" }}
            >
              Ref. {item.referencia}
            </Text>
            <Text style={{ marginBottom: 2 }}>Tipo: {item.tipo}</Text>
            <Text numberOfLines={2} style={{ color: "#555", marginBottom: 2 }}>
              Descripción: {item.descripcion}
            </Text>
            <Text style={{ marginBottom: 2 }}>Fecha: {item.fecha}</Text>
            <Text
              style={{
                color:
                  item.status === "Aprobada"
                    ? "green"
                    : item.status === "Rechazada"
                      ? "red"
                      : "#f7941e",
              }}
            >
              Estado: {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
          ListFooterComponent={isLoading ? renderFooter : null}
        />
      </View>
    </>
  );
};

export default Request;
