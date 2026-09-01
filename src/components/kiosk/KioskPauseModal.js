import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const KioskPauseModal = ({
  worker,
  motives,
  error,
  isSubmitting,
  idleSeconds,
  onInteraction,
  onCancel,
  onSubmit,
}) => {
  const [selectedMotive, setSelectedMotive] = useState("");
  const [description, setDescription] = useState("");

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/logo_small.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Iniciar pausa</Text>
      <Text style={styles.subtitle}>{worker.name}</Text>

      <View style={styles.card}>
        {motives.length > 0 ? (
          <>
            <Text style={styles.label}>Motivo de pausa *</Text>
            {motives.map((motive) => (
              <TouchableOpacity
                key={motive.value}
                disabled={isSubmitting}
                onPress={() => {
                  onInteraction();
                  setSelectedMotive(motive.value);
                }}
                style={[
                  styles.motive,
                  selectedMotive === motive.value && styles.selectedMotive,
                ]}
              >
                <Text style={styles.motiveText}>{motive.label}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          editable={!isSubmitting}
          multiline
          onChangeText={(value) => {
            onInteraction();
            setDescription(value);
          }}
          placeholder="Añade una observación"
          style={styles.input}
          value={description}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Text style={styles.idleTimer}>
        Inactividad: {String(Math.floor(idleSeconds / 60)).padStart(2, "0")}:
        {String(idleSeconds % 60).padStart(2, "0")}
      </Text>

      <TouchableOpacity
        disabled={isSubmitting}
        onPress={() => {
          onInteraction();
          onSubmit({ description, motivo_pausa: selectedMotive });
        }}
        style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
      >
        <Text style={styles.primaryText}>
          {isSubmitting ? "Registrando..." : "Confirmar pausa"}
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

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 18, paddingBottom: 28 },
  logo: { height: 58, resizeMode: "contain", width: 130 },
  title: {
    color: "#28231f",
    fontSize: 23,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: { color: "#756b63", fontSize: 15, marginTop: 6 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginTop: 20,
    maxWidth: 460,
    padding: 18,
    width: "100%",
  },
  label: {
    color: "#3a3028",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 8,
  },
  motive: {
    borderColor: "#eee2d7",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    padding: 13,
  },
  selectedMotive: { backgroundColor: "#fff4e8", borderColor: "#f7941e" },
  motiveText: { color: "#3a3028", fontSize: 14 },
  input: {
    borderColor: "#ded3ca",
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 80,
    padding: 12,
    textAlignVertical: "top",
  },
  error: { color: "#a33b2b", fontSize: 13, marginTop: 12 },
  idleTimer: { color: "#b9650a", fontWeight: "700", marginTop: 14 },
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

export default KioskPauseModal;
