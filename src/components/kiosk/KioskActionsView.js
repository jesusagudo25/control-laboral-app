import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/themed";

const KioskActionsView = ({
  worker,
  availableActions,
  onActionPress,
  onReturnToTerminal,
}) => (
  <View style={styles.container}>
    <Image
      source={require("../../../assets/logo_small.png")}
      style={styles.logo}
    />
    <Text style={styles.title}>Acciones de jornada</Text>
    <Text style={styles.subtitle}>Selecciona una acción para continuar</Text>

    <View style={styles.workerCard}>
      <View style={styles.avatar}>
        <Icon name="user" type="font-awesome" color="#f7941e" size={25} />
      </View>
      <View style={styles.workerContent}>
        <Text style={styles.workerName}>{worker.name}</Text>
        <Text style={styles.workerDetail}>{worker.detail}</Text>
      </View>
      <View style={styles.activeBadge}>
        <View style={styles.activeDot} />
        <Text style={styles.activeText}>{worker.status}</Text>
      </View>
    </View>

    <View style={styles.actions}>
      {availableActions.map((action) => (
        <TouchableOpacity
          accessibilityLabel={action.title}
          accessibilityRole="button"
          activeOpacity={0.8}
          key={action.id}
          onPress={() => onActionPress(action)}
          style={styles.actionCard}
        >
          <View style={styles.actionIcon}>
            <Icon
              name={action.icon}
              type="font-awesome"
              color="#f7941e"
              size={22}
            />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </View>
          <Icon
            name="chevron-right"
            type="font-awesome"
            color="#b8ada4"
            size={15}
          />
        </TouchableOpacity>
      ))}
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
      <View style={styles.timerBadge}>
        <Text style={styles.timerText}>00:60</Text>
      </View>
    </View>

    <TouchableOpacity
      accessibilityLabel="Volver a la terminal de fichaje"
      accessibilityRole="button"
      onPress={onReturnToTerminal}
      style={styles.returnButton}
    >
      <Icon name="arrow-left" type="font-awesome" color="#9b5a16" size={13} />
      <Text style={styles.returnText}>Volver a la terminal</Text>
    </TouchableOpacity>
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
  workerCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
    flexDirection: "row",
    marginTop: 18,
    maxWidth: 460,
    padding: 16,
    shadowColor: "#613814",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    width: "100%",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#fff4e8",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  workerContent: { flex: 1, marginLeft: 12 },
  workerName: { color: "#28231f", fontSize: 17, fontWeight: "700" },
  workerDetail: { color: "#756b63", fontSize: 13, marginTop: 4 },
  activeBadge: {
    alignItems: "center",
    backgroundColor: "#eaf7ed",
    borderRadius: 14,
    flexDirection: "row",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  activeDot: {
    backgroundColor: "#3fa85c",
    borderRadius: 4,
    height: 7,
    marginRight: 5,
    width: 7,
  },
  activeText: { color: "#26763c", fontSize: 11, fontWeight: "700" },
  actions: { marginTop: 12, maxWidth: 460, width: "100%" },
  actionCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eee2d7",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 16,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: "#fff4e8",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  actionContent: { flex: 1, marginHorizontal: 13 },
  actionTitle: { color: "#28231f", fontSize: 16, fontWeight: "700" },
  actionDescription: {
    color: "#756b63",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
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
  timerBadge: {
    backgroundColor: "#fff0df",
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  timerText: { color: "#b9650a", fontSize: 12, fontWeight: "700" },
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

export default KioskActionsView;
