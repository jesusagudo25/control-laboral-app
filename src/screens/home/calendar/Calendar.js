import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { Divider, useTheme } from "@rneui/themed";
import { Calendar as RNCalendar } from "react-native-calendars";
import dayjs from "dayjs";
import axios from "axios";

import { LocaleConfig } from "react-native-calendars";
import CardCalendar from "../../../components/CardCalendar";
import LegendType from "../../../components/LegendType";
import SkeletonDocument from "../../../components/SkeletonDocument";
import Accordion from "../../../components/Accordion";

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
            Calendario
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: theme.colors.header,
            }}
          >
            Selecciona un día para ver los detalles
          </Text>
        </View>
        <CardCalendar>
          <RNCalendar
            onDayPress={onDaySelect}
            onMonthChange={(month) => {
              const newMonth = dayjs(month.dateString).format("YYYY-MM");
              setCurrentMonth(newMonth);
            }}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={{
              selectedDayBackgroundColor: theme.colors.text,
              todayTextColor: theme.colors.accent,
              arrowColor: theme.colors.text,
              textSectionTitleColor: theme.colors.text,
              textMonthFontWeight: "bold",
            }}
          />

          <Divider
            style={{
              backgroundColor: theme.colors.primary,
              marginVertical: 10,
            }}
          />

          <LegendType />
        </CardCalendar>

        <CardCalendar>
          <Accordion title={`Detalle del ${selectedDate}`} theme={theme}>
            {dayDetails ? (
              <>
                {dayDetails.jornada &&
                  Object.keys(dayDetails.jornada).length > 0 && (
                    <View style={{ marginBottom: 6 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        • Jornada laboral
                      </Text>
                      <Text style={{ marginLeft: 10 }}>
                        {dayDetails.jornadaFormatted} (
                        {dayDetails.jornada.horas_trabajadas} horas)
                      </Text>
                    </View>
                  )}

                {dayDetails.horas_extra !== 0 && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: "bold" }}>• Horas extra</Text>
                    <Text style={{ marginLeft: 10 }}>
                      {dayDetails.horas_extra} horas
                    </Text>
                  </View>
                )}

                {dayDetails.es_dia_libre === true && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: "bold" }}>• Día libre</Text>
                  </View>
                )}

                {dayDetails.es_dia_ausencia === true && (
                  <View>
                    <Text style={{ fontWeight: "bold" }}>• Ausencia</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontWeight: "bold" }}>
                  No hay datos disponibles
                </Text>
              </View>
            )}
          </Accordion>
        </CardCalendar>
      </View>
    </ScrollView>
  );
};

export default Calendar;
