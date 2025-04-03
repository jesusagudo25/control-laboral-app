import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Dialog } from "@rneui/themed";

const StatusApp = (props) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleChange = async (newState) => {
    if (newState === "active") {
      props.setAppStatus(newState);
    } else {
      props.setAppStatus(newState);
      setShowDialog(true);
    }
  };

  useEffect(() => {
    const suscription = AppState.addEventListener("change", handleChange);

    return () => {
      suscription.remove();
    };
  }, []);

  return (
    <View>
      <Dialog
        isVisible={showDialog}
        onBackdropPress={() => {
          setShowDialog(false);
          props.navigation.navigate("Login");
        }}
      >
        <Dialog.Title title="Error" />
        <Text>Has salido de la aplicación, por favor, vuelve a ingresar.</Text>
      </Dialog>
    </View>
  );
};

export default StatusApp;
