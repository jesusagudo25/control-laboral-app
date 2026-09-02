import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@rneui/themed";
import KioskQrScannerView from "./KioskQrScannerView";

const KioskTerminalView = ({
  isLoading,
  kioskConfig,
  kioskConfigError,
  isValidatingQr,
  isLoadingWorkerInfo,
  isLoadingUserTurn,
  onRetry,
  onQrScanned,
  onQrValueChange,
  onWorkerIdentified,
  qrError,
  qrValue,
  workerInfoError,
}) => (
  <View style={styles.container}>
    <Image
      source={require("../../../assets/logo_small.png")}
      style={styles.logo}
    />
    <Text style={styles.title}>Terminal de fichaje</Text>
    {isLoading && (
      <View style={styles.stateCard}>
        <ActivityIndicator color="#f7941e" size="large" />
        <Text style={styles.stateTitle}>Cargando modo kiosco...</Text>
      </View>
    )}
    {!isLoading && kioskConfigError && (
      <View style={styles.stateCard}>
        <Icon
          name="exclamation-circle"
          type="font-awesome"
          color="#b9650a"
          size={36}
        />
        <Text style={styles.stateTitle}>No se pudo iniciar la terminal</Text>
        <Text style={styles.stateText}>{kioskConfigError}</Text>
        <TouchableOpacity
          accessibilityLabel="Reintentar carga del modo kiosco"
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )}
    {!isLoading && !kioskConfigError && kioskConfig?.enabled === false && (
      <View style={styles.stateCard}>
        <Icon name="ban" type="font-awesome" color="#b9650a" size={36} />
        <Text style={styles.stateTitle}>Modo kiosco no disponible</Text>
        <Text style={styles.stateText}>
          La terminal está deshabilitada en la configuración actual.
        </Text>
      </View>
    )}
    {kioskConfig?.enabled === true && (
      <>
        <Text style={styles.subtitle}>
          Escanea tu código QR para registrar tu jornada
        </Text>

        <View
          style={[
            styles.card,
            (isValidatingQr || isLoadingWorkerInfo || isLoadingUserTurn) &&
              styles.cardDisabled,
          ]}
        >
          <KioskQrScannerView
            disabled={
              isValidatingQr || isLoadingWorkerInfo || isLoadingUserTurn
            }
            onQrScanned={onQrScanned}
          />
          <Text style={styles.scanTitle}>
            Acerque su código QR a la cámara frontal
          </Text>
          <Text style={styles.scanText}>
            Mantenga el código dentro del recuadro
          </Text>
          {__DEV__ && (
            <TextInput
              accessibilityLabel="Código QR simulado"
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !isValidatingQr && !isLoadingWorkerInfo && !isLoadingUserTurn
              }
              onChangeText={onQrValueChange}
              onSubmitEditing={onWorkerIdentified}
              placeholder="Introduce un QR de prueba"
              returnKeyType="done"
              style={styles.qrInput}
              value={qrValue}
            />
          )}
          {isLoadingUserTurn ? (
            <View style={styles.validationState}>
              <ActivityIndicator color="#f7941e" size="small" />
              <Text style={styles.validationText}>Cargando horarios...</Text>
            </View>
          ) : isLoadingWorkerInfo ? (
            <View style={styles.validationState}>
              <ActivityIndicator color="#f7941e" size="small" />
              <Text style={styles.validationText}>
                Cargando información del trabajador...
              </Text>
            </View>
          ) : isValidatingQr ? (
            <View style={styles.validationState}>
              <ActivityIndicator color="#f7941e" size="small" />
              <Text style={styles.validationText}>Validando QR...</Text>
            </View>
          ) : __DEV__ ? (
            <TouchableOpacity
              accessibilityHint="Valida el código QR introducido"
              accessibilityLabel="Simular lectura de código QR"
              accessibilityRole="button"
              onPress={onWorkerIdentified}
              style={styles.simulationButton}
            >
              <Text style={styles.simulationText}>SIMULAR LECTURA QR</Text>
            </TouchableOpacity>
          ) : null}
          {!!qrError && (
            <Text accessibilityRole="alert" style={styles.qrError}>
              {qrError}
            </Text>
          )}
          {!!workerInfoError && (
            <Text accessibilityRole="alert" style={styles.qrError}>
              {workerInfoError}
            </Text>
          )}
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
            <Text style={styles.infoTitle}>
              Retorno automático por inactividad
            </Text>
            <Text style={styles.infoText}>
              La sesión se cerrará en {kioskConfig.idle_timeout_seconds}{" "}
              segundos sin uso.
            </Text>
          </View>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Activo</Text>
          </View>
        </View>
      </>
    )}
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
  stateCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    marginTop: 22,
    maxWidth: 460,
    padding: 24,
    width: "100%",
  },
  stateTitle: {
    color: "#28231f",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },
  stateText: {
    color: "#756b63",
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#f7941e",
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
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
  cardDisabled: { opacity: 0.7 },
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
  simulationText: {
    color: "#b9650a",
    fontSize: 12,
    fontWeight: "700",
  },
  simulationButton: { marginTop: 12, padding: 8 },
  qrInput: {
    backgroundColor: "#fffaf5",
    borderColor: "#e8c49c",
    borderRadius: 10,
    borderWidth: 1,
    color: "#28231f",
    marginTop: 16,
    maxWidth: 340,
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: "100%",
  },
  validationState: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  validationText: {
    color: "#b9650a",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },
  qrError: {
    color: "#a53a2a",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
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
