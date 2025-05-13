import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Text, Image, useTheme } from "@rneui/themed";

const CardGoo = ({
  title,
  subtitle,
  description,
  icon,
  navigation,
  screen,
}) => {
  const { theme } = useTheme(); // Obtener el tema actual

  return (
    <Card containerStyle={theme.card}>
      <Card.Title
        style={{
          textAlign: "left",
          color: theme.colors.text,
        }}
      >
        {title}
      </Card.Title>
      <Card.Divider
        style={{
          backgroundColor: theme.colors.primary,
        }}
      />
      <TouchableOpacity
        style={theme.buttonRequest}
        activeOpacity={0.5}
        onPress={() => navigation.navigate(screen)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              width: "60%",
            }}
          >
            <Text style={theme.textRequest}>{subtitle}</Text>
            <Text style={theme.paragraphRequest}>{description}</Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "40%",
            }}
          >
            <Image source={icon} style={{ width: 80, height: 80 }} />
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default CardGoo;
