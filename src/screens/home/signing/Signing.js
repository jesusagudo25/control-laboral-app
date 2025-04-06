import React, { useEffect, useState } from "react";
import { View, ScrollView, AppState } from "react-native";
import { Card, Divider, Text, useTheme } from "@rneui/themed";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el locale español
import SkeletonSigning from "../../../components/SkeletonSigning";
import ButtonSigning from "../../../components/ButtonSigning";
import useAuth from "../../../hooks/useAuth"; // Importar el hook useAuth

dayjs.locale("es"); // Establece español como idioma predeterminado

const dayName = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const Signing = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME; // Nombre de la app
  const { theme } = useTheme(); // Obtener el tema actual
  const { userName } = useAuth(); //

  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [appStatus, setAppStatus] = useState(AppState.currentState);
  const [connectionType, setConnectionType] = useState("none");
  const [currentDate, setCurrentDate] = useState(
    dayjs().format("DD [de] MMMM [de] YYYY")
  );
  const [turnData, setTurnData] = useState([]);
  const [countTurnData, setCountTurnData] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [actions, setActions] = useState([]);
  const [comment, setComment] = useState("");
  const [motives, setMotives] = useState([]);
  const [selectedMotive, setSelectedMotive] = useState("");

  const getUserTurn = async () => {
    const dayWeek = new Date().getDay(); // 0-6 -> 1-7
    const day = dayName[dayWeek]; // 0-6 -> sunday-saturday
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      const response = await axios.get(
        `${API_URL}/index.php?day=${dayWeek}&action=user_turn&date=${currentDate}`
      );
      const turn = response.data.data.horario[day];
      //Darle formato a las horas
      Object.keys(turn).forEach((key) => {
        const item = turn[key];
        const inTime = item.in.split(":").map(Number);
        const outTime = item.out.split(":").map(Number);
        const inDate = new Date(0, 0, 0, inTime[0], inTime[1]);
        const outDate = new Date(0, 0, 0, outTime[0], outTime[1]);
        const diff = (outDate - inDate) / (1000 * 60 * 60); // Diferencia en horas
        const hours = Math.floor(diff);
        const minutes = Math.round((diff - hours) * 60);
        const formattedInTime = `${String(inTime[0]).padStart(2, "0")}:${String(
          inTime[1]
        ).padStart(2, "0")}`;
        const formattedOutTime = `${String(outTime[0]).padStart(2, "0")}:${String(
          outTime[1]
        ).padStart(2, "0")}`;
        const formattedTotalHours = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;
        turn[key].in = formattedInTime;
        turn[key].out = formattedOutTime;
        turn[key].total = formattedTotalHours;
      });

      setTurnData(turn);

      console.log(response.data.data.horario[day]);
      const count = Object.keys(turn).length;
      setCountTurnData(count);
      console.log(count);

      //Obtener el total de horas, en base a los turnos
      let totalHours = 0;
      Object.keys(turn).forEach((key) => {
        const item = turn[key];
        const inTime = item.in.split(":").map(Number);
        const outTime = item.out.split(":").map(Number);
        const inDate = new Date(0, 0, 0, inTime[0], inTime[1]);
        const outDate = new Date(0, 0, 0, outTime[0], outTime[1]);
        const diff = (outDate - inDate) / (1000 * 60 * 60); // Diferencia en horas
        totalHours += diff;
      });
      console.log("Total horas:", totalHours);
      // Formatear el total de horas a formato HH:MM
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      const formattedTotalHours = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
      console.log("Total horas formateadas:", formattedTotalHours);

      setTotalHours(formattedTotalHours);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserButtons = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/index.php?action=user_buttons`
      );
      let actionsBucket = [];
      console.log(response.data.data);
      if (response.data?.data?.Firma) {
        actionsBucket.push(response.data.data.Firma.action);
      }

      if (response.data?.data?.Entrada) {
        actionsBucket.push(response.data.data.Entrada.action);
      }

      if (response.data?.data?.Salida) {
        actionsBucket.push(response.data.data.Salida.action);
      }

      if (response.data?.data?.Pausa) {
        actionsBucket.push(response.data.data.Pausa.action);
      }

      if (response.data?.data?.Reanudacion) {
        actionsBucket.push(response.data.data.Reanudacion.action);
      }

      setActions(actionsBucket);
    } catch (error) {
      console.log(error);
    }
  };

  /* Control Laboral App */

  useEffect(() => {
    getUserTurn();
    getUserButtons();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.boxHidden}>
        <View style={theme.containerBoxHidden}>
          {/* Titulo ${date} */}
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
              {/* 30 de Julio de 2021 */}
              {currentDate}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "400",
                color: theme.colors.header,
              }}
            >
              Valida tu jornada laboral
            </Text>
          </View>

          {countTurnData > 0 && userName ? (
            <Card containerStyle={theme.showSigning}>
              <View
                style={{
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <View>
                  <Text style={theme.textSigning}>{`${userName}`}</Text>
                  <Text style={theme.titleSigning}>Empresa</Text>
                  <Text style={theme.textSigning}>{`${APP_NAME}`}</Text>
                </View>

                <View>
                  <Text style={theme.titleSigning}>
                    Jornada laboral ({countTurnData})
                  </Text>

                  <Divider />

                  {Object.keys(turnData).map((key) => {
                    const item = turnData[key];
                    return (
                      <View key={key}>
                        <Text style={theme.hoursSigning}>
                          {item.in} a {item.out}
                        </Text>
                        <Divider />
                      </View>
                    );
                  })}

                  <Text style={theme.titleSigning}>
                    Total jornada: {totalHours}
                  </Text>
                </View>

                <ButtonSigning actions={actions} />
              </View>
            </Card>
          ) : (
            <SkeletonSigning />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Signing;
