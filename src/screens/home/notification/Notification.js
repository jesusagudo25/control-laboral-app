import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";

const PAGE_SIZE = 10;

// Simula una API de notificaciones
const fetchNotifications = async (page) => {
  await new Promise((r) => setTimeout(r, 1000)); // Simular delay
  const total = 50;
  const data = Array.from({ length: PAGE_SIZE }, (_, i) => {
    const id = page * PAGE_SIZE + i + 1;
    if (id > total) return null;
    return {
      id,
      title: `Notificación #${id}`,
      message: `Este es el mensaje de la notificación número ${id}.`,
      read: false,
    };
  }).filter(Boolean);
  return data;
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(
    async (reset = false) => {
      if (loadingMore) return;

      if (reset) {
        setRefreshing(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const newPage = reset ? 0 : page + 1;
      const newNotifications = await fetchNotifications(newPage);

      setNotifications((prev) =>
        reset ? newNotifications : [...prev, ...newNotifications]
      );
      setPage(newPage);
      setHasMore(newNotifications.length === PAGE_SIZE);

      setRefreshing(false);
      setLoadingMore(false);
    },
    [page, loadingMore]
  );

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // Aquí podrías hacer una llamada al backend para marcar como leída
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item.id)}
      style={[styles.item, item.read ? styles.read : styles.unread]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </TouchableOpacity>
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications();
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
          />
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color="#1E6091" /> : null
        }
        ListEmptyComponent={
          !refreshing && (
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: "center" }}>No hay notificaciones</Text>
            </View>
          )
        }
      />
    </View>
  );
}

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
