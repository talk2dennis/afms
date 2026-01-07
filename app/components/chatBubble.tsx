import { View, Text, StyleSheet } from "react-native";

export default function ChatBubble({
  message,
  isUser,
}: {
  message: string;
  isUser: boolean;
}) {
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 14,
    marginVertical: 6,
  },
  userBubble: {
    backgroundColor: "#1e90ff",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#eaeaea",
    alignSelf: "flex-start",
  },
  text: {
    color: "#000",
  },
});
