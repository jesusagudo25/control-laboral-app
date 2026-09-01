import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import { getKioskConfig } from "../../services/kioskApi";
import KioskActionsView from "./KioskActionsView";
import KioskConfirmationView from "./KioskConfirmationView";
import KioskTerminalView from "./KioskTerminalView";

const SIMULATED_WORKER = {
  name: "Juan Pérez",
  detail: "Operario · ROMESUR",
  status: "Jornada activa",
};

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

const KioskFlow = ({ onOperationalStateChange }) => {
  const { apiUrl } = useApi();
  const [kioskStep, setKioskStep] = useState("terminal");
  const [selectedKioskAction, setSelectedKioskAction] = useState(null);
  const [kioskConfig, setKioskConfig] = useState(null);
  const [isKioskConfigLoading, setIsKioskConfigLoading] = useState(false);
  const [kioskConfigError, setKioskConfigError] = useState(null);
  const [kioskConfigRequest, setKioskConfigRequest] = useState(0);

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
      onOperationalStateChange?.(false);
    },
    [onOperationalStateChange],
  );

  const onWorkerIdentified = () => {
    setSelectedKioskAction(null);
    setKioskStep("actions");
  };

  const onActionPress = (action) => {
    setSelectedKioskAction(action);
    setKioskStep("confirmation");
  };

  const onReturnToTerminal = () => {
    setSelectedKioskAction(null);
    setKioskStep("terminal");
  };

  const onAnotherAction = () => {
    setSelectedKioskAction(null);
    setKioskStep("actions");
  };

  if (kioskStep === "confirmation" && selectedKioskAction) {
    return (
      <KioskConfirmationView
        action={selectedKioskAction}
        onAnotherAction={onAnotherAction}
        onReturnToTerminal={onReturnToTerminal}
        worker={SIMULATED_WORKER}
      />
    );
  }

  if (kioskStep === "actions") {
    return (
      <KioskActionsView
        availableActions={SIMULATED_ACTIONS}
        onActionPress={onActionPress}
        onReturnToTerminal={onReturnToTerminal}
        worker={SIMULATED_WORKER}
      />
    );
  }

  return (
    <KioskTerminalView
      isLoading={isKioskConfigLoading}
      kioskConfig={kioskConfig}
      kioskConfigError={kioskConfigError}
      onRetry={() => setKioskConfigRequest((request) => request + 1)}
      onWorkerIdentified={onWorkerIdentified}
    />
  );
};

export default KioskFlow;
