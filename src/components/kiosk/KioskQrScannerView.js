import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const KioskQrScannerView = ({ disabled, onQrScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [facing, setFacing] = useState("front");
  const cameraActiveRef = useRef(false);
  const hasScannedRef = useRef(false);
  const isSwitchingCameraRef = useRef(false);

  const stopCamera = () => {
    cameraActiveRef.current = false;
    hasScannedRef.current = false;
    isSwitchingCameraRef.current = false;
    setIsCameraActive(false);
    setPermissionError(null);
  };

  useEffect(() => {
    if (disabled) stopCamera();
  }, [disabled]);

  useEffect(
    () => () => {
      cameraActiveRef.current = false;
    },
    [],
  );

  const startCamera = async () => {
    if (disabled || cameraActiveRef.current) return;

    cameraActiveRef.current = true;
    hasScannedRef.current = false;
    isSwitchingCameraRef.current = true;
    setFacing("front");
    setPermissionError(null);
    try {
      const result = permission?.granted
        ? permission
        : await requestPermission();
      if (!cameraActiveRef.current) return;
      if (result.granted) {
        setIsCameraActive(true);
      } else {
        cameraActiveRef.current = false;
        setPermissionError(
          "Se necesita permiso de cámara para escanear el código QR.",
        );
      }
    } catch {
      if (!cameraActiveRef.current) return;
      cameraActiveRef.current = false;
      setPermissionError(
        "No se pudo solicitar permiso de cámara. Inténtalo de nuevo.",
      );
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (
      disabled ||
      !cameraActiveRef.current ||
      isSwitchingCameraRef.current ||
      hasScannedRef.current ||
      typeof data !== "string"
    )
      return;

    const qrValue = data.trim();
    if (!qrValue) return;

    hasScannedRef.current = true;
    cameraActiveRef.current = false;
    setIsCameraActive(false);
    onQrScanned(qrValue);
  };

  const handleCameraChange = () => {
    if (disabled || !cameraActiveRef.current || isSwitchingCameraRef.current)
      return;
    isSwitchingCameraRef.current = true;
    setFacing((currentFacing) =>
      currentFacing === "front" ? "back" : "front",
    );
  };

  const handleCameraReady = () => {
    if (!cameraActiveRef.current || disabled) return;
    isSwitchingCameraRef.current = false;
  };

  if (!isCameraActive || disabled || !permission?.granted) {
    return (
      <View style={styles.permissionState}>
        <Text style={styles.scanTitle}>Lector QR listo</Text>
        <Text style={styles.permissionText}>
          Presione Iniciar cámara para escanear el código QR
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={disabled}
          onPress={startCamera}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Iniciar cámara</Text>
        </TouchableOpacity>
        {!!permissionError && (
          <Text accessibilityRole="alert" style={styles.settingsText}>
            {permissionError}
          </Text>
        )}
        {permission && !permission.granted && !permission.canAskAgain && (
          <Text style={styles.settingsText}>
            Habilita la cámara desde los ajustes del dispositivo para continuar.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.activeScanner}>
      <View style={styles.scanner}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          facing={facing}
          onCameraReady={handleCameraReady}
          onBarcodeScanned={handleBarcodeScanned}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <TouchableOpacity
          accessibilityHint="Alterna entre la cámara frontal y trasera"
          accessibilityLabel="Cambiar cámara"
          accessibilityRole="button"
          onPress={handleCameraChange}
          style={styles.cameraButton}
        >
          <Text style={styles.cameraButtonText}>Cambiar cámara</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.scanTitle}>Acerque su código QR a la cámara</Text>
      <Text style={styles.permissionText}>
        Mantenga el código dentro del recuadro
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={stopCamera}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Apagar cámara</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scanner: {
    borderRadius: 16,
    height: 230,
    overflow: "hidden",
    width: "100%",
  },
  activeScanner: { alignItems: "center", width: "100%" },
  scanTitle: {
    color: "#28231f",
    fontSize: 19,
    fontWeight: "700",
    marginVertical: 12,
    textAlign: "center",
  },
  closeButton: { marginTop: 12, padding: 10 },
  closeButtonText: { color: "#b9650a", fontWeight: "600" },
  cameraButton: {
    alignSelf: "center",
    backgroundColor: "rgba(40, 35, 31, 0.78)",
    borderRadius: 16,
    bottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    position: "absolute",
  },
  cameraButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  frame: {
    bottom: 34,
    left: 70,
    position: "absolute",
    right: 70,
    top: 34,
  },
  corner: {
    borderColor: "#f7941e",
    height: 34,
    position: "absolute",
    width: 34,
  },
  topLeft: { borderLeftWidth: 4, borderTopWidth: 4, left: 0, top: 0 },
  topRight: { borderRightWidth: 4, borderTopWidth: 4, right: 0, top: 0 },
  bottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 0,
    right: 0,
  },
  permissionState: {
    alignItems: "center",
    backgroundColor: "#fff8ef",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 180,
    padding: 22,
    width: "100%",
  },
  permissionText: {
    color: "#756b63",
    lineHeight: 21,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#f7941e",
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  permissionButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  settingsText: {
    color: "#a53a2a",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    textAlign: "center",
  },
});

export default KioskQrScannerView;
