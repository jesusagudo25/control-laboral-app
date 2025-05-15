import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Card, Text, Image, useTheme } from "@rneui/themed";

const CardCalendar = ({ children }) => {
  const { theme } = useTheme(); // Obtener el tema actual

  return <Card containerStyle={theme.cardCalendar}>{children}</Card>;
};

export default CardCalendar;
