import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, ScrollView, Alert } from "react-native";
import { Text, useTheme } from "@rneui/themed";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el locale español
import SkeletonSigning from "../../../components/SkeletonSigning";
import useAuth from "../../../hooks/useAuth";
import CardSigning from "../../../components/CardSigning";
import CardSelectTurn from "../../../components/CardSelectTurn";
import useApi from "../../../hooks/useApi"; // Hook para manejar la URL de la API

dayjs.locale("es"); // Establece español como idioma predeterminado

const dayName = [
  "sunday", // Spanish: domingo
  "monday", // Spanish: lunes
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday", // Spanish: sábado
];

const Signing = ({ route, navigation }) => {
  const { apiUrl } = useApi(); // Hook para manejar la URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const { userName, logout } = useAuth(); // Obtener el nombre de usuario y la función de cierre de sesión

  const { message, type } = route.params || {}; // Desestructuración de los parámetros
  const [motives, setMotives] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    dayjs().format("DD [de] MMMM [de] YYYY"),
  );
  const [turnData, setTurnData] = useState([]);
  const [dateUserTurn, setDateUserTurn] = useState(null);
  const [countTurnData, setCountTurnData] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [actions, setActions] = useState([]);

  const [isUserMultipleTurn, setIsUserMultipleTurn] = useState(false);
  const [multipleTurnsData, setMultipleTurnsData] = useState([]);

  //Debemos crear una funcion previa a getUserTurn para obtener si el usuario tiene un turno multiple, para que haga la seleccion.
  //Esta funcion previa va a llamar el mismo endpoint pero solamente validara si existe el campo: "multiples": true
  //Si no existe o es false, se procede a llamar getUserTurn normalmente. Si existe, se debe mostrar un modal para que el usuario seleccione el turno.
  //Se utiliza el mismo endpoint por una mala practica del backend, que no separa las funcionalidades en diferentes endpoints.
  //la funcion se llamara: getUserTurnPreliminary

  const getUserTurnPreliminary = async () => {
    const dayWeek = new Date().getDay();
    try {
      const response = await axios.get(
        `${apiUrl}/custom/fichajes/api/index.php?day=${dayWeek}&action=user_turn`,
      );
      const isMultiple = response.data.data.multiples || false;
      setDateUserTurn(response.data.data.date || null);

      if (isMultiple) {
        setIsUserMultipleTurn(true);
        setMultipleTurnsData(response.data.data.horarios || []);
      } else {
        getUserTurn();
        getUserButtons();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserTurn = async () => {
    const dayWeek = new Date().getDay();
    const day = dayName[dayWeek]; // 0-6 -> sunday-saturday
    let currentDate = dayjs().format("YYYY-MM-DD"); // YYYY-MM-DD

    try {
      const response = await axios.get(
        `${apiUrl}/custom/fichajes/api/index.php?day=${dayWeek}&action=user_turn&date=${currentDate}`,
      );

      console.log("User Turn Response:", response.data);

      const turn = response.data.data.horario[day];
      const marks = response.data.data.marks[day];
      const time = response.data.data.time;

      let countMarks = response.data.data.marks.length;

      //Validar si es undifened o null
      if (countMarks === undefined || countMarks === null) {
        countMarks = Object.keys(marks).length;
      }

      if (countMarks == 0) {
        //Darle formato a las horas
        Object.keys(turn).forEach((key) => {
          let item = turn[key];

          item.in = item.in || "00:00"; // Si in es undefined o null, asignar "00:00"
          item.out = item.out || "00:00"; // Si out es undefined o null, asignar "00:00"

          const inTime = item.in.split(":").map(Number);
          const outTime = item.out.split(":").map(Number);

          const inDate = new Date(0, 0, 0, inTime[0], inTime[1]);
          const outDate = new Date(0, 0, 0, outTime[0], outTime[1]);
          const diff = (outDate - inDate) / (1000 * 60 * 60); // Diferencia en horas
          const hours = Math.floor(diff);
          const minutes = Math.round((diff - hours) * 60);
          const formattedInTime = `${String(inTime[0]).padStart(2, "0")}:${String(
            inTime[1],
          ).padStart(2, "0")}`;
          const formattedOutTime = `${String(outTime[0]).padStart(2, "0")}:${String(
            outTime[1],
          ).padStart(2, "0")}`;
          const formattedTotalHours = `${String(hours).padStart(2, "0")}:${String(
            minutes,
          ).padStart(2, "0")}`;
          turn[key].in = formattedInTime;
          turn[key].out = formattedOutTime;
          turn[key].total = formattedTotalHours;
        });

        console.log("Turnos:", turn);

        setTurnData(turn);

        const count = Object.keys(turn).length;
        setCountTurnData(count);

        //Obtener el total de horas, en base a los turnos
        let totalHours = 0;
        Object.keys(turn).forEach((key) => {
          let item = turn[key];

          item.in = item.in || "00:00"; // Si in es undefined o null, asignar "00:00"
          item.out = item.out || "00:00"; // Si out es undefined o null, asignar "00:00"

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
          minutes,
        ).padStart(2, "0")}`;
        console.log("Total horas formateadas:", formattedTotalHours);

        setTotalHours(formattedTotalHours);
      } else {
        setTurnData(marks);
        setCountTurnData(countMarks);
        let timeWorked = time.tiempo_trabajado || "00:00"; // Si tiempo_trabajado es undefined o null, asignar "00:00"
        console.log("Tiempo trabajado:", timeWorked);
        setTotalHours(timeWorked.split(":").slice(0, 2).join(":"));
      }
    } catch (error) {
      logout();
      Alert.alert(
        "Error",
        "No se pudo obtener la información del usuario. Por favor, inicie sesión de nuevo."
      );
      console.log(error);
    }
  };

  const getUserButtons = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/custom/fichajes/api/index.php?action=user_buttons`,
      );
      let actionsBucket = [];
      console.log(response.data);
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
        const motivesData = Object.keys(response.data.data.Pausa.motivos).map(
          (key) => {
            return {
              id: key,
              label: response.data.data.Pausa.motivos[key].label, // Accede al valor de 'label'
            };
          },
        );

        setMotives(motivesData);
      }

      if (response.data?.data?.Reanudacion) {
        actionsBucket.push(response.data.data.Reanudacion.action);
      }

      if (actionsBucket.length === 0) {
        actionsBucket.push("none");
      }

      setActions(actionsBucket);
    } catch (error) {
          logout();
          Alert.alert(
            "Error",
            "No se pudo obtener la información del usuario. Por favor, inicie sesión de nuevo."
          );      
          console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserTurnPreliminary();
    }, []),
  );

  //Si se recibe una actualizacion por parametros, se actualiza el estado de las funciones: getUserTurn y getUserButtons
  useEffect(() => {
    if (message) {
      getUserTurnPreliminary();
    }
  }, [message, type]);

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

        {countTurnData > 0 && userName !== "" && actions.length > 0 ? (
          <CardSigning
            turnData={turnData}
            countTurnData={countTurnData}
            totalHours={totalHours}
            actions={actions}
            navigation={navigation}
            motives={motives}
            dateUserTurn={dateUserTurn}
          />
        ) : isUserMultipleTurn ? (
          <CardSelectTurn
            turnData={multipleTurnsData}
            dateUserTurn={dateUserTurn}
            navigation={navigation}
          />
        ) : (
          <SkeletonSigning />
        )}
      </View>
    </ScrollView>
  );
};

export default Signing;
