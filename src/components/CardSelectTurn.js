import {
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { Button } from "@rneui/base";
import { Card, Divider, Text, useTheme, Icon } from "@rneui/themed";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import useApi from "../hooks/useApi";
import axios from "axios";

import { Dimensions } from "react-native";

const MAX_LIST_HEIGHT = Dimensions.get("window").height * 0.55;
//Armado de datos iniciales y ademas renderizado de turnos
const dayName = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const CardSelectTurn = ({ turnData, dateUserTurn, navigation }) => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const { apiUrl } = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTurnId, setSelectedTurnId] = useState(null);

  // Normalizar turnData a array
  const getTurnsArray = () => {
    if (!turnData) return [];

    if (typeof turnData === "object" && !Array.isArray(turnData)) {
      return Object.entries(turnData).map(([key, value]) => ({
        id: key,
        ...value,
      }));
    }

    return Array.isArray(turnData)
      ? turnData.map((item, index) => ({ id: String(index), ...item }))
      : [];
  };

  const turns = getTurnsArray();

  const calcularHoras = (turnosObj) => {
    let totalHours = 0;

    Object.keys(turnosObj).forEach((key) => {
      const turno = turnosObj[key];
      if (turno.in && turno.out) {
        const inTime = turno.in.split(":").map(Number);
        const outTime = turno.out.split(":").map(Number);

        const inDate = new Date(0, 0, 0, inTime[0], inTime[1]);
        const outDate = new Date(0, 0, 0, outTime[0], outTime[1]);

        const diff = (outDate - inDate) / (1000 * 60 * 60);
        totalHours += diff;
      }
    });

    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  };

  const renderTurnCard = ({ item }) => {
    const dayWeek = new Date().getDay();
    const isSelected = selectedTurnId === item.id;

    const titulo = item.titulo || `Turno ID: ${item.id}`;
    const turnosDelDia = item.horario?.[dayName[dayWeek]] || {};
    const turnosAMostrar =
      Object.keys(turnosDelDia).length > 0 ? turnosDelDia : item;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setSelectedTurnId(item.id);
        }}
        style={{ marginVertical: 6 }}
      >
        <View
          style={{
            backgroundColor: isSelected
              ? theme.colors.primary + "15"
              : theme.colors.grey5,
            borderRadius: 8,
            padding: 12,
            borderWidth: isSelected ? 1.5 : 0,
            borderColor: theme.colors.primary,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 14.5, fontWeight: "700" }}>{titulo}</Text>

            {isSelected && (
              <Icon
                name="check-circle"
                type="material"
                color={theme.colors.primary}
                size={18}
              />
            )}
          </View>

          {/* Turnos */}

          {Object.keys(turnosAMostrar).map((key) => {
            const turno = turnosAMostrar[key];
            if (turno.in && turno.out) {
              return (
                <Text
                  key={key}
                  style={{
                    fontSize: 14,
                    color: theme.colors.grey1,
                    marginBottom: 4,
                  }}
                >
                  • Turno {key}: {turno.in} – {turno.out}
                </Text>
              );
            }
            return null;
          })}

          <Divider style={{ marginVertical: 8 }} />

          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.primary,
            }}
          >
            Total: {calcularHoras(turnosAMostrar)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Procesar la selección del turno
  const handleSelectTurn = async (turnId) => {
    if (!turnId) {
      Alert.alert("Por favor, selecciona un horario antes de continuar.");
      return;
    }
    setIsLoading(true);
    const params = {
      action: "user_turn",
      date: dateUserTurn,
      idHorarioM: turnId,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/custom/fichajes/api/index.php`,
        params,
      );
      console.log(
        "Respuesta del servidor al seleccionar turno:",
        response.data,
      );
      if (response.data.success) {
        setIsLoading(false);
        navigation.navigate("Signing", {
          message: "Horario seleccionado correctamente.",
          type: "success",
        });
      } else {
        Alert.alert(
          "Error",
          "No se pudo seleccionar el horario. Por favor, inténtalo de nuevo.",
        );

        setIsLoading(false);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 500) {
          Alert.alert(
            "Error",
            "No se pudo seleccionar el horario. Por favor, inténtalo de nuevo.",
          );
          logout();
        }
      }

      setIsLoading(false);
    }
  };

  return (
    <Card containerStyle={theme.showSigning}>
      <View style={{ width: "100%" }}>
        <View style={{ marginBottom: 12 }}>
          <Text style={theme.titleSigning}>
            Tienes múltiples horarios asignados. Por favor, selecciona tu
            horario para continuar.
          </Text>
        </View>

        <FlatList
          data={turns}
          keyExtractor={(item) => item.id}
          renderItem={renderTurnCard}
          style={{ maxHeight: MAX_LIST_HEIGHT }}
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={true}
        />

        <Button
          title="Confirmar horario seleccionado"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => handleSelectTurn(selectedTurnId)}
          disabled={isLoading || !selectedTurnId}
          loading={isLoading}
        />
      </View>
    </Card>
  );
};

export default CardSelectTurn;
