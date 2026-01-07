import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatHeader() {
  return (
    <View style={styles.header}>
      <Ionicons name="cloud-outline" size={22} color="#fff" />
      <Text style={styles.title}>AFMS Weather Assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
