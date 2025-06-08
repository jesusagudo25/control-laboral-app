import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@rneui/themed";

const NotificationSkeletonItem = () => {
  const skeletonCommonStyle = { backgroundColor: "#F0F0F0" };

  return (
    <View style={{ flex: 1, paddingTop: 3 }}>
      {[1, 2, 3, 4].map((_, index) => (
        <View style={styles.item} key={index}>
          <Skeleton
            animation="pulse"
            style={styles.title}
            skeletonStyle={skeletonCommonStyle}
          />
          <Skeleton
            animation="pulse"
            style={styles.message}
            skeletonStyle={skeletonCommonStyle}
          />
          <Skeleton
            animation="pulse"
            style={styles.date}
            skeletonStyle={skeletonCommonStyle}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomColor: "#1E6091",
    borderBottomWidth: 1,
  },
  title: {
    width: "60%",
    height: 18,
    borderRadius: 4,
    marginBottom: 8,
  },
  message: {
    width: "90%",
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  date: {
    width: "40%",
    height: 14,
    borderRadius: 4,
  },
});

export default NotificationSkeletonItem;
