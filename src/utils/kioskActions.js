const ACTION_DEFINITIONS = {
  ficharentrada: [
    {
      id: "start-shift",
      title: "Iniciar",
      description: "Inicia tu jornada laboral.",
      icon: "play",
      confirmationTitle: "Jornada iniciada",
      fichaje: "ficharentrada",
    },
  ],
  ficharpausa: [
    {
      id: "start-break",
      title: "Iniciar pausa",
      description: "Registra una pausa temporal en tu jornada.",
      icon: "pause",
      confirmationTitle: "Pausa iniciada",
      fichaje: "ficharpausa",
    },
    {
      id: "end-shift",
      title: "Finalizar jornada",
      description: "Finaliza tu jornada laboral del día de hoy.",
      icon: "stop",
      confirmationTitle: "Jornada finalizada",
      fichaje: "ficharsalida",
    },
  ],
  ficharreanudacion: [
    {
      id: "resume-shift",
      title: "Reanudar",
      description: "Reanuda tu jornada laboral.",
      icon: "play",
      confirmationTitle: "Jornada reanudada",
      fichaje: "ficharreanudacion",
    },
  ],
  ficharfirma: [
    {
      id: "sign-shift",
      title: "Firmar",
      description: "Firma el registro de tu jornada.",
      icon: "pencil",
      confirmationTitle: "Jornada firmada",
      fichaje: "ficharfirma",
    },
  ],
};

const normalizeMotives = (motives) => {
  if (!motives || typeof motives !== "object") return [];

  return Object.entries(motives).map(([value, motive]) => ({
    value,
    label: motive?.label ?? String(motive ?? value),
  }));
};

export const normalizeKioskShiftStatus = (data) => {
  if (!data || typeof data !== "object") {
    return { actions: [], motives: [], workDate: null };
  }

  const entries = [data.Entrada, data.Pausa, data.Reanudacion, data.Firma];

  return {
    actions: entries.flatMap(
      (entry) => ACTION_DEFINITIONS[entry?.action] ?? [],
    ),
    motives: normalizeMotives(data.Pausa?.motivos),
    workDate: data.date ?? null,
  };
};
