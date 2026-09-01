import axios from "axios";

const KIOSK_API_PATH = "/custom/fichajes/api/index.php";

const createKioskClient = (apiUrl, workerToken) => {
  const baseURL = `${apiUrl.replace(/\/+$/, "")}${KIOSK_API_PATH}`;
  const headers = workerToken
    ? { Authorizationtoken: `Bearer ${workerToken}` }
    : undefined;

  // A dedicated instance keeps kiosk requests out of the global auth interceptor.
  return axios.create({ baseURL, headers });
};

export const getKioskConfig = async (apiUrl) => {
  const response = await createKioskClient(apiUrl).get("", {
    params: { action: "kiosk_config" },
  });
  return response.data;
};

export const validateKioskQr = async (apiUrl, qrCode) => {
  const response = await createKioskClient(apiUrl).post("", {
    action: "kiosk_validate_qr",
    qr_code: qrCode,
  });
  return response.data;
};

export const getCompanyInfo = async (apiUrl, workerToken) => {
  const response = await createKioskClient(apiUrl, workerToken).get("", {
    params: { action: "company_info" },
  });
  return response.data;
};

export const getUserInfo = async (apiUrl, workerToken) => {
  const response = await createKioskClient(apiUrl, workerToken).get("", {
    params: { action: "user_info" },
  });
  return response.data;
};

export const getUserTurn = async (apiUrl, workerToken) => {
  const response = await createKioskClient(apiUrl, workerToken).get("", {
    params: { action: "user_turn" },
  });
  return response.data;
};

export const selectUserTurn = async (
  apiUrl,
  workerToken,
  date,
  idHorarioM
) => {
  const response = await createKioskClient(apiUrl, workerToken).post("", {
    action: "user_turn",
    date,
    idHorarioM,
  });
  return response.data;
};

export const getKioskShiftStatus = async (apiUrl, workerToken) => {
  const response = await createKioskClient(apiUrl, workerToken).get("", {
    params: { action: "kiosk_shift_status" },
  });
  return response.data;
};

export const submitKioskFichaje = async (
  apiUrl,
  workerToken,
  fichajeData
) => {
  const response = await createKioskClient(apiUrl, workerToken).post("", {
    ...fichajeData,
    action: "kiosk_fichaje",
  });
  return response.data;
};
