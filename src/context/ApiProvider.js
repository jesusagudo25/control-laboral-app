import { useState, useEffect } from "react";
import ApiContext from "./ApiContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ApiProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState(null);

  useEffect(() => {
    console.log("Initializing API URL from AsyncStorage...");
    AsyncStorage.getItem("apiUrl").then((url) => {
      if (url) setApiUrl(url);
    });
  }, []);

  const updateApiUrl = async (newUrl) => {
    console.log("Updating API URL to:", newUrl);
    await AsyncStorage.setItem("apiUrl", newUrl);
    setApiUrl(newUrl);
  };

  const clearApiUrl = async () => {
    console.log("Clearing API URL");
    await AsyncStorage.removeItem("apiUrl");
    setApiUrl(null);
  };

  return (
    <ApiContext.Provider
      value={{ apiUrl, setApiUrl: updateApiUrl, clearApiUrl }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
