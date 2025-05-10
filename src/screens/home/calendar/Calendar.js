import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useTheme } from "@rneui/themed";
import { Calendar as RNCalendar } from "react-native-calendars";
import dayjs from "dayjs";
import axios from "axios";
import { Icon } from "@rneui/themed";

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
  const { theme } = useTheme();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simula datos del mes
  useEffect(() => {
    const simulateMonthData = () => {
      const data = {
        "2025-05-01": { types: ["libre"] },
        "2025-05-02": { types: ["jornada", "extra"] },
        "2025-05-03": { types: ["ausencia"] },
        "2025-05-04": { types: ["jornada"] },
      };

      const markings = {};
      Object.entries(data).forEach(([date, { types }]) => {
        markings[date] = {
          marked: true,
          dots: types.map((t) => ({
            key: t,
            color: {
              jornada: "#4caf50",
              extra: "#ffeb3b",
              ausencia: "#f44336",
              libre: "#2196f3",
            }[t],
          })),
        };
      });

      // Marcar el día actual
      markings[selectedDate] = {
        ...markings[selectedDate],
        selected: true,
        selectedColor: "#1E6091",
      };

      // fetch
      fetchDayDetails(selectedDate);

      setMarkedDates(markings);
    };

    simulateMonthData();
  }, []);

  const fetchDayDetails = async (date) => {
    setLoading(true);
    setDayDetails(null);

    try {
      // Simula la respuesta
      const res = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              jornada: {
                inicio: "08:00",
                fin: "16:00",
                horas_trabajadas: 8,
              },
              horas_extra: {
                inicio: "16:00",
                fin: "17:00",
                horas: 1,
              },
              es_dia_libre: date === "2025-05-01",
              es_dia_ausente: date === "2025-05-03",
            }),
          800
        )
      );

      setDayDetails(res);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDaySelect = (day) => {
    setSelectedDate(day.dateString);
    fetchDayDetails(day.dateString);
    // Quitar el dia seleccionado previamente
    setMarkedDates((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        selected: false,
        selectedColor: "#fff",
      },
    }));
    // Marcar el nuevo día seleccionado
    setMarkedDates((prev) => ({
      ...prev,
      [day.dateString]: {
        ...(prev[day.dateString] || {}),
        selected: true,
        selectedColor: "#1E6091",
      },
    }));
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={[theme.container, { marginTop: 0, paddingTop: 10 }]}>
        <RNCalendar
          onDayPress={onDaySelect}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            selectedDayBackgroundColor: "#1E6091",
            todayTextColor: "#f7941e",
            arrowColor: "#1E6091",
            textSectionTitleColor: "#1E6091",
          }}
        />

        {/* Leyenda de tipos */}
        <View style={styles.legend}>
          <Text style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#4caf50" }]} />{" "}
            Laboral
          </Text>
          <Text style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#2196f3" }]} /> Libre
          </Text>
          <Text style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#ffeb3b" }]} /> Horas
            extra
          </Text>
          <Text style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#f44336" }]} />{" "}
            Ausencia
          </Text>
        </View>

        {/* Detalle del día seleccionado */}
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Detalle del {selectedDate}</Text>

          {loading ? (
            <ActivityIndicator color="#1E6091" style={{ marginTop: 10 }} />
          ) : dayDetails ? (
            <>
              {dayDetails.jornada ? (
                <Text style={styles.detailText}>
                  🕒 Jornada: {dayDetails.jornada.inicio} -{" "}
                  {dayDetails.jornada.fin} (
                  {dayDetails.jornada.horas_trabajadas} horas)
                </Text>
              ) : (
                <Text style={styles.detailText}>
                  No hay registro de jornada
                </Text>
              )}
              {dayDetails.horas_extra ? (
                <Text style={styles.detailText}>
                  ⏱️ Horas Extra: {dayDetails.horas_extra.inicio} -{" "}
                  {dayDetails.horas_extra.fin} ({dayDetails.horas_extra.horas}{" "}
                  horas)
                </Text>
              ) : (
                <Text style={styles.detailText}>
                  No hay registro de horas extra
                </Text>
              )}
              {dayDetails.es_dia_libre && (
                <Text style={styles.detailText}>✅ Día Libre</Text>
              )}
            </>
          ) : (
            <Text style={styles.detailText}>
              No hay información para este día
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    justifyContent: "space-around",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginRight: 10,
    fontSize: 14,
    color: "#333",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  detailBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E6091",
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
});

export default Calendar;
