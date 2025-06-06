import { useState, useEffect } from "react";
import ApiContext from "./ApiContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ApiProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("apiUrl").then((url) => {
      if (url) setApiUrl(url);
    });
  }, []);

  const updateApiUrl = async (newUrl) => {
    await AsyncStorage.setItem("apiUrl", newUrl);
    setApiUrl(newUrl);
  };

  const clearApiUrl = async () => {
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
