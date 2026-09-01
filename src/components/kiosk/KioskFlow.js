import React, { useEffect, useRef, useState } from "react";
import useApi from "../../hooks/useApi";
import {
  getCompanyInfo,
  getKioskConfig,
  getUserInfo,
  validateKioskQr,
} from "../../services/kioskApi";
import KioskActionsView from "./KioskActionsView";
import KioskConfirmationView from "./KioskConfirmationView";
import KioskTerminalView from "./KioskTerminalView";

const SIMULATED_ACTIONS = [
  {
    id: "start-break",
    title: "Iniciar pausa",
    description: "Registra una pausa temporal en tu jornada.",
    icon: "pause",
    confirmationTitle: "Pausa iniciada",
  },
  {
    id: "end-shift",
    title: "Finalizar jornada",
    description: "Finaliza tu jornada laboral del día de hoy.",
    icon: "stop",
    confirmationTitle: "Jornada finalizada",
  },
];

const normalizeApiUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const normalizedApiUrl = value.trim();
    const parsedApiUrl = new globalThis.URL(normalizedApiUrl);
    return ["http:", "https:"].includes(parsedApiUrl.protocol)
      ? normalizedApiUrl
      : null;
  } catch {
    return null;
  }
};

const isValidKioskConfig = (data) =>
  data &&
  typeof data.enabled === "boolean" &&
  [
    data.idle_timeout_seconds,
    data.confirmation_timeout_seconds,
    data.worker_session_ttl_seconds,
  ].every((value) => Number.isFinite(value) && value >= 0);

const isUnauthorizedError = (error) =>
  [401, 403].includes(error?.response?.status);

const KioskFlow = ({ onOperationalStateChange }) => {
  const { apiUrl } = useApi();
  const [kioskStep, setKioskStep] = useState("terminal");
  const [selectedKioskAction, setSelectedKioskAction] = useState(null);
  const [kioskConfig, setKioskConfig] = useState(null);
  const [isKioskConfigLoading, setIsKioskConfigLoading] = useState(false);
  const [kioskConfigError, setKioskConfigError] = useState(null);
  const [kioskConfigRequest, setKioskConfigRequest] = useState(0);
  const [qrValue, setQrValue] = useState("");
  const [workerToken, setWorkerToken] = useState(null);
  const [isValidatingQr, setIsValidatingQr] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [workerSessionStartedAt, setWorkerSessionStartedAt] = useState(null);
  const [workerSessionDeadline, setWorkerSessionDeadline] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [geoLocationPolicy, setGeoLocationPolicy] = useState(null);
  const [isLoadingWorkerInfo, setIsLoadingWorkerInfo] = useState(false);
  const [workerInfoError, setWorkerInfoError] = useState(null);
  const isValidatingQrRef = useRef(false);
  const qrValidationRequestRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    const loadKioskConfig = async () => {
      setKioskConfig(null);
      setKioskConfigError(null);
      const normalizedApiUrl = normalizeApiUrl(apiUrl);

      if (!normalizedApiUrl) {
        setIsKioskConfigLoading(false);
        setKioskConfigError(
          "Configura una URL de API válida para usar el modo kiosco.",
        );
        return;
      }

      try {
        setIsKioskConfigLoading(true);
        const response = await getKioskConfig(normalizedApiUrl);

        if (response?.success !== true || !isValidKioskConfig(response.data)) {
          throw new Error("Invalid kiosk configuration response");
        }

        if (isActive) {
          setKioskConfig(response.data);
        }
      } catch {
        if (isActive) {
          setKioskConfigError(
            "No se pudo cargar la configuración del modo kiosco. Inténtalo de nuevo.",
          );
        }
      } finally {
        if (isActive) {
          setIsKioskConfigLoading(false);
        }
      }
    };

    loadKioskConfig();

    return () => {
      isActive = false;
    };
  }, [apiUrl, kioskConfigRequest]);

  useEffect(() => {
    onOperationalStateChange?.(kioskStep !== "terminal");
  }, [kioskStep, onOperationalStateChange]);

  useEffect(
    () => () => {
      qrValidationRequestRef.current += 1;
      onOperationalStateChange?.(false);
    },
    [onOperationalStateChange],
  );

  const resetWorkerSession = () => {
    qrValidationRequestRef.current += 1;
    isValidatingQrRef.current = false;
    setQrValue("");
    setWorkerToken(null);
    setIsValidatingQr(false);
    setQrError(null);
    setWorkerSessionStartedAt(null);
    setWorkerSessionDeadline(null);
    setCompanyInfo(null);
    setUserInfo(null);
    setGeoLocationPolicy(null);
    setIsLoadingWorkerInfo(false);
    setWorkerInfoError(null);
    setSelectedKioskAction(null);
  };

  const onQrValueChange = (value) => {
    setQrValue(value);
    setQrError(null);
    setWorkerInfoError(null);
  };

  const onWorkerIdentified = async () => {
    if (isValidatingQrRef.current) {
      return;
    }

    const normalizedApiUrl = normalizeApiUrl(apiUrl);
    const normalizedQrValue = qrValue.trim();

    if (!normalizedApiUrl || !normalizedQrValue) {
      setQrError("Introduce un código QR válido para continuar.");
      return;
    }

    const requestId = qrValidationRequestRef.current + 1;
    qrValidationRequestRef.current = requestId;
    isValidatingQrRef.current = true;
    setIsValidatingQr(true);
    setQrError(null);
    setWorkerInfoError(null);

    let isLoadingInformation = false;

    try {
      const response = await validateKioskQr(
        normalizedApiUrl,
        normalizedQrValue,
      );

      if (requestId !== qrValidationRequestRef.current) {
        return;
      }

      if (
        response?.success !== true ||
        typeof response.access_token !== "string" ||
        !response.access_token.trim()
      ) {
        throw new Error("Invalid QR validation response");
      }

      const sessionStartedAt = Date.now();
      const sessionTtlMilliseconds =
        kioskConfig.worker_session_ttl_seconds * 1000;

      const temporaryWorkerToken = response.access_token.trim();

      setWorkerToken(temporaryWorkerToken);
      setWorkerSessionStartedAt(sessionStartedAt);
      setWorkerSessionDeadline(sessionStartedAt + sessionTtlMilliseconds);
      setSelectedKioskAction(null);
      isLoadingInformation = true;
      setIsLoadingWorkerInfo(true);

      const companyResponse = await getCompanyInfo(
        normalizedApiUrl,
        temporaryWorkerToken,
      );

      if (requestId !== qrValidationRequestRef.current) {
        return;
      }

      if (
        companyResponse?.success !== true ||
        typeof companyResponse.data?.name !== "string" ||
        !companyResponse.data.name.trim()
      ) {
        throw new Error("Invalid company information response");
      }

      const userResponse = await getUserInfo(
        normalizedApiUrl,
        temporaryWorkerToken,
      );

      if (requestId !== qrValidationRequestRef.current) {
        return;
      }

      const firstname = userResponse?.data?.firstname;
      const lastname = userResponse?.data?.lastname;

      if (
        userResponse?.success !== true ||
        typeof firstname !== "string" ||
        typeof lastname !== "string" ||
        !`${firstname} ${lastname}`.trim()
      ) {
        throw new Error("Invalid worker information response");
      }

      const sanitizedUserInfo = {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        geolocal: userResponse.data.geolocal ?? null,
      };

      setCompanyInfo({ name: companyResponse.data.name.trim() });
      setUserInfo(sanitizedUserInfo);
      setGeoLocationPolicy(sanitizedUserInfo.geolocal);
      setKioskStep("actions");
    } catch (error) {
      if (requestId === qrValidationRequestRef.current) {
        setWorkerToken(null);
        setWorkerSessionStartedAt(null);
        setWorkerSessionDeadline(null);
        setCompanyInfo(null);
        setUserInfo(null);
        setGeoLocationPolicy(null);

        if (isLoadingInformation) {
          setWorkerInfoError(
            isUnauthorizedError(error)
              ? "La sesión temporal venció. Escanea nuevamente el código QR."
              : "No se pudo cargar la información del trabajador. Inténtalo de nuevo.",
          );
        } else {
          setQrError(
            "No se pudo validar el código QR. Verifícalo e inténtalo de nuevo.",
          );
        }
        setKioskStep("terminal");
      }
    } finally {
      if (requestId === qrValidationRequestRef.current) {
        isValidatingQrRef.current = false;
        setIsValidatingQr(false);
        setIsLoadingWorkerInfo(false);
      }
    }
  };

  const onActionPress = (action) => {
    setSelectedKioskAction(action);
    setKioskStep("confirmation");
  };

  const onReturnToTerminal = () => {
    resetWorkerSession();
    setKioskStep("terminal");
  };

  const onAnotherAction = () => {
    setSelectedKioskAction(null);
    setKioskStep("actions");
  };

  const hasWorkerSession = Boolean(
    workerToken &&
      workerSessionStartedAt !== null &&
      workerSessionDeadline !== null &&
      companyInfo &&
      userInfo,
  );

  const worker = userInfo
    ? {
        name: `${userInfo.firstname} ${userInfo.lastname}`.trim(),
        companyName: companyInfo?.name ?? "",
        geoLocationPolicy,
      }
    : null;

  if (kioskStep === "confirmation" && selectedKioskAction && hasWorkerSession) {
    return (
      <KioskConfirmationView
        action={selectedKioskAction}
        onAnotherAction={onAnotherAction}
        onReturnToTerminal={onReturnToTerminal}
        worker={worker}
      />
    );
  }

  if (kioskStep === "actions" && hasWorkerSession) {
    return (
      <KioskActionsView
        availableActions={SIMULATED_ACTIONS}
        onActionPress={onActionPress}
        onReturnToTerminal={onReturnToTerminal}
        worker={worker}
      />
    );
  }

  return (
    <KioskTerminalView
      isLoading={isKioskConfigLoading}
      kioskConfig={kioskConfig}
      kioskConfigError={kioskConfigError}
      isValidatingQr={isValidatingQr}
      isLoadingWorkerInfo={isLoadingWorkerInfo}
      onRetry={() => setKioskConfigRequest((request) => request + 1)}
      onQrValueChange={onQrValueChange}
      onWorkerIdentified={onWorkerIdentified}
      qrError={qrError}
      qrValue={qrValue}
      workerInfoError={workerInfoError}
    />
  );
};

export default KioskFlow;
