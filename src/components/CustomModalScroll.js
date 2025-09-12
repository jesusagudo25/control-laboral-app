import React from "react";
import { View } from "react-native";
import { Dialog, useTheme } from "@rneui/themed";

const CustomModalScroll = ({ isVisible, onBackdropPress, children }) => {
  const { theme } = useTheme();

  return (
    <Dialog
      isVisible={isVisible}
      onBackdropPress={onBackdropPress}
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
      {children}
    </Dialog>
  );
};

export default CustomModalScroll;
