import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const KioskQrScannerView = ({ disabled, onQrScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("front");
  const hasScannedRef = useRef(false);
  const hasRequestedPermissionRef = useRef(false);
  const isSwitchingCameraRef = useRef(false);

  useEffect(() => {
    if (!permission || hasRequestedPermissionRef.current) return;

    if (!permission.granted && permission.canAskAgain) {
      hasRequestedPermissionRef.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!disabled) {
      hasScannedRef.current = false;
    }
  }, [disabled]);

  const handleBarcodeScanned = ({ data }) => {
    if (
      disabled ||
      isSwitchingCameraRef.current ||
      hasScannedRef.current ||
      typeof data !== "string"
    )
      return;

    const qrValue = data.trim();
    if (!qrValue) return;

    hasScannedRef.current = true;
    onQrScanned(qrValue);
  };

  const handleCameraChange = () => {
    if (disabled || isSwitchingCameraRef.current) return;

    isSwitchingCameraRef.current = true;
    hasScannedRef.current = true;
    setFacing((currentFacing) =>
      currentFacing === "front" ? "back" : "front",
    );
  };

  const handleCameraReady = () => {
    isSwitchingCameraRef.current = false;

    if (!disabled) {
      hasScannedRef.current = false;
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionState}>
        <Text style={styles.permissionText}>Preparando la cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionState}>
        <Text accessibilityRole="alert" style={styles.permissionText}>
          Se necesita permiso de cámara para escanear el código QR.
        </Text>
        {permission.canAskAgain && (
          <TouchableOpacity
            accessibilityLabel="Solicitar permiso de cámara"
            accessibilityRole="button"
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>PERMITIR CÁMARA</Text>
          </TouchableOpacity>
        )}
        {!permission.canAskAgain && (
          <Text style={styles.settingsText}>
            Habilita la cámara desde los ajustes del dispositivo para continuar.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.scanner, disabled && styles.scannerDisabled]}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        facing={facing}
        onCameraReady={handleCameraReady}
        onBarcodeScanned={disabled ? undefined : handleBarcodeScanned}
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
        disabled={disabled}
        onPress={handleCameraChange}
        style={styles.cameraButton}
      >
        <Text style={styles.cameraButtonText}>Cambiar cámara</Text>
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
  scannerDisabled: { opacity: 0.55 },
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
