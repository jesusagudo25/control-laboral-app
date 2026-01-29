import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { Dialog } from "@rneui/themed";
import SignatureCanvas from "react-native-signature-canvas";
import { Text, useTheme } from "@rneui/themed";
import { Button } from "@rneui/base";
import axios from "axios";
import CustomModal from "../../../components/CustomModal";
import useApi from "../../../hooks/useApi"; // Hook para manejar la URL de la API

const SignDay = ({ navigation, route }) => {
  const { apiUrl } = useApi(); // Hook para manejar la URL de la API

  const { fichaje, description, motivo_pausa, long, lat, dateUserTurn } = route.params || {}; // Desestructuración de los parámetros

  const { theme } = useTheme(); // Obtener el tema actual
  const [signature, setSignature] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef();

  const handleSignature = (signature) => {
    setSignature(signature);
  };

  const handleSaveSignature = async (signature) => {
    if (!signature) {
      setShowDialog(true);
      setMessage("Por favor, firme antes de continuar.");
      return;
    }

    const params = {
      action: "user_fichaje",
      signature: signature,
      fichaje: fichaje,
      description: description,
      motivo_pausa: motivo_pausa,
      long: long,
      lat: lat,
      date: dateUserTurn,
    };

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/custom/fichajes/api/index.php`,
        params
      );
      if (response.data.success) {
        setMessage(null);
        setIsLoading(false);

        //Limpiar la firma
        ref.current.clearSignature();

        navigation.reset({
          index: 1,
          routes: [
            { name: "Inicio" },
            {
              name: "Signing",
              params: {
                message: "Salida registrada correctamente.",
                type: "success",
              },
            },
          ],
        });
      } else {
        //Limpiar la firma
        ref.current.clearSignature();
        setShowDialog(true);
        setMessage(response.data.msg);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error: ", error);
      setMessage("Error al registrar la salida. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  //Al intentar guardar una firma vacía
  const handleEmpty = () => {
    setShowDialog(true);
    setMessage("Por favor, firme antes de continuar.");
    return;
  };

  //Al intentar limpiar la firma
  const handleClear = () => {
    //setShowDialog(true);
    //setMessage("La firma se ha limpiado.");
  };

  //Al terminar de firmar
  const handleEnd = () => {
    ref.current.readSignature();
  };

  return (
    <View style={styles.container}>
      <SignatureCanvas
        ref={ref}
        onEnd={handleEnd}
        onOK={handleSignature}
        onEmpty={handleEmpty}
        onClear={handleClear}
        descriptionText="Dibuje su firma"
        clearText="Limpiar"
        confirmText="Confirmar"
        webStyle={styleSignatureCanvas}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Guardar"
          onPress={() => {
            ref.current.readSignature();
            handleSaveSignature(signature);
          }}
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          disabled={isLoading}
          loading={isLoading}
        />

        <Button
          title="Limpiar"
          type="outline"
          onPress={() => ref.current.clearSignature()}
          titleStyle={{ color: theme.colors.primary }}
          containerStyle={theme.buttonSecondaryContainer}
          buttonStyle={theme.buttonSecondaryStyle}
        />
      </View>

      <CustomModal
        isVisible={showDialog}
        onBackdropPress={() => setShowDialog(false)}
      >
        <Dialog.Title
          title="Alerta"
          titleStyle={{ color: theme.colors.text }}
        />
        <Text>{message}</Text>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "none",
    padding: 20,
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  buttonPrimary: {
    backgroundColor: "#f7941e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#888",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

// Estilos personalizados para el canvas web
const styleSignatureCanvas = `
  .m-signature-pad {
    box-shadow: none;
    border: none;
    border-radius: 8px;
    background-color: "none";
    padding: 0px;
  }
  .m-signature-pad--footer {
    display: none;
    margin: 0px;
    background-color: "none";
    padding: 0px;s
  }
  body,html {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
  }
  .m-signature-pad--body {
    background-color: "none";
    padding: 0px;
  }
  canvas {
    border-radius: 8px;
    border: 1px solid #ccc;
    background-color: "none";
    padding: 0px;
  }
`;

export default SignDay;
