import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Dialog } from "@rneui/themed";

const Connection = (props) => {
  const [showDialog, setShowDialog] = useState(false);

  const unsuscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected === false) {
      props.setIsConnected(false);
      props.setConnectionType(state.type);
      props.setShowDialog(true);
    }
  });

  useEffect(() => {
    unsuscribe();
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
        <Text>Por favor, verifica tu conexión a internet.</Text>
      </Dialog>
    </View>
  );
};

export default Connection;
