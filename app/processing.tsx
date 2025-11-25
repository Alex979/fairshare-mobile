import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProcessingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={48} color="#2563EB" />
        </View>
        
        <ActivityIndicator size="large" color="#2563EB" style={styles.spinner} />
        
        <Text style={styles.title}>Processing Receipt</Text>
        <Text style={styles.subtitle}>
          AI is analyzing your receipt and splitting the bill...
        </Text>
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#fff",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    content: {
      alignItems: "center",
      maxWidth: 320,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    spinner: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      lineHeight: 20,
    },
  });

