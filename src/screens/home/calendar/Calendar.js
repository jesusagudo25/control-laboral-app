import {
  View,
  StyleSheet,
  Linking,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  AppState,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { Icon } from "@rneui/themed";
import { Card, Header } from "@rneui/themed";
import { useTheme } from "@rneui/themed";

import React, { useEffect, useState } from "react";

import { Text } from "@rneui/themed";

import { LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  today: "Hoy",
};

LocaleConfig.defaultLocale = "es";

const Calendar = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  const [selectedDate, setSelectedDate] = useState("");
  const [jornada, setJornada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  const fetchJornada = async (date) => {
    setLoading(true);
    setJornada(null);

    try {
      // Simulación de petición (sustituye por tu fetch real)
      const res = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              entrada: "08:00",
              salida: "16:00",
              status: "Registrada",
            }),
          800
        )
      );

      setJornada(res);
    } catch (error) {
      console.error("Error cargando jornada:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDaySelect = (day) => {
    setSelectedDate(day.dateString);
    fetchJornada(day.dateString);
    setMarkedDates({
      [day.dateString]: {
        selected: true,
        selectedColor: "#1E6091",
        marked: true,
        dotColor: "#f7941e",
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f4f4f4", padding: 10 }}>
      <RNCalendar
        onDayPress={onDaySelect}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#1E6091",
          todayTextColor: "#f7941e",
          arrowColor: "#1E6091",
          textSectionTitleColor: "#1E6091",
        }}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1E6091"
          style={{ marginTop: 20 }}
        />
      )}

      {jornada && (
        <View style={[theme.card, { padding: 20, marginTop: 20 }]}>
          <Text style={styles.title}>Jornada del {selectedDate}</Text>
          <Text style={styles.label}>
            <Icon name="login" type="material-community" size={18} /> Entrada:{" "}
            {jornada.entrada}
          </Text>
          <Text style={styles.label}>
            <Icon name="logout" type="material-community" size={18} /> Salida:{" "}
            {jornada.salida}
          </Text>
          <Text style={styles.status}>Estado: {jornada.status}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E6091",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  status: {
    fontSize: 16,
    marginTop: 10,
    color: "#f7941e",
    fontWeight: "500",
  },
});

export default Calendar;
