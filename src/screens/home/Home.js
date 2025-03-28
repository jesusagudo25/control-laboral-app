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
  useTheme
} from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Home = () => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("Cargando...");
  const [showDialog, setShowDialog] = useState(false);
  const [appStatus, setAppStatus] = useState(AppState.currentState);

  const list = [
    {
      title: "Funcionamiento",
      onPress: () => {
        setIsVisible(false);
        navigation.navigate("Operation");
      },
      titleStyle: { color: "#371B34" },
    },
    {
      title: "Aspectos agronómicos",
      onPress: () => {
        setIsVisible(false);
        navigation.navigate("Agronomic");
      },
      titleStyle: { color: "#371B34" },
    },
    {
      title: "Contactar a un asesor",
      onPress: () => {
        setIsVisible(false);
        const url = `whatsapp://send?phone=${config.WHATSAPP_NUMBER}`;

        Linking.openURL(url)
          .then(() => {
            console.log("Whatsapp Opened");
          })
          .catch((err) => {
            setShowDialog(true);
          });
      },
      titleStyle: { color: "#371B34" },
    },
    {
      title: "Cerrar",
      containerStyle: { backgroundColor: "#F09E54" },
      titleStyle: { color: "white" },
      onPress: () => setIsVisible(false),
    },
  ];

  const calculator = {
    uri: "https://plus.unsplash.com/premium_photo-1663045734621-98e1f1007c34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  };
  const history = {
    uri: "https://plus.unsplash.com/premium_photo-1663040310399-28080634fc91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  };

  const premium = {
    uri: "https://revistapesquisa.fapesp.br/wp-content/uploads/2019/09/038-040_Rel.-agricultura_271-1200px-1-1.png",
  };

  const logout = async () => {
  
  };

  const getName = async () => {

  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View>
        <Header
          backgroundColor={theme.colors.accent}
          barStyle="default"
          centerComponent={{
            text: `Buenos días, ${name}`,
            style: { color: "#fff", fontSize: 16 },
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

        <Card
          containerStyle={{
            borderRadius: 6,
            marginTop: 20,
          }}
        >
          <Card.Title style={{ textAlign: "left", color: "#371B34" }}>
            ¿Qué quieres hacer hoy?
          </Card.Title>
          <Card.Divider
            style={{
              backgroundColor: "#F09E54",
            }}
          />
          <View style={styles.vertical}>
            <TouchableOpacity
              style={styles.buttonFacebookStyle}
              activeOpacity={0.5}
              onPress={() => {
                navigation.navigate("Calculator");
              }}
            >
              <ImageBackground
                source={calculator}
                resizeMode="cover"
                style={styles.image}
                imageStyle={{ borderRadius: 6 }}
              >
                <Text style={styles.text}>Calculadora</Text>
              </ImageBackground>
            </TouchableOpacity>

            <Divider
              orientation="vertical"
              style={{
                backgroundColor: "#371B34",
                height: 100,
                width: 1,
                marginHorizontal: 10,
              }}
            />

            <TouchableOpacity
              style={styles.buttonFacebookStyle}
              activeOpacity={0.5}
              onPress={() => {
                navigation.navigate("Record");
              }}
            >
              <ImageBackground
                source={history}
                resizeMode="cover"
                style={styles.image}
                imageStyle={{ borderRadius: 6 }}
              >
                <Text style={styles.text}>Historial</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </Card>

        <Card
          containerStyle={{
            borderRadius: 6,
            marginTop: 20,
            height: 180,
          }}
        >
          <Card.Title style={{ textAlign: "left", color: "#371B34" }}>
            ¡Actualiza tu cuenta!
          </Card.Title>
          <Card.Divider
            style={{
              backgroundColor: "#F09E54",
            }}
          />
          <TouchableOpacity
            style={styles.buttonRequest}
            activeOpacity={0.5}
            onPress={() => {
              navigation.navigate("Premium");
            }}
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
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "left",
                    marginBottom: 5,
                    color: "#371B34",
                  }}
                >
                  Plan premium
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    textAlign: "left",
                    color: "#371B34",
                  }}
                >
                  Obtienes multiples beneficios para tu cuenta
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
                <Image source={premium} style={{ width: 80, height: 80 }} />
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  vertical: {
    marginBottom: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  image: {
    width: Dimensions.get("window").width / 2 - 35,
    height: Dimensions.get("window").width / 2 - 35,
    justifyContent: "center",
    borderRadius: 100,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#000000c0",
  },
  button: {
    position: "absolute",
    borderRadius: 100,
    padding: 20,
  },
  containerPercentage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRequest: {
    height: 130,
  },
  textPercentage: {
    color: "#43484d",
    fontSize: 18,
    textAlign: "center",
    position: "absolute",
    padding: 20,
  },
  textRequest: {
    color: "#43484d",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
