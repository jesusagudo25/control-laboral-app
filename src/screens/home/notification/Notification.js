import { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";

const Notification = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API

  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async () => {
    console.log("Fetching notifications, page:", page);

    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/index.php?action=user_notifications&page=${page}`
      );
      const data = response.data; // Simular la respuesta de la API

      console.log("Response data:", data);

      //Map de la respuesta de la API:  data.data.requests.map
      const notificationsMapped = data.data.map((item) => ({
        title: item.title,
        created: item.created,
        message: item.body || "No hay mensaje",
        read: item.read,
        id: item.id,
      }));

      setNotifications((prev) => [...prev, ...notificationsMapped]);
      setHasMore(data.total_pages > page); // Cambia esto para simular más datos
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error al cargar notificaciones", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setNotifications([]); // Limpiar notificaciones al cargar la pantalla
      setPage(1); // Reiniciar página al cargar la pantalla
      setHasMore(true); // Reiniciar hasMore al cargar la pantalla

      fetchNotifications(); // Cargar notificaciones al cargar la pantalla
    }, [])
  );

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: "SI" } : n))
    );
    // Aquí podrías hacer una llamada al backend para marcar como leída
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item.id)}
      style={[styles.item, item.read === "SI" ? styles.read : styles.unread]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={{ color: "#888", fontSize: 12 }}>
        {dayjs(item.created).format("DD/MM/YYYY HH:mm")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={fetchNotifications}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading ? <ActivityIndicator color="#1E6091" /> : null
          }
        />
      </View>
    </>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  unread: {
    backgroundColor: "#E3F2FD",
  },
  read: {
    backgroundColor: "#fff",
    opacity: 0.7,
  },
  title: {
    fontWeight: "bold",
    color: "#1E6091",
    marginBottom: 5,
  },
  message: {
    color: "#444",
  },
});
