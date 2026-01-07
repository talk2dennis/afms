import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import ChatBubble from "../components/chatBubble";
import ChatInput from "../components/chatInput";
import ChatHeader from "../components/chatHeader";
import mockAIResponse from "../data/mockAI";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "👋 Hi! I can help you understand weather conditions and flood risks.",
      sender: "ai",
    },
  ]);

  const sendMessage = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: Message = {
        id: Math.random().toString(),
        text: mockAIResponse(text),
        sender: "ai",
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <View style={styles.container}>
        <ChatHeader />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble message={item.text} isUser={item.sender === "user"} />
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <ChatInput onSend={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
