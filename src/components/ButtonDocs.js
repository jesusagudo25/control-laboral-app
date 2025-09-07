import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "@rneui/themed";

const ButtonDocs = ({ title, theme, navigation, screen, params }) => {
  
  const handlePress = () => {
    navigation.navigate(screen, params);
  };

  return (
    <View style={{ marginBottom: 5, borderRadius: 6, overflow: "hidden" }}>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={(theme.textSecondary, { fontWeight: "bold" })}>
          {title}
        </Text>
        <Icon
          name={"chevron-right"}
          type="material"
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ButtonDocs;
