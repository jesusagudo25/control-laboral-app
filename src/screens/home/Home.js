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

const Home = () => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("Cargando...");
  const [showDialog, setShowDialog] = useState(false);
  const [appStatus, setAppStatus] = useState(AppState.currentState);
  //const [workingDayStatus, setWorkingDayStatus] = useState("NotStarted");
  //const [workingDayStatus, setWorkingDayStatus] = useState("InProgress");
  const [workingDayStatus, setWorkingDayStatus] = useState("Finished");

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

  const logout = async () => {};

  const getName = async () => {};

  /* Control Laboral App */

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <Header
        backgroundColor={theme.colors.accent}
        barStyle="default"
        centerComponent={{
          text: `Buenos días, ${name}`,
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
          <TouchableOpacity style={theme.buttonRequest} activeOpacity={0.5}>
            {workingDayStatus === "NotStarted" ? (
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
                  <Text style={theme.textRequest}>Iniciar jornada laboral</Text>
                  <Text style={theme.paragraphRequest}>
                    Comienza a registrar tu jornada laboral y tus horas
                    trabajadas.
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
                    source={checkInWorkingDay}
                    style={{ width: 80, height: 80 }}
                  />
                </View>
              </View>
            ) : workingDayStatus === "InProgress" ? (
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
                  <Text style={theme.textRequest}>Ver jornada laboral</Text>
                  <Text style={theme.paragraphRequest}>
                    Visualiza tus horas trabajadas y registra tu salida.
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
                    source={woringDayInProgress}
                    style={{ width: 80, height: 80 }}
                  />
                </View>
              </View>
            ) : (
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
                  <Text style={theme.textRequest}>
                    Jornada laboral finalizada
                  </Text>
                  <Text style={theme.paragraphRequest}>
                    Buen trabajo, ya puedes ver tus horas trabajadas.
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
            )}
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
      </View>
    </ScrollView>
  );
};

export default Home;
