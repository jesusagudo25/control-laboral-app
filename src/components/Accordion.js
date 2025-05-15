import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "@rneui/themed";

const Accordion = ({ title, children, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={{ marginBottom: 5, borderRadius: 6, overflow: "hidden" }}>
      <TouchableOpacity
        onPress={toggleAccordion}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={(theme.textSecondary, { fontWeight: "bold" })}>
          {title}
        </Text>
        <Icon
          name={isExpanded ? "expand-less" : "expand-more"}
          type="material"
          color={theme.colors.text}
        />
      </TouchableOpacity>
      {isExpanded && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
};

export default Accordion;
