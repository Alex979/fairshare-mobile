import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from "react-native";
import { Modifiers } from "../types";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ModifierSectionProps {
  modifiers: Modifiers;
  onUpdateModifier: (key: "tax" | "tip", field: string, value: any) => void;
}

export default function ModifierSection({
  modifiers,
  onUpdateModifier,
}: ModifierSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = createStyles(isDark);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const formatModifierValue = (mod: { type: string; value: number }) => {
    if (mod.type === "percentage") {
      return `${mod.value}%`;
    }
    return `$${mod.value.toFixed(2)}`;
  };

  const renderModifier = (key: "tax" | "tip", label: string) => {
    const mod = modifiers[key];
    return (
      <View key={key} style={styles.modifierCard}>
        <Text style={styles.modifierLabel}>{label}</Text>

        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              mod.type === "fixed" && styles.typeButtonActive,
            ]}
            onPress={() => onUpdateModifier(key, "type", "fixed")}
          >
            <Text
              style={[
                styles.typeButtonText,
                mod.type === "fixed" && styles.typeButtonTextActive,
              ]}
            >
              $ Fixed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              mod.type === "percentage" && styles.typeButtonActive,
            ]}
            onPress={() => onUpdateModifier(key, "type", "percentage")}
          >
            <Text
              style={[
                styles.typeButtonText,
                mod.type === "percentage" && styles.typeButtonTextActive,
              ]}
            >
              % Percent
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={String(mod.value || 0)}
            onChangeText={(text) => {
              const num = parseFloat(text) || 0;
              onUpdateModifier(key, "value", num);
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          />
          <Text style={styles.inputSuffix}>
            {mod.type === "percentage" ? "%" : "$"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="calculator-outline"
            size={18}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text style={styles.title}>Tax & Tip</Text>
        </View>

        <View style={styles.headerRight}>
          {!isExpanded && (
            <View style={styles.summaryChips}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryChipLabel}>Tax</Text>
                <Text style={styles.summaryChipValue}>
                  {formatModifierValue(modifiers.tax)}
                </Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryChipLabel}>Tip</Text>
                <Text style={styles.summaryChipValue}>
                  {formatModifierValue(modifiers.tip)}
                </Text>
              </View>
            </View>
          )}
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.modifiersList}>
          {renderModifier("tax", "Tax")}
          {renderModifier("tip", "Tip")}
        </View>
      )}
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#D1D5DB" : "#374151",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    summaryChips: {
      flexDirection: "row",
      gap: 6,
    },
    summaryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    summaryChipLabel: {
      fontSize: 11,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    summaryChipValue: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#fff" : "#1F2937",
    },
    modifiersList: {
      padding: 12,
      paddingTop: 0,
      gap: 12,
    },
    modifierCard: {
      backgroundColor: isDark ? "#374151" : "#F9FAFB",
      borderRadius: 10,
      padding: 12,
    },
    modifierLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#fff" : "#1F2937",
      marginBottom: 10,
    },
    typeButtons: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 10,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
      alignItems: "center",
    },
    typeButtonActive: {
      backgroundColor: "#2563EB",
    },
    typeButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    typeButtonTextActive: {
      color: "#fff",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
      borderRadius: 6,
      backgroundColor: isDark ? "#1F2937" : "#fff",
      paddingHorizontal: 10,
    },
    input: {
      flex: 1,
      paddingVertical: 8,
      fontSize: 14,
      color: isDark ? "#fff" : "#1F2937",
    },
    inputSuffix: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
  });
