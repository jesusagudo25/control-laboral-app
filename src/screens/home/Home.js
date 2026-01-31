import React, { useCallback, useState } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Header, Icon, Image, useTheme } from "@rneui/themed";

import axios from "axios";
import CardGoo from "../../components/CardGoo";
import SkeletonCard from "../../components/SkeletonCard";
import useAuth from "../../hooks/useAuth";
import { useFocusEffect } from "@react-navigation/native";
import NotificationIcon from "../../components/NotificationIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useApi from "../../hooks/useApi"; // Hook para manejar la URL de la API

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

const Home = ({ navigation }) => {
  const { apiUrl } = useApi(); // Hook para manejar la URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const {
    logout,
    setUserName,
    setGeoLocation,
    countNotifications,
    setCountNotifications,
  } = useAuth(); // Obtener la función de cierre de sesión y el nombre de usuario

  const [workingDayStatus, setWorkingDayStatus] = useState("none");
  const [nameShown, setNameShown] = useState("Cargando...");

  const handleLogout = async () => {
    const response = await axios.delete(
      `${apiUrl}/custom/fichajes/api/index.php?action=auth`,
    );
    console.log("Logout response: ", response.data);
    logout();
  };

  const sendTokenToServer = async () => {
    try {
      const token = await AsyncStorage.getItem("expo_push_token");
      if (token) {
        await axios.patch(`${apiUrl}/custom/fichajes/api/index.php`, {
          action: "user_token",
          expo_token: token,
        });
      }
    } catch (error) {
      console.error("Error al enviar el token al servidor:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      //Set none to workingDayStatus
      setWorkingDayStatus("none");
      setNameShown("Cargando...");

      const getName = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/custom/fichajes/api/index.php?action=user_info`,
          );
          let userName = `${response.data.data.firstname} ${response.data.data.lastname}`;
          userName = userName.replace(/^\w/, (c) => c.toUpperCase()); // Capitaliza la primera letra
          userName = userName.trim(); // Elimina espacios en blanco al inicio y al final
          setUserName(userName);
          setGeoLocation(response.data.data.geolocal);
          setNameShown(`¡Hola, ${userName}!`);
          setWorkingDayStatus(response.data.data.status);
          setCountNotifications(response.data.data.notifications);
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
        }
      };

      getName();
      sendTokenToServer();
    }, []),
  );

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <Header
        backgroundColor={theme.colors.accent}
        barStyle="default"
        centerComponent={{
          text: `${nameShown}`,
          style: {
            color: theme.colors.header,
            fontSize: 16,
          },
        }}
        containerStyle={{ width: Dimensions.get("window").width }}
        leftComponent={
          <NotificationIcon
            count={countNotifications}
            onPress={() => {
              navigation.navigate("Notification");
            }}
          />
        }
        placement="center"
        rightComponent={
          <TouchableOpacity onPress={() => handleLogout()}>
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
            subtitle="Ver jornada laboral"
            description="Tu jornada laboral está en progreso. Revisa tus horas trabajadas."
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
      </View>
    </ScrollView>
  );
};

export default Home;
