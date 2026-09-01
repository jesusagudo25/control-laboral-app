import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/themed";

const formatDateTime = (date) =>
  `${date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })} · ${date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    safeSeconds % 60,
  ).padStart(2, "0")}`;
};

const DetailRow = ({ label, value, last }) => (
  <View style={[styles.detailRow, last && styles.lastDetailRow]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const KioskConfirmationView = ({
  worker,
  action,
  result,
  confirmationSeconds,
  onReturnToTerminal,
  onAnotherAction,
}) => {
  const registeredAt = React.useMemo(() => {
    const resultDate = result?.data?.datetime || result?.data?.date;
    const parsedDate = resultDate ? new Date(resultDate) : new Date();
    return formatDateTime(
      Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
    );
  }, [result]);
  const resultMessage = result?.msg || result?.message;

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/logo_small.png")}
        style={styles.logo}
      />
      <View style={styles.successIcon}>
        <Icon name="check" type="font-awesome" color="#ffffff" size={38} />
      </View>
      <Text style={styles.title}>Marcación registrada</Text>
      <Text style={styles.subtitle}>Tu acción se registró correctamente.</Text>
      {resultMessage ? (
        <Text style={styles.resultMessage}>{resultMessage}</Text>
      ) : null}

      <View style={styles.detailCard}>
        <DetailRow label="Trabajador" value={worker.name} />
        <DetailRow label="Acción realizada" value={action.confirmationTitle} />
        <DetailRow label="Fecha y hora" value={registeredAt} last />
      </View>

      <View style={styles.returnCard}>
        <View style={styles.returnIcon}>
          <Icon name="clock-o" type="font-awesome" color="#f7941e" size={21} />
        </View>
        <View style={styles.returnContent}>
          <Text style={styles.returnTitle}>
            Volviendo a la pantalla inicial en
          </Text>
          <Text style={styles.returnHint}>La sesión temporal se cerrará</Text>
        </View>
        <Text style={styles.timer}>{formatCountdown(confirmationSeconds)}</Text>
      </View>

      <TouchableOpacity
        accessibilityLabel="Realizar otra acción"
        accessibilityRole="button"
        activeOpacity={0.85}
        onPress={onAnotherAction}
        style={styles.primaryButton}
      >
        <Icon name="repeat" type="font-awesome" color="#ffffff" size={16} />
        <Text style={styles.primaryButtonText}>Realizar otra acción</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Icon name="users" type="font-awesome" color="#f7941e" size={21} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Terminal compartida</Text>
          <Text style={styles.infoText}>
            Este dispositivo es de uso compartido. No se almacena información
            personal.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityLabel="Volver a la terminal de fichaje"
        accessibilityRole="button"
        onPress={onReturnToTerminal}
        style={styles.terminalButton}
      >
        <Icon name="arrow-left" type="font-awesome" color="#9b5a16" size={13} />
        <Text style={styles.terminalButtonText}>Volver a la terminal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 18, paddingBottom: 28 },
  logo: { height: 58, resizeMode: "contain", width: 130 },
  successIcon: {
    alignItems: "center",
    backgroundColor: "#48a864",
    borderRadius: 42,
    elevation: 3,
    height: 76,
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#246b38",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: 76,
  },
  title: { color: "#28231f", fontSize: 23, fontWeight: "700", marginTop: 16 },
  subtitle: {
    color: "#756b63",
    fontSize: 15,
    marginTop: 7,
    textAlign: "center",
  },
  resultMessage: {
    color: "#3e744b",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    elevation: 3,
    marginTop: 20,
    maxWidth: 460,
    paddingHorizontal: 18,
    shadowColor: "#613814",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    width: "100%",
  },
  detailRow: {
    borderBottomColor: "#eee2d7",
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  lastDetailRow: { borderBottomWidth: 0 },
  detailLabel: {
    color: "#8a7e75",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
  },
  detailValue: { color: "#28231f", fontSize: 16, fontWeight: "700" },
  returnCard: {
    alignItems: "center",
    backgroundColor: "#fff8ef",
    borderColor: "#f8d8b1",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    maxWidth: 460,
    padding: 15,
    width: "100%",
  },
  returnIcon: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  returnContent: { flex: 1, marginHorizontal: 11 },
  returnTitle: { color: "#3a3028", fontSize: 13, fontWeight: "700" },
  returnHint: { color: "#8a7e75", fontSize: 11, marginTop: 3 },
  timer: { color: "#b9650a", fontSize: 18, fontWeight: "700" },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#f7941e",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    maxWidth: 460,
    padding: 15,
    width: "100%",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 9,
  },
  infoCard: {
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 13,
    flexDirection: "row",
    marginTop: 14,
    maxWidth: 460,
    padding: 16,
    width: "100%",
  },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { color: "#3a3028", fontSize: 15, fontWeight: "700" },
  infoText: { color: "#756b63", fontSize: 13, lineHeight: 19, marginTop: 4 },
  terminalButton: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
    padding: 8,
  },
  terminalButtonText: {
    color: "#9b5a16",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 7,
  },
});

export default KioskConfirmationView;
