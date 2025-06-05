// src/context/useAuth.js
import { useContext } from "react";
import ApiContext from "../context/ApiContext";

const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export default useApi;
