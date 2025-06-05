import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@rneui/themed";
import AuthProvider from "./src/context/AuthProvider";
import ApiProvider from "./src/context/ApiProvider";
import Navigate from "./src/navigation/Navigate";
import theme from "./src/theme/theme";
import Connection from "./src/components/Connection";
import StatusApp from "./src/components/StatusApp";

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
      <ApiProvider>
        <AuthProvider>
          <View style={{ marginTop: Constants.statusBarHeight, flexGrow: 1 }}>
            <Navigate />
            <StatusBar style="auto" />
            <StatusApp />
            <Connection />
          </View>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
