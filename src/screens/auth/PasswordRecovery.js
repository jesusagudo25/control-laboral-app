import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Button, Image, Dialog, Divider } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@rneui/themed";

const PasswordRecovery = () => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.container}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../../../assets/logo_small.png")}
            style={{
              width: 180,
              height: 100,
              alignSelf: "center",
              resizeMode: "contain",
            }}
          />
        </View>

        <Text style={[theme.textSecondary, { marginBottom: 20 }]}>
          Por favor, ingresa los datos para recuperar tu contraseña.
        </Text>

        <TextInput
          style={theme.input}
          placeholder="Ingresa tu correo electrónico"
          onChangeText={setEmail}
          placeholderTextColor={theme.colors.text}
          value={email}
        />

        <Dialog
          isVisible={showDialog}
          onBackdropPress={() => setShowDialog(false)}
        >
          <Dialog.Title title="Error" />
          <Text>{message}</Text>
        </Dialog>

        <Button
          title="Recuperar contraseña"
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
            marginBottom: 15,
          }}
          buttonStyle={{
            backgroundColor: theme.colors.accent,
            borderRadius: 3,
            paddingHorizontal: 15,
            paddingVertical: 10,
            width: "100%",
          }}
          onPress={async () => {
            setLoading(true);
            if (name === "" || email === "" || password === "") {
              setMessage("Por favor, ingresa todos los datos.");
              setShowDialog(true);
              setLoading(false);
              return;
            } else if (!checked) {
              setMessage("Por favor, verifica los datos ingresados.");
              setShowDialog(true);
              setLoading(false);
              return;
            }

            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

            if (emailRegex.test(email) === false) {
              setMessage("Por favor, ingresa un correo electrónico válido.");
              setShowDialog(true);
              setLoading(false);
              return;
            }

            const emailUnique = await axios.get(
              `${config.API_URL}/users/validate/${email}`
            );
            if (emailUnique.data.exists) {
              setMessage(
                "El correo electrónico ingresado ya se encuentra registrado."
              );
              setShowDialog(true);
              setLoading(false);
              return;
            }
            setLoading(false);

            navigation.navigate("QuestionRegister", { name, email, password });
          }}
          loading={loading}
        />

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 15,
              color: theme.colors.text,
              marginTop: 10,
            }}
          >
            ¿Recuperaste tu contraseña?{" "}
            <Text style={{ fontWeight: "bold" }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PasswordRecovery;
