import React, { useEffect, useState } from "react";
import { View, TextInput, Alert } from "react-native";
import { useTheme } from "@rneui/themed";
import { Text, Button, Dialog } from "@rneui/themed";
import axios from "axios";

import { Picker } from "@react-native-picker/picker";

import "dayjs/locale/es"; // Importar el locale español

import useForm from "../hooks/useForm";

const ButtonSigning = ({ location, actions, navigation, motives }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL; // URL de la API
  const { theme } = useTheme(); // Obtener el tema actual
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFinish, setIsLoadingFinish] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);

  const [isLoadingBreak, setIsLoadingBreak] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showDialog, setShowDialog] = useState(false);

  const { description, motivo_pausa, longitude, latitude, handleInputChange } =
    useForm({
      description: "",
      motivo_pausa: "",
      longitude: location?.longitude,
      latitude: location?.latitude,
    });

  const handleSignIn = async () => {
    const params = {
      action: "user_fichaje",
      fichaje: "ficharentrada",
      description,
      motivo_pausa,
      long: longitude,
      lat: latitude,
    };

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/index.php`, params);
      if (response.data.success) {
        setErrorMsg(null);
        setIsLoading(false);

        navigation.navigate("Signing", {
          message: "Entrada registrada correctamente.",
          type: "success",
        });
      } else {
        setErrorMsg(response.data.msg);
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg("Error al registrar la entrada. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  const handleBreak = async () => {
    const params = {
      action: "user_fichaje",
      fichaje: "ficharpausa",
      description,
      motivo_pausa,
      long: longitude,
      lat: latitude,
    };

    setIsLoadingBreak(true);
    try {
      const response = await axios.post(`${API_URL}/index.php`, params);
      if (response.data.success) {
        setErrorMsg(null);
        setIsLoadingBreak(false);
        setShowDialog(false); // Cerrar el diálogo después de enviar
        handleInputChange("description", ""); // Limpiar el campo de descripción
        handleInputChange("motivo_pausa", ""); // Limpiar el campo de motivo de pausa

        navigation.navigate("Signing", {
          message: "Pausa registrada correctamente.",
          type: "success",
        });
      } else {
        setErrorMsg(response.data.msg);
        setIsLoadingBreak(false);
      }
    } catch (error) {
      console.error("Error: ", error);
      setErrorMsg("Error al registrar la pausa. Inténtalo de nuevo.");
      setIsLoadingBreak(false);
    }
  };

  const handleContinue = async () => {
    const params = {
      action: "user_fichaje",
      fichaje: "ficharreanudacion",
      description,
      motivo_pausa,
      long: longitude,
      lat: latitude,
    };

    setIsLoadingContinue(true);

    try {
      const response = await axios.post(`${API_URL}/index.php`, params);
      if (response.data.success) {
        setErrorMsg(null);
        setIsLoadingContinue(false);
        navigation.navigate("Signing", {
          message: "Reanudación registrada correctamente.",
          type: "success",
        });
      } else {
        setErrorMsg(response.data.msg);
        setIsLoadingContinue(false);
      }
    } catch (error) {
      console.error("Error: ", error);
      setErrorMsg("Error al registrar la reanudación. Inténtalo de nuevo.");
      setIsLoadingContinue(false);
    }
  };

  const handleFinish = async () => {
    const params = {
      action: "user_fichaje",
      fichaje: "ficharsalida",
      description,
      motivo_pausa,
      long: longitude,
      lat: latitude,
    };

    setIsLoadingFinish(true);
    try {
      const response = await axios.post(`${API_URL}/index.php`, params);
      if (response.data.success) {
        setErrorMsg(null);
        setIsLoadingFinish(false);

        navigation.navigate("Signing", {
          message: "Salida registrada correctamente.",
          type: "success",
        });
      } else {
        setErrorMsg(response.data.msg);
        setIsLoadingFinish(false);
      }
    } catch (error) {
      console.error("Error: ", error);
      setErrorMsg("Error al registrar la salida. Inténtalo de nuevo.");
      setIsLoadingFinish(false);
    }
  };

  const handleNavigateSign = () => {
    setIsLoading(true);
    navigation.navigate("SignDay", {
      fichaje: "ficharfirma",
      description: description,
      motivo_pausa: motivo_pausa,
      long: longitude,
      lat: latitude,
    });
    setIsLoading(false);
  };

  return (
    <View>
      {actions.includes("ficharentrada") && (
        <Button
          title="Iniciar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => handleSignIn()}
          disabled={isLoading}
          loading={isLoading}
        />
      )}

      {actions.includes("ficharpausa") && (
        <View>
          <Button
            title="Pausar"
            containerStyle={theme.buttonPrimaryContainer}
            buttonStyle={theme.buttonPrimaryStyle}
            onPress={() => setShowDialog(true)}
            disabled={isLoadingBreak}
            loading={isLoadingBreak}
          />

          <Button
            title="Finalizar"
            type="outline"
            titleStyle={{ color: theme.colors.primary }}
            containerStyle={theme.buttonSecondaryContainer}
            buttonStyle={theme.buttonSecondaryStyle}
            onPress={() => handleFinish()}
            disabled={isLoadingFinish}
            loading={isLoadingFinish}
          />
        </View>
      )}

      {actions.includes("ficharfirma") && (
        <Button
          title="Firmar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => handleNavigateSign()}
          disabled={isLoading}
          loading={isLoading}
        />
      )}

      {actions.includes("ficharreanudacion") && (
        <Button
          title="Reanudar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => handleContinue()}
          disabled={isLoadingContinue}
          loading={isLoadingContinue}
        />
      )}

      <Dialog
        isVisible={showDialog}
        onBackdropPress={() => setShowDialog(false)}
        overlayStyle={{
          backgroundColor: theme.colors.header,
          borderRadius: 10,
          padding: 20,
        }}
        dialogStyle={{
          backgroundColor: theme.colors.header,
          borderRadius: 10,
        }}
        dialogContainerStyle={{
          backgroundColor: theme.colors.header,
          borderRadius: 10,
        }}
        dialogTitleStyle={{
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: "bold",
        }}
        titleStyle={{ color: theme.colors.text }}
      >
        <Dialog.Title title="Pausa" />
        <Text>Selecciona el motivo de la pausa y añade una descripción.</Text>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#1E6091", // Color del borde
            overflow: "hidden", // Esto asegura que el borde se vea alrededor del Picker
            height: 45, // Define la altura del contenedor
            justifyContent: "center", // Centra el contenido dentro del contenedor
            paddingVertical: 0, // Elimina padding extra
            marginVertical: 10, // Espacio entre el Picker y el TextInput
          }}
        >
          <Picker
            selectedValue={motivo_pausa}
            onValueChange={(itemValue) => {
              handleInputChange("motivo_pausa", itemValue);
            }}
            style={{ width: "100%", height: 55 }}
            itemStyle={{
              height: 55,
              transform: [{ scaleX: 1 }, { scaleY: 1 }],
            }}
          >
            <Picker.Item label="Selecciona un motivo" value="" />
            {motives.map((motive) => (
              <Picker.Item
                key={motive.id}
                label={motive.label}
                value={motive.id}
              />
            ))}
          </Picker>
        </View>
        <TextInput
          style={theme.input}
          placeholder="Descripción"
          value={description}
          onChangeText={(description) =>
            handleInputChange("description", description)
          }
          placeholderTextColor={theme.colors.text}
          multiline={true}
          numberOfLines={4}
        />

        <Button
          title="Enviar"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          onPress={() => {
            if (!motivo_pausa) {
              Alert.alert("Error", "Debes seleccionar un motivo de pausa.");
              return;
            }
            setShowDialog(false);
            handleBreak();
          }}
          disabled={isLoadingBreak}
          loading={isLoadingBreak}
        />
      </Dialog>
    </View>
  );
};

export default ButtonSigning;
