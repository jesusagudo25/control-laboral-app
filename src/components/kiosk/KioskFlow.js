import React, { useEffect, useRef, useState } from "react";
import useApi from "../../hooks/useApi";
import useKioskLocation from "../../hooks/useKioskLocation";
import {
  getCompanyInfo,
  getKioskConfig,
  getKioskShiftStatus,
  getUserInfo,
  getUserTurn,
  selectUserTurn,
  submitKioskFichaje,
  validateKioskQr,
} from "../../services/kioskApi";
import { normalizeKioskShiftStatus } from "../../utils/kioskActions";
import KioskActionsView from "./KioskActionsView";
import KioskConfirmationView from "./KioskConfirmationView";
import KioskPauseModal from "./KioskPauseModal";
import KioskSignatureView from "./KioskSignatureView";
import KioskTerminalView from "./KioskTerminalView";
import KioskTurnSelectorView from "./KioskTurnSelectorView";

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

const normalizeTurnOptions = (turns) => {
  if (Array.isArray(turns)) {
    return turns.map((turn, index) => ({
      ...turn,
      id: turn?.id ?? turn?.idHorarioM ?? String(index),
    }));
  }

  if (turns && typeof turns === "object") {
    return Object.entries(turns).map(([id, turn]) => ({ ...turn, id }));
  }

  return [];
};

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
  const [dateUserTurn, setDateUserTurn] = useState(null);
  const [isMultipleTurn, setIsMultipleTurn] = useState(false);
  const [turnOptions, setTurnOptions] = useState([]);
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [isSavingTurn, setIsSavingTurn] = useState(false);
  const [turnError, setTurnError] = useState(null);
  const [isLoadingUserTurn, setIsLoadingUserTurn] = useState(false);
  const [kioskActions, setKioskActions] = useState([]);
  const [kioskMotives, setKioskMotives] = useState([]);
  const [kioskWorkDate, setKioskWorkDate] = useState(null);
  const [isLoadingShiftStatus, setIsLoadingShiftStatus] = useState(false);
  const [shiftStatusError, setShiftStatusError] = useState(null);
  const [isSubmittingFichaje, setIsSubmittingFichaje] = useState(false);
  const [fichajeError, setFichajeError] = useState(null);
  const [fichajeResult, setFichajeResult] = useState(null);
  const [pendingFichajeData, setPendingFichajeData] = useState(null);
  const isValidatingQrRef = useRef(false);
  const isSubmittingFichajeRef = useRef(false);
  const qrValidationRequestRef = useRef(0);
  const { location, locationError, isLoadingLocation } = useKioskLocation(
    geoLocationPolicy,
    Boolean(workerToken && userInfo),
  );

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
    setDateUserTurn(null);
    setIsMultipleTurn(false);
    setTurnOptions([]);
    setSelectedTurn(null);
    setIsSavingTurn(false);
    setTurnError(null);
    setIsLoadingUserTurn(false);
    setKioskActions([]);
    setKioskMotives([]);
    setKioskWorkDate(null);
    setIsLoadingShiftStatus(false);
    setShiftStatusError(null);
    setSelectedKioskAction(null);
    isSubmittingFichajeRef.current = false;
    setIsSubmittingFichaje(false);
    setFichajeError(null);
    setFichajeResult(null);
    setPendingFichajeData(null);
  };

  const loadKioskShiftStatus = async (normalizedApiUrl, token, requestId) => {
    setKioskStep("actions");
    setIsLoadingShiftStatus(true);
    setShiftStatusError(null);
    setKioskActions([]);
    setKioskMotives([]);
    setKioskWorkDate(null);

    try {
      const response = await getKioskShiftStatus(normalizedApiUrl, token);

      if (requestId !== qrValidationRequestRef.current) return;

      if (response?.success !== true || !response.data) {
        throw new Error("Invalid kiosk shift status response");
      }

      const normalizedStatus = normalizeKioskShiftStatus(response.data);
      setKioskActions(normalizedStatus.actions);
      setKioskMotives(normalizedStatus.motives);
      setKioskWorkDate(normalizedStatus.workDate);
    } catch (error) {
      if (requestId === qrValidationRequestRef.current) {
        setShiftStatusError(
          isUnauthorizedError(error)
            ? "La sesión temporal venció. Vuelve a la terminal y escanea el QR nuevamente."
            : "No se pudieron cargar las acciones disponibles. Inténtalo de nuevo.",
        );
      }
    } finally {
      if (requestId === qrValidationRequestRef.current) {
        setIsLoadingShiftStatus(false);
      }
    }
  };

  const onQrValueChange = (value) => {
    setQrValue(value);
    setQrError(null);
    setWorkerInfoError(null);
    setTurnError(null);
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
    let isLoadingTurnInformation = false;

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
      isLoadingTurnInformation = true;
      setIsLoadingUserTurn(true);

      const turnResponse = await getUserTurn(
        normalizedApiUrl,
        temporaryWorkerToken,
      );

      if (requestId !== qrValidationRequestRef.current) {
        return;
      }

      if (turnResponse?.success !== true || !turnResponse.data) {
        throw new Error("Invalid user turn response");
      }

      const turnDate = turnResponse.data.date ?? null;
      const hasMultipleTurns = turnResponse.data.multiples === true;

      setDateUserTurn(turnDate);
      setIsMultipleTurn(hasMultipleTurns);
      setTurnOptions(normalizeTurnOptions(turnResponse.data.horarios));
      setSelectedTurn(null);
      if (hasMultipleTurns) {
        setKioskStep("turn-selector");
      } else {
        await loadKioskShiftStatus(
          normalizedApiUrl,
          temporaryWorkerToken,
          requestId,
        );
      }
    } catch (error) {
      if (requestId === qrValidationRequestRef.current) {
        setWorkerToken(null);
        setWorkerSessionStartedAt(null);
        setWorkerSessionDeadline(null);
        setCompanyInfo(null);
        setUserInfo(null);
        setGeoLocationPolicy(null);
        setDateUserTurn(null);
        setIsMultipleTurn(false);
        setTurnOptions([]);
        setSelectedTurn(null);

        if (isLoadingInformation) {
          const errorMessage = isUnauthorizedError(error)
            ? "La sesión temporal venció. Escanea nuevamente el código QR."
            : isLoadingTurnInformation
              ? "No se pudieron cargar los horarios del trabajador. Inténtalo de nuevo."
              : "No se pudo cargar la información del trabajador. Inténtalo de nuevo.";

          setWorkerInfoError(errorMessage);
          if (isLoadingTurnInformation) setTurnError(errorMessage);
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
        setIsLoadingUserTurn(false);
      }
    }
  };

  const onSelectTurn = (turn) => {
    setSelectedTurn(turn);
    setTurnError(null);
  };

  const onConfirmTurn = async () => {
    if (!selectedTurn || isSavingTurn) {
      setTurnError("Selecciona un horario para continuar.");
      return;
    }

    try {
      setIsSavingTurn(true);
      setTurnError(null);
      const response = await selectUserTurn(apiUrl, workerToken, {
        action: "user_turn",
        date: dateUserTurn,
        idHorarioM: selectedTurn.id,
      });

      if (response?.success !== true) {
        setTurnError(
          response?.msg || "No se pudo guardar el horario seleccionado.",
        );
        return;
      }

      await loadKioskShiftStatus(
        normalizeApiUrl(apiUrl),
        workerToken,
        qrValidationRequestRef.current,
      );
    } catch (error) {
      setTurnError(
        isUnauthorizedError(error)
          ? "La sesión temporal venció. Vuelve a la terminal y escanea el QR nuevamente."
          : "No se pudo guardar el horario seleccionado. Inténtalo de nuevo.",
      );
    } finally {
      setIsSavingTurn(false);
    }
  };

  const handleSubmitKioskFichaje = async (action, extraData = {}) => {
    if (isSubmittingFichajeRef.current) return;

    const workDate = kioskWorkDate || dateUserTurn;

    if (!workDate) {
      setFichajeError("No se pudo determinar la fecha de la jornada.");
      return;
    }

    if (!location || isLoadingLocation) {
      setFichajeError(
        locationError || "La ubicación todavía no está preparada.",
      );
      return;
    }

    if (
      action.fichaje === "ficharpausa" &&
      kioskMotives.length > 0 &&
      !extraData.motivo_pausa
    ) {
      setFichajeError("Selecciona un motivo de pausa para continuar.");
      return;
    }

    if (action.fichaje === "ficharfirma" && !extraData.signature) {
      setFichajeError("La firma es obligatoria para continuar.");
      return;
    }

    const payload = {
      action: "kiosk_fichaje",
      date: workDate,
      fichaje: action.fichaje,
      description: extraData.description?.trim() || "",
      motivo_pausa: extraData.motivo_pausa || "",
      long: location.longitude,
      lat: location.latitude,
      signature: extraData.signature || "",
    };

    setSelectedKioskAction(action);
    setPendingFichajeData(extraData);
    setFichajeError(null);
    isSubmittingFichajeRef.current = true;
    setIsSubmittingFichaje(true);

    try {
      const response = await submitKioskFichaje(apiUrl, workerToken, payload);

      if (response?.success !== true) {
        setFichajeError(
          response?.msg ||
            response?.message ||
            "No se pudo registrar la acción.",
        );
        return;
      }

      setFichajeResult(response);
      setKioskStep("confirmation");
    } catch (error) {
      setFichajeError(
        isUnauthorizedError(error)
          ? "La sesión temporal venció. Vuelve a la terminal y escanea el QR nuevamente."
          : "No se pudo registrar la acción. Comprueba la conexión e inténtalo de nuevo.",
      );
    } finally {
      isSubmittingFichajeRef.current = false;
      setIsSubmittingFichaje(false);
    }
  };

  const onActionPress = (action) => {
    setSelectedKioskAction(action);
    setFichajeError(null);
    setPendingFichajeData(null);

    if (action.fichaje === "ficharpausa") {
      setKioskStep("pause");
      return;
    }

    if (action.fichaje === "ficharfirma") {
      setKioskStep("signature");
      return;
    }

    handleSubmitKioskFichaje(action);
  };

  const onReturnToTerminal = () => {
    resetWorkerSession();
    setKioskStep("terminal");
  };

  const onAnotherAction = () => {
    setSelectedKioskAction(null);
    setFichajeError(null);
    setFichajeResult(null);
    setPendingFichajeData(null);
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

  if (kioskStep === "turn-selector" && hasWorkerSession && isMultipleTurn) {
    return (
      <KioskTurnSelectorView
        date={dateUserTurn}
        isSaving={isSavingTurn}
        onConfirm={onConfirmTurn}
        onReturnToTerminal={onReturnToTerminal}
        onSelectTurn={onSelectTurn}
        selectedTurn={selectedTurn}
        turnError={turnError}
        turns={turnOptions}
        worker={worker}
      />
    );
  }

  if (
    kioskStep === "confirmation" &&
    selectedKioskAction &&
    fichajeResult &&
    hasWorkerSession
  ) {
    return (
      <KioskConfirmationView
        action={selectedKioskAction}
        result={fichajeResult}
        onAnotherAction={onAnotherAction}
        onReturnToTerminal={onReturnToTerminal}
        worker={worker}
      />
    );
  }

  if (kioskStep === "pause" && selectedKioskAction && hasWorkerSession) {
    return (
      <KioskPauseModal
        error={fichajeError}
        isSubmitting={isSubmittingFichaje}
        motives={kioskMotives}
        onCancel={onAnotherAction}
        onSubmit={(data) => handleSubmitKioskFichaje(selectedKioskAction, data)}
        worker={worker}
      />
    );
  }

  if (kioskStep === "signature" && selectedKioskAction && hasWorkerSession) {
    return (
      <KioskSignatureView
        error={fichajeError}
        isSubmitting={isSubmittingFichaje}
        onCancel={onAnotherAction}
        onSubmit={(signature) =>
          handleSubmitKioskFichaje(selectedKioskAction, { signature })
        }
        worker={worker}
      />
    );
  }

  if (kioskStep === "actions" && hasWorkerSession) {
    return (
      <KioskActionsView
        availableActions={kioskActions}
        fichajeError={fichajeError}
        isLoading={isLoadingShiftStatus}
        isLoadingLocation={isLoadingLocation}
        isSubmittingFichaje={isSubmittingFichaje}
        location={location}
        locationError={locationError}
        motives={kioskMotives}
        onActionPress={onActionPress}
        onRetry={() =>
          loadKioskShiftStatus(
            normalizeApiUrl(apiUrl),
            workerToken,
            qrValidationRequestRef.current,
          )
        }
        onRetryFichaje={() =>
          handleSubmitKioskFichaje(
            selectedKioskAction,
            pendingFichajeData || {},
          )
        }
        onReturnToTerminal={onReturnToTerminal}
        shiftStatusError={shiftStatusError}
        workDate={kioskWorkDate}
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
      isLoadingUserTurn={isLoadingUserTurn}
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
