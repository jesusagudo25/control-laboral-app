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

const Login = ({ navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {};

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

        <TextInput
          style={theme.input}
          placeholder="Ingresa tu correo electrónico"
          onChangeText={setEmail}
          placeholderTextColor={theme.colors.text}
          value={email}
        />
        <TextInput
          style={theme.input}
          placeholder="Ingresa tu contraseña"
          onChangeText={setPassword}
          placeholderTextColor={theme.colors.text}
          value={password}
          secureTextEntry={true}
        />

        <Dialog
          isVisible={showDialog}
          onBackdropPress={() => setShowDialog(false)}
        >
          <Dialog.Title title="Error" />
          <Text>{message}</Text>
        </Dialog>

        <TouchableOpacity activeOpacity={0.8}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 15,
              color: theme.colors.text,
              marginTop: 10,
            }}
          >
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <Button
          title="Iniciar sesión"
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 25,
            marginBottom: 10,
          }}
          buttonStyle={{
            backgroundColor: theme.colors.accent,
            borderRadius: 3,
            paddingHorizontal: 15,
            paddingVertical: 10,
            width: "100%",
          }}
          onPress={() => handleLogin()}
          loading={loading}
          disabled={loading}
        />

        <Button
          title="Crea tu usuario o abre tu cuenta"
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
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

export default Login;

