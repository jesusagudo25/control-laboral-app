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

const Register = ({ navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
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
          Por favor, completa los siguientes datos para solicitar tu cuenta.
        </Text>

        <TextInput
          style={theme.input}
          placeholder="Ingresa tu nombre"
          onChangeText={setName}
          placeholderTextColor={theme.colors.text}
          value={name}
        />

        <TextInput
          style={theme.input}
          placeholder="Ingresa tu usuario"
          onChangeText={setUsername}
          placeholderTextColor={theme.colors.text}
          value={username}
        />

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
          title="Enviar solicitud"
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
            ¿Ya tienes una cuenta?{" "}
            <Text style={{ fontWeight: "bold" }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Register;
