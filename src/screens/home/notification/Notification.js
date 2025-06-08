import { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import NotificationSkeletonItem from "../../../components/NotificationSkeletonItem";

import useApi from "../../../hooks/useApi"; // Hook para manejar la URL de la API
import { Icon } from "@rneui/base";

const Notification = () => {
  const { apiUrl } = useApi(); // Hook para manejar la URL de la API

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
        `${apiUrl}/custom/fichajes/api/index.php?action=user_notifications&page=${page}`
      );
      const data = response.data; // Simular la respuesta de la API
      console.log("Response data:", data);

      if (!data || !data.data || data.success === false || !data.data.length) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

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

  const handleMarkAsRead = (id, read) => {
    if (read === "SI") return; // Si ya está leída, no hacer nada
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: "SI" } : n))
    );
    updateNotification(id); // Actualizar notificación en el backend
    // Aquí podrías hacer una llamada al backend para marcar como leída
  };

  const updateNotification = async (id) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/custom/fichajes/api/index.php`,
        {
          action: "user_notification",
          notificationId: id,
          read: "SI",
        }
      );
      console.log("Notification updated:", response.data);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item.id, item.read)}
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
      <View style={{ flex: 1, paddingTop: 3 }}>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={fetchNotifications}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoading ? <NotificationSkeletonItem /> : null}
          ListEmptyComponent={
            !isLoading && notifications.length === 0 ? (
              <>
                <Icon
                  name="bell-slash"
                  type="font-awesome"
                  size={25}
                  color="#1E6091"
                  style={{ alignSelf: "center", marginTop: 10 }}
                />
                <Text
                  style={{ textAlign: "center", marginTop: 10, fontSize: 14 }}
                >
                  No hay notificaciones disponibles.
                </Text>
              </>
            ) : null
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
    borderBottomColor: "#1E6091",
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
