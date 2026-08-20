import React from "react";
import { StyleSheet, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

const FormPicker = ({
  selectedValue,
  onValueChange,
  children,
  color = "#0D0D0D",
  prompt,
}) => (
  <View style={styles.container}>
    <Picker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      mode="dropdown"
      prompt={prompt}
      dropdownIconColor="#1E6091"
      style={[styles.picker, { color }]}
      itemStyle={[styles.item, { color }]}
    >
      {children}
    </Picker>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    marginVertical: 10,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#1E6091",
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
    height: 52,
  },
  item: {
    height: 52,
  },
});

export default FormPicker;
