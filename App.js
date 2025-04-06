import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@rneui/themed";
import AuthProvider from "./src/context/AuthProvider";
import Navigate from "./src/navigation/Navigate";
import theme from "./src/theme/theme";
import { NavigationContainer } from "@react-navigation/native";

axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorizationtoken = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <View style={{ marginTop: Constants.statusBarHeight, flexGrow: 1 }}>
          <Navigate />
          <StatusBar style="auto" />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}
