import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#222",
  },
});
