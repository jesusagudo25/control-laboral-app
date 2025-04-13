import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@rneui/themed";

const SkeletonDocument = () => {
  const skeletonCommonStyle = { backgroundColor: "#F0F0F0" };

  return (
    <View style={styles.card}>
      {/* Information */}
      <Skeleton
        animation="pulse"
        style={styles.information}
        skeletonStyle={skeletonCommonStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    borderColor: "#1E6091",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    height: 110,
  },
  information: {
    height: 77,
    width: "100%",
    borderRadius: 6,
    marginBottom: 10,
  },
});

export default SkeletonDocument;
