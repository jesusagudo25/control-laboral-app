import React, { useEffect, useState } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  AppState,
} from "react-native";
import { Header, Skeleton, Icon, Image, useTheme } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Connection from "../../components/Connection";
import StatusApp from "../../components/StatusApp";
import CardGoo from "../../components/CardGoo";
import { LinearGradient } from "expo-linear-gradient";
import SkeletonCard from "../../components/SkeletonCard";

const Home = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const [name, setName] = useState("");
  const [appStatus, setAppStatus] = useState(AppState.currentState);
  const [connectionType, setConnectionType] = useState("none");
  const [workingDayStatus, setWorkingDayStatus] = useState("none");

  const workingDayFinished = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135752.png",
  };

  const checkInWorkingDay = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  };

  const woringDayInProgress = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135738.png",
  };

  const calendar = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135705.png",
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userName");

    //Falta el fetch para cerrar sesión en la API
    navigation.navigate("Login");
  };

  const getName = async () => {
    try {
      const response = await axios.get(`${API_URL}/index.php?action=user_info`);

      setName(`¡Hola, ${response.data.data.lastname}!`);
      setWorkingDayStatus(response.data.data.status);
      console.log(response.data.data.status);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserTurn = async () => {
    const dayWeek = new Date().getDay(); // 0-6 -> 1-7
    const dayName = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const day = dayName[dayWeek]; // 0-6 -> sunday-saturday
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      const response = await axios.get(
        `${API_URL}/index.php?day=${dayWeek}&action=user_turn&date=${currentDate}`
      );
      console.log(response.data.data.horario[day]);
      const turn = response.data.data.horario[day];
      //contar cuantos registros tiene turn
      const count = Object.keys(turn).length;
      console.log(count);
    } catch (error) {
      console.log(error);
    }
  };

  /* Control Laboral App */

  useEffect(() => {
    getName();
    //getUserTurn();
  }, []);

  useEffect(() => {
    if (appStatus !== "active") {
      const exit = async () => {
        try {
          //await axios.post(`${config.API_URL}/logout`);
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("id");
        } catch (error) {
          console.log(error);
        }
      };
      exit();
    }
  }, [appStatus]);

  React.useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        logout();
      }),
    [navigation]
  );

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <Header
        backgroundColor={theme.colors.accent}
        barStyle="default"
        centerComponent={{
          text: `${name}`,
          style: {
            color: theme.colors.header,
            fontSize: 16,
          },
        }}
        containerStyle={{ width: Dimensions.get("window").width }}
        leftComponent={
          <TouchableOpacity onPress={() => setIsVisible(true)}>
            <Icon name="notifications" color="white" />
          </TouchableOpacity>
        }
        placement="center"
        rightComponent={
          <TouchableOpacity onPress={() => logout()}>
            <Icon name="logout" color="white" />
          </TouchableOpacity>
        }
      />
      <View style={[theme.container, { marginTop: 0, paddingTop: 10 }]}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../assets/logo_trans.png")}
            style={{
              width: 80,
              height: 80,
              alignSelf: "center",
              resizeMode: "contain",
            }}
          />
        </View>

        {workingDayStatus === "none" ? (
          <SkeletonCard />
        ) : workingDayStatus === "Sin iniciar" ? (
          <CardGoo
            title="Control Laboral"
            subtitle="Iniciar jornada laboral"
            description="Inicia tu jornada laboral para registrar tus horas de trabajo."
            icon={checkInWorkingDay}
            navigation={navigation}
            screen="Signing"
          />
        ) : workingDayStatus === "En proceso" ? (
          <CardGoo
            title="Control Laboral"
            subtitle="Finalizar jornada laboral"
            description="Finaliza tu jornada laboral para registrar tus horas de trabajo."
            icon={woringDayInProgress}
            navigation={navigation}
            screen="Signing"
          />
        ) : workingDayStatus === "Finalizado" ? (
          <CardGoo
            title="Control Laboral"
            subtitle="Jornada laboral finalizada"
            description="Tu jornada laboral ha finalizado. Revisa tus horas trabajadas."
            icon={workingDayFinished}
            navigation={navigation}
            screen="Signing"
          />
        ) : null}

        {workingDayStatus === "none" ? (
          <SkeletonCard />
        ) : (
          <CardGoo
            title="Calendario"
            subtitle="Visualiza eventos"
            description="Revisa tu programación de eventos y recibe notificaciones de recordatorios."
            icon={calendar}
            navigation={navigation}
            screen="Calendar"
          />
        )}

        <StatusApp
          appStatus={appStatus}
          setAppStatus={setAppStatus}
          navigation={navigation}
        />
        <Connection
          setIsConnected={setIsConnected}
          setConnectionType={setConnectionType}
          navigation={navigation}
        />
      </View>
    </ScrollView>
  );
};

export default Home;
