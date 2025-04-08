import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import { Text, useTheme } from "@rneui/themed";
import { Button } from "@rneui/base";

const SignDay = ({ navigation }) => {
  const { theme } = useTheme(); // Obtener el tema actual
  const [signature, setSignature] = useState(null);
  const ref = useRef();

  const handleSignature = (signature) => {
    //console.log(signature);
    setSignature(signature);
  };

  //Al intentar guardar una firma vacía
  const handleEmpty = () => {
    console.log("Empty");
  };

  //Al intentar limpiar la firma
  const handleClear = () => {
    console.log("Clear success!");
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
            console.log(signature);
          }}
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height - 200,
    backgroundColor: "none",
    padding: 30,
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
    height: ${Dimensions.get("window").height - 200}px;
  }
  .m-signature-pad--footer {
    display: none;
    margin: 0px;
    background-color: "none";
  }
  canvas {
    border-radius: 8px;
    border: 1px solid #ccc;
    background-color: "none";
  }
`;

export default SignDay;
