import { useTheme, Text } from "@rneui/themed";
import { View } from "react-native";

const LegendType = () => {
  const { theme } = useTheme();
  return (
    <View style={theme.legend}>
      <Text style={theme.legendItem}>
        <View style={[theme.dot, { backgroundColor: "#4caf50" }]} /> Laboral
      </Text>
      <Text style={theme.legendItem}>
        <View style={[theme.dot, { backgroundColor: "#2196f3" }]} /> Libre
      </Text>
      <Text style={theme.legendItem}>
        <View style={[theme.dot, { backgroundColor: "#ffeb3b" }]} /> Horas extra
      </Text>
      <Text style={theme.legendItem}>
        <View style={[theme.dot, { backgroundColor: "#f44336" }]} /> Ausencia
      </Text>
    </View>
  );
};

export default LegendType;
