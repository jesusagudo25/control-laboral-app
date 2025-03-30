import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Linking,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  AppState,
} from "react-native";
import {
  Header,
  ListItem,
  Card,
  Icon,
  Divider,
  BottomSheet,
  Text,
  Image,
  Dialog,
  useTheme,
} from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar el locale español

dayjs.locale("es"); // Establece español como idioma predeterminado

const Signing = () => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("Cargando...");
  const [showDialog, setShowDialog] = useState(false);
  const [appStatus, setAppStatus] = useState(AppState.currentState);
  const [workingDayStatus, setWorkingDayStatus] = useState("NotStarted");
  //const [workingDayStatus, setWorkingDayStatus] = useState("InProgress");
  //const [workingDayStatus, setWorkingDayStatus] = useState("Finished");
  const [currentDate, setCurrentDate] = useState(
    dayjs().format("DD [de] MMMM [de] YYYY")
  );

  const checkInWorkingDay = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  };

  const woringDayInProgress = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135738.png",
  };

  const workingDayFinished = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135752.png",
  };

  const calendar = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135705.png",
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.container}>
        {/* Titulo ${date} */}
        <View
          style={{
            marginVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 10,
              color: theme.colors.text,
            }}
          >
            {/* 30 de Julio de 2021 */}
            {currentDate}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "400",
              color: theme.colors.text,
            }}
          >
            Valida tu jornada laboral
          </Text>
        </View>

        <Card containerStyle={theme.card}>
          <Card.Title
            style={{
              textAlign: "left",
              color: theme.colors.text,
            }}
          >
            Calendario
          </Card.Title>
          <Card.Divider
            style={{
              backgroundColor: theme.colors.primary,
            }}
          />
          <TouchableOpacity style={theme.buttonRequest} activeOpacity={0.5}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Text style={theme.textRequest}>Visualizar eventos</Text>
                <Text style={theme.paragraphRequest}>
                  Revisa tu programación de eventos y recibe notificaciones de
                  recordatorios.
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40%",
                }}
              >
                <Image source={calendar} style={{ width: 80, height: 80 }} />
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

export default Signing;
