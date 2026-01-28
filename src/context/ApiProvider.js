import { useState, useEffect } from "react";
import ApiContext from "./ApiContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ApiProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState(null);
  const [companyName, setCompanyName] = useState(null);

  const updateApiUrl = async (newUrl) => {
    await AsyncStorage.setItem("apiUrl", newUrl);
    setApiUrl(newUrl);
  };

  const clearApiUrl = async () => {
    await AsyncStorage.removeItem("apiUrl");
    setApiUrl(null);
    setCompanyName(null);
  };

  const saveCompanyInfo = async () => {
    // get axios
    axios
      .get(`${apiUrl}/custom/fichajes/api/index.php?action=company_info`)
      .then((response) => {
        if (response.data && response.data.data && response.data.data.name) {
          setCompanyName(response.data.data.name);
        } else {
          setCompanyName("Nombre de la empresa no disponible");
        }
      })
      .catch((error) => {
        console.log("Error fetching company info:", error);
        setCompanyName("Nombre de la empresa no disponible");
      });
  };

  useEffect(() => {
    AsyncStorage.getItem("apiUrl").then((url) => {
      if (url) setApiUrl(url);
    });
  }, []);

  return (
    <ApiContext.Provider
      value={{
        //Attr
        apiUrl,
        companyName,

        //Methods
        setApiUrl: updateApiUrl,
        clearApiUrl,
        saveCompanyInfo,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
