import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Ask about weather or flooding..."
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <TouchableOpacity onPress={send}>
        <Ionicons name="send" size={22} color="#1e90ff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
