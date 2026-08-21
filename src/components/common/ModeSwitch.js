import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/themed";

const ModeSwitch = ({ mode, onChange }) => (
  <View style={styles.container} accessibilityRole="tablist">
    {[
      { value: "personal", label: "Personal", icon: "user" },
      { value: "kiosk", label: "Kiosco", icon: "desktop" },
    ].map((option) => {
      const isActive = mode === option.value;

      return (
        <TouchableOpacity
          key={option.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          activeOpacity={0.8}
          onPress={() => onChange(option.value)}
          style={[styles.option, isActive && styles.activeOption]}
        >
          <Icon
            name={option.icon}
            type="font-awesome"
            color={isActive ? "#ffffff" : "#74695f"}
            size={13}
          />
          <Text style={[styles.optionText, isActive && styles.activeText]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderColor: "#ead7c2",
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 8,
    marginTop: 10,
    maxWidth: 300,
    padding: 3,
    width: "72%",
  },
  option: {
    alignItems: "center",
    borderRadius: 9,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  activeOption: {
    backgroundColor: "#f7941e",
  },
  optionText: {
    color: "#6b625a",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  activeText: {
    color: "#ffffff",
  },
});

export default ModeSwitch;
