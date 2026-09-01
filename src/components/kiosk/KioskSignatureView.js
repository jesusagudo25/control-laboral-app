import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

const KioskSignatureView = ({
  worker,
  error,
  isSubmitting,
  idleSeconds,
  onInteraction,
  onCancel,
  onSubmit,
}) => {
  const signatureRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/logo_small.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Firmar jornada</Text>
      <Text style={styles.subtitle}>{worker.name}</Text>
      <View style={styles.canvasCard}>
        <SignatureCanvas
          ref={signatureRef}
          clearText="Limpiar"
          confirmText="Confirmar"
          descriptionText="Dibuja tu firma"
          onBegin={onInteraction}
          onEmpty={() =>
            setLocalError("La firma es obligatoria para continuar.")
          }
          onOK={(signature) => {
            setLocalError(null);
            onSubmit(signature);
          }}
          webStyle={signatureWebStyle}
        />
      </View>
      {localError || error ? (
        <Text style={styles.error}>{localError || error}</Text>
      ) : null}
      <Text style={styles.idleTimer}>
        Inactividad: {String(Math.floor(idleSeconds / 60)).padStart(2, "0")}:
        {String(idleSeconds % 60).padStart(2, "0")}
      </Text>
      <TouchableOpacity
        disabled={isSubmitting}
        onPress={() => {
          onInteraction();
          signatureRef.current?.readSignature();
        }}
        style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
      >
        <Text style={styles.primaryText}>
          {isSubmitting ? "Registrando..." : "Guardar firma"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={isSubmitting}
        onPress={onCancel}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const signatureWebStyle = `
  .m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--footer { display: none; }
  body, html { width: 100%; height: 100%; margin: 0; padding: 0; }
`;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    padding: 18,
    paddingBottom: 28,
  },
  logo: { height: 58, resizeMode: "contain", width: 130 },
  title: {
    color: "#28231f",
    fontSize: 23,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: { color: "#756b63", fontSize: 15, marginTop: 6 },
  canvasCard: {
    backgroundColor: "#fff",
    borderColor: "#eee2d7",
    borderRadius: 15,
    borderWidth: 1,
    height: 280,
    marginTop: 18,
    maxWidth: 460,
    overflow: "hidden",
    width: "100%",
  },
  error: { color: "#a33b2b", fontSize: 13, marginTop: 12 },
  idleTimer: { color: "#b9650a", fontWeight: "700", marginTop: 12 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#f7941e",
    borderRadius: 12,
    marginTop: 14,
    maxWidth: 460,
    padding: 15,
    width: "100%",
  },
  disabledButton: { opacity: 0.6 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelButton: { marginTop: 10, padding: 10 },
  cancelText: { color: "#9b5a16", fontSize: 14, fontWeight: "700" },
});

export default KioskSignatureView;
