import { TouchableOpacity, StyleSheet } from "react-native";
import { Icon, Badge } from "@rneui/themed";

const NotificationIcon = ({ count = 0, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Icon name="notifications" type="material" color="white" size={28} />
    {count > 0 && (
      <Badge
        value={count}
        badgeStyle={{
          backgroundColor: "white",
          borderColor: "#1E6091",
          borderWidth: 1,
        }}
        textStyle={{ color: "black", fontWeight: "bold" }}
        containerStyle={styles.badgeContainer}
      />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -4,
  },
});

export default NotificationIcon;
