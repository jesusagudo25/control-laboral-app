import React, { useEffect, useState } from "react";
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

const KioskFlow = ({ onOperationalStateChange }) => {
  const [kioskStep, setKioskStep] = useState("terminal");
  const [selectedKioskAction, setSelectedKioskAction] = useState(null);

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

  return <KioskTerminalView onWorkerIdentified={onWorkerIdentified} />;
};

export default KioskFlow;
