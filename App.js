import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@rneui/themed";
import Navigate from "./src/navigation/Navigate";
import theme from "./src/theme/theme";

axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);



export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <View style={{ marginTop: Constants.statusBarHeight, flexGrow: 1 }}>
        <Navigate />
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}
