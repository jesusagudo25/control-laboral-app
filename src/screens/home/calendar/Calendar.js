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
import useAuth from "../../../hooks/useAuth"; // Importar el hook useAuth

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
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const { theme } = useTheme();
  const { login, isConnected } = useAuth();

  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));

  useEffect(() => {
    fetchMonthData(currentMonth);
    fetchDayDetails(selectedDate);
  }, [selectedDate, currentMonth]);

  const fetchMonthData = async (month) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/index.php?action=fetch_month_data&mes=${month}`
      );
      const data = res.data.data;

      const markings = {};
      Object.entries(data).forEach(([date, info]) => {
        let dots = [];

        if (info.types.includes("jornada"))
          dots.push({ key: "jornada", color: "#4caf50" });
        if (info.types.includes("libre"))
          dots.push({ key: "libre", color: "#2196f3" });
        if (info.types.includes("extra"))
          dots.push({ key: "extra", color: "#ffeb3b" });
        if (info.types.includes("ausencia"))
          dots.push({ key: "ausencia", color: "#f44336" });

        markings[date] = {
          dots,
          marked: true,
          selected: date === selectedDate,
          selectedColor: date === selectedDate ? "#1E6091" : "#fff",
        };
      });

      //Fetch
      fetchDayDetails(selectedDate);

      setMarkedDates(markings);
    } catch (error) {
      console.error("Error al cargar calendario del mes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayDetails = async (date) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/index.php?action=fetch_day_details&fecha=${date}`
      );

      const jornada = res.data.data.jornada;
      if (jornada) {
        const jornadaKeys = Object.keys(jornada).filter((key) => {
          return jornada[key].in && jornada[key].out;
        });

        const jornadaDetails = jornadaKeys.map((key) => {
          return `${jornada[key].in} - ${jornada[key].out}`;
        });
        res.data.data.jornadaFormatted = jornadaDetails.join(", ");
      }

      setDayDetails(res.data.data);
    } catch (error) {
      console.error("Error al cargar detalles del día:", error);
      setDayDetails(null);
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
          onMonthChange={(month) => {
            const newMonth = dayjs(month.dateString).format("YYYY-MM");
            setCurrentMonth(newMonth);
          }}
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
                  🕒 Jornada: {dayDetails.jornadaFormatted} (
                  {dayDetails.jornada.horas_trabajadas} horas)
                </Text>
              ) : (
                <Text style={styles.detailText}>
                  No hay registro de jornada
                </Text>
              )}
              {dayDetails.horas_extra !== 0 ? (
                <Text style={styles.detailText}>
                  ⏱️ Horas extra: {dayDetails.horas_extra} horas
                </Text>
              ) : (
                <Text style={styles.detailText}>
                  No hay registro de horas extra
                </Text>
              )}
              {dayDetails.es_dia_libre && (
                <Text style={styles.detailText}>✅ Día Libre</Text>
              )}

              {dayDetails.es_dia_ausencia && (
                <Text style={styles.detailText}>❌ Día de Ausencia</Text>
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
