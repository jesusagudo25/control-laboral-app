import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Icon } from "@rneui/themed";

const Corner = ({ position }) => (
  <View style={[styles.corner, styles[position]]} />
);

const KioskTerminalView = () => (
  <View style={styles.container}>
    <Image
      source={require("../../../assets/logo_small.png")}
      style={styles.logo}
    />
    <Text style={styles.title}>Terminal de fichaje</Text>
    <Text style={styles.subtitle}>
      Escanea tu código QR para registrar tu jornada
    </Text>

    <View style={styles.card}>
      <View style={styles.scanner}>
        <Corner position="topLeft" />
        <Corner position="topRight" />
        <Corner position="bottomLeft" />
        <Corner position="bottomRight" />
        <View style={styles.cameraCircle}>
          <Icon name="camera" type="font-awesome" color="#f7941e" size={36} />
        </View>
      </View>
      <Text style={styles.scanTitle}>Acerca tu código QR</Text>
      <Text style={styles.scanText}>
        Colócalo frente a la cámara para registrar tu entrada o salida.
      </Text>
    </View>

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

    <View style={styles.footerCard}>
      <View style={styles.footerText}>
        <Text style={styles.infoTitle}>Retorno automático por inactividad</Text>
        <Text style={styles.infoText}>
          La sesión se cerrará en 60 segundos sin uso.
        </Text>
      </View>
      <View style={styles.status}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Activo</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 18, paddingBottom: 28 },
  logo: { height: 58, resizeMode: "contain", width: 130 },
  title: { color: "#28231f", fontSize: 23, fontWeight: "700", marginTop: 2 },
  subtitle: {
    color: "#756b63",
    fontSize: 15,
    marginTop: 7,
    textAlign: "center",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    elevation: 4,
    marginTop: 18,
    maxWidth: 460,
    padding: 20,
    shadowColor: "#613814",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    width: "100%",
  },
  scanner: {
    alignItems: "center",
    height: 166,
    justifyContent: "center",
    width: 166,
  },
  cameraCircle: {
    alignItems: "center",
    backgroundColor: "#fff4e8",
    borderRadius: 40,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  corner: {
    borderColor: "#f7941e",
    height: 34,
    position: "absolute",
    width: 34,
  },
  topLeft: { borderLeftWidth: 4, borderTopWidth: 4, left: 0, top: 0 },
  topRight: { borderRightWidth: 4, borderTopWidth: 4, right: 0, top: 0 },
  bottomLeft: { borderBottomWidth: 4, borderLeftWidth: 4, bottom: 0, left: 0 },
  bottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 0,
    right: 0,
  },
  scanTitle: {
    color: "#28231f",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 16,
  },
  scanText: {
    color: "#756b63",
    lineHeight: 21,
    marginTop: 7,
    textAlign: "center",
  },
  infoCard: {
    alignItems: "flex-start",
    backgroundColor: "#fff8ef",
    borderColor: "#f8d8b1",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 18,
    maxWidth: 460,
    padding: 16,
    width: "100%",
  },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { color: "#3a3028", fontSize: 15, fontWeight: "700" },
  infoText: { color: "#756b63", fontSize: 13, lineHeight: 19, marginTop: 4 },
  footerCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 13,
    flexDirection: "row",
    marginTop: 12,
    maxWidth: 460,
    padding: 16,
    width: "100%",
  },
  footerText: { flex: 1, paddingRight: 10 },
  status: {
    alignItems: "center",
    backgroundColor: "#eaf7ed",
    borderRadius: 14,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    backgroundColor: "#3fa85c",
    borderRadius: 4,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  statusText: { color: "#26763c", fontSize: 12, fontWeight: "700" },
});

export default KioskTerminalView;
