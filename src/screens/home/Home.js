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
import Connection from "../../components/Connection";
import StatusApp from "../../components/StatusApp";

const Home = ({ navigation }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("Cargando...");
  const [showDialog, setShowDialog] = useState(false);
  const [appStatus, setAppStatus] = useState(AppState.currentState);

  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState("none");

  const workingDayFinished = {
    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135752.png",
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

    //index.php?day=7&action=user_turn&date=2025-04-03
    console.log(
      `${API_URL}/index.php?day=${dayWeek}&action=user_turn&date=${currentDate}`
    );

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
          await axios.post(`${config.API_URL}/logout`);
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

        <Card containerStyle={theme.card}>
          <Card.Title
            style={{
              textAlign: "left",
              color: theme.colors.text,
            }}
          >
            Fichaje
          </Card.Title>
          <Card.Divider
            style={{
              backgroundColor: theme.colors.primary,
            }}
          />
          <TouchableOpacity
            style={theme.buttonRequest}
            activeOpacity={0.5}
            onPress={() => navigation.navigate("Signing")}
          >
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
                <Text style={theme.textRequest}>Jornada laboral</Text>
                <Text style={theme.paragraphRequest}>
                  Realiza el fichaje de entrada y salida de tu jornada laboral.
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
                <Image
                  source={workingDayFinished}
                  style={{ width: 80, height: 80 }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Card>

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
