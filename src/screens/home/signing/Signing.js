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
import { Button } from "@rneui/base";

dayjs.locale("es"); // Establece español como idioma predeterminado

const Signing = () => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("Cargando...");
  const [showDialog, setShowDialog] = useState(false);
  const [appStatus, setAppStatus] = useState(AppState.currentState);
  //const [workingDayStatus, setWorkingDayStatus] = useState("NotStarted");
  const [workingDayStatus, setWorkingDayStatus] = useState("InProgress");
  //const [workingDayStatus, setWorkingDayStatus] = useState("Finished");
  const [currentDate, setCurrentDate] = useState(
    dayjs().format("DD [de] MMMM [de] YYYY")
  );

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

          <Card containerStyle={theme.showSigning}>
            <View
              style={{
                flexDirection: "column",
                width: "100%"
              }}
            >
              <View>
                <Text style={theme.textSigning}>Nombre de usuario</Text>
                <Text style={theme.titleSigning}>Empresa</Text>
                <Text style={theme.textSigning}>Recursos Humanos</Text>
              </View>

              <View>
                <Text style={theme.titleSigning}>Jornada laboral</Text>
                <Divider />
                <Text style={theme.hoursSigning}>09:00 a 14:00</Text>
                <Divider />
                <Text style={theme.hoursSigning}>16:00 a 19:00</Text>
                <Divider />
                <Text style={theme.titleSigning}>Total jornada: 08:00</Text>
              </View>

              <View>
                {workingDayStatus === "NotStarted" ? (
                  <Button
                    title="Iniciar jornada"
                    containerStyle={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 25,
                      marginBottom: 5,
                    }}
                    buttonStyle={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: 3,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      width: "100%",
                    }}
                    onPress={() => handleLogin()}
                  />
                ) : workingDayStatus === "InProgress" ? (
                  <>
                    <Button
                      title="Pausar jornada"
                      containerStyle={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        marginBottom: 5,
                      }}
                      buttonStyle={{
                        backgroundColor: theme.colors.accent,
                        borderRadius: 3,
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        width: "100%",
                      }}
                      onPress={() => handleLogin()}
                    />

                    <Button
                      title="Finalizar jornada"
                      type="outline"
                      titleStyle={{ color: theme.colors.primary }}
                      containerStyle={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 5,
                        marginBottom: 20,
                      }}
                      buttonStyle={{
                        borderColor: theme.colors.primary,
                        borderWidth: 1.2,
                        borderRadius: 3,
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        width: "100%",
                      }}
                      onPress={() => handleLogin()}
                    />
                  </>
                ) : (
                  <Button
                    title="Reanudar jornada"
                    containerStyle={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 10,
                      marginBottom: 5,
                    }}
                    buttonStyle={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: 3,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      width: "100%",
                    }}
                    onPress={() => handleLogin()}
                  />
                )}
              </View>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};

export default Signing;
