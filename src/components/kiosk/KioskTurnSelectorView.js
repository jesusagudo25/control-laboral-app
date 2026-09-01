import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@rneui/themed";

const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const getDailySchedule = (turn, date) => {
  if (!turn?.horario || !date) return turn;

  const parsedDate = new Date(`${date}T00:00:00`);
  return turn.horario[WEEK_DAYS[parsedDate.getDay()]] || turn;
};

const getTimeRanges = (turn, date) =>
  Object.values(getDailySchedule(turn, date) || {}).filter(
    (range) => range?.in && range?.out,
  );

const KioskTurnSelectorView = ({
  date,
  isSaving,
  idleSeconds,
  onInteraction,
  onConfirm,
  onReturnToTerminal,
  onSelectTurn,
  selectedTurn,
  turnError,
  turns,
  worker,
}) => (
  <View style={styles.container}>
    <Image
      source={require("../../../assets/logo_small.png")}
      style={styles.logo}
    />
    <Text style={styles.title}>Selecciona tu horario</Text>
    <Text style={styles.subtitle}>
      Tienes múltiples horarios asignados para esta jornada.
    </Text>
    <Text style={styles.workerName}>{worker.name}</Text>

    <View style={styles.turns}>
      {turns.map((turn) => {
        const isSelected = selectedTurn?.id === turn.id;
        const ranges = getTimeRanges(turn, date);
        const title = turn.titulo || `Horario ${turn.id}`;

        return (
          <TouchableOpacity
            accessibilityLabel={`Seleccionar ${title}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            activeOpacity={0.8}
            key={String(turn.id)}
            onPress={() => {
              onInteraction();
              onSelectTurn(turn);
            }}
            style={[styles.turnCard, isSelected && styles.selectedTurnCard]}
          >
            <View style={styles.turnContent}>
              <Text style={styles.turnTitle}>{title}</Text>
              {ranges.map((range, index) => (
                <Text
                  key={`${range.in}-${range.out}-${index}`}
                  style={styles.range}
                >
                  {range.in} - {range.out}
                </Text>
              ))}
            </View>
            <Icon
              color={isSelected ? "#f7941e" : "#b8ada4"}
              name={isSelected ? "check-circle" : "circle-o"}
              size={21}
              type="font-awesome"
            />
          </TouchableOpacity>
        );
      })}
    </View>

    {turns.length === 0 && (
      <Text accessibilityRole="alert" style={styles.error}>
        No hay horarios válidos disponibles para seleccionar.
      </Text>
    )}
    {!!turnError && (
      <Text accessibilityRole="alert" style={styles.error}>
        {turnError}
      </Text>
    )}

    <TouchableOpacity
      accessibilityLabel="Confirmar horario seleccionado"
      accessibilityRole="button"
      disabled={isSaving || !selectedTurn}
      onPress={() => {
        onInteraction();
        onConfirm();
      }}
      style={[
        styles.confirmButton,
        (isSaving || !selectedTurn) && styles.disabledButton,
      ]}
    >
      {isSaving ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.confirmText}>Confirmar horario</Text>
      )}
    </TouchableOpacity>

    <Text style={styles.idleTimer}>
      Inactividad: {String(Math.floor(idleSeconds / 60)).padStart(2, "0")}:
      {String(idleSeconds % 60).padStart(2, "0")}
    </Text>

    <TouchableOpacity onPress={onReturnToTerminal} style={styles.returnButton}>
      <Icon name="arrow-left" type="font-awesome" color="#9b5a16" size={13} />
      <Text style={styles.returnText}>Volver a la terminal</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 18, paddingBottom: 28 },
  logo: { height: 58, resizeMode: "contain", width: 130 },
  title: { color: "#28231f", fontSize: 23, fontWeight: "700", marginTop: 2 },
  subtitle: { color: "#756b63", marginTop: 7, textAlign: "center" },
  workerName: {
    color: "#28231f",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 18,
  },
  turns: { marginTop: 10, maxWidth: 460, width: "100%" },
  turnCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eee2d7",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 16,
  },
  selectedTurnCard: { backgroundColor: "#fff8ef", borderColor: "#f7941e" },
  turnContent: { flex: 1 },
  turnTitle: { color: "#28231f", fontSize: 16, fontWeight: "700" },
  range: { color: "#756b63", fontSize: 14, marginTop: 5 },
  error: { color: "#a53a2a", marginTop: 12, textAlign: "center" },
  confirmButton: {
    alignItems: "center",
    backgroundColor: "#f7941e",
    borderRadius: 10,
    marginTop: 20,
    maxWidth: 460,
    padding: 14,
    width: "100%",
  },
  disabledButton: { opacity: 0.5 },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  idleTimer: { color: "#b9650a", fontWeight: "700", marginTop: 14 },
  returnButton: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 18,
    padding: 8,
  },
  returnText: {
    color: "#9b5a16",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 7,
  },
});

export default KioskTurnSelectorView;
