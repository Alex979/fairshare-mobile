import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { formatMoney, generateVenmoLink } from "../lib/bill-utils";
import { UNASSIGNED_NAME } from "../lib/constants";
import { CalculatedTotals } from "../types";

interface ResultsPanelProps {
  calculatedTotals: CalculatedTotals | null;
  bottomInset?: number;
}

export default function ResultsPanel({
  calculatedTotals,
  bottomInset = 0,
}: ResultsPanelProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const styles = createStyles(isDark, bottomInset);

  const toggleUserExpanded = (userName: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userName)) {
        newSet.delete(userName);
      } else {
        newSet.add(userName);
      }
      return newSet;
    });
  };

  const handleVenmoPress = (venmoLink: string) => {
    Linking.canOpenURL(venmoLink).then((supported) => {
      if (supported) {
        Linking.openURL(venmoLink);
      } else {
        console.log("Venmo app not available");
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Final Breakdown</Text>
        <Text style={styles.headerSubtitle}>Request money via Venmo</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.values(calculatedTotals?.byUser || {})
          .filter((u) => u.name !== UNASSIGNED_NAME || u.total > 0)
          .map((user, idx) => (
            <View
              key={idx}
              style={[
                styles.userCard,
                user.name === UNASSIGNED_NAME && styles.userCardUnassigned,
              ]}
            >
              <View style={styles.userHeader}>
                <Text
                  style={[
                    styles.userName,
                    user.name === UNASSIGNED_NAME && styles.userNameUnassigned,
                  ]}
                  numberOfLines={1}
                >
                  {user.name}
                </Text>
                <Text style={styles.userTotal}>{formatMoney(user.total)}</Text>
              </View>

              {user.name !== UNASSIGNED_NAME && (
                <TouchableOpacity
                  style={styles.venmoButton}
                  onPress={() => handleVenmoPress(generateVenmoLink(user))}
                >
                  <Text style={styles.venmoButtonText}>REQUEST</Text>
                  <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
              )}

              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base</Text>
                  <Text style={styles.breakdownValue}>
                    {formatMoney(user.base_amount)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Tax</Text>
                  <Text style={styles.breakdownValue}>
                    {formatMoney(user.tax_share)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Tip</Text>
                  <Text style={styles.breakdownValue}>
                    {formatMoney(user.tip_share)}
                  </Text>
                </View>
              </View>

              {user.items.length > 0 && (
                <View style={styles.itemsSection}>
                  <TouchableOpacity
                    style={styles.itemsHeader}
                    onPress={() => toggleUserExpanded(user.name)}
                  >
                    <Text style={styles.itemsHeaderText}>
                      {user.items.length} Items
                    </Text>
                    <Ionicons
                      name={
                        expandedUsers.has(user.name)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={14}
                      color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>

                  {expandedUsers.has(user.name) && (
                    <View style={styles.itemsList}>
                      {user.items.map((item, i) => (
                        <View key={i} style={styles.itemRow}>
                          <Text
                            style={styles.itemDescription}
                            numberOfLines={1}
                          >
                            {item.description}
                          </Text>
                          <Text style={styles.itemAmount}>
                            {formatMoney(item.total_price * item.share)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Subtotal</Text>
          <Text style={styles.footerValue}>
            {formatMoney(calculatedTotals?.subtotal || 0)}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Tax + Tip</Text>
          <Text style={styles.footerValue}>
            {formatMoney(
              (calculatedTotals?.totalTax || 0) +
                (calculatedTotals?.totalTip || 0)
            )}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatMoney(calculatedTotals?.grandTotal || 0)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#F3F4F6",
    },
    header: {
      padding: 16,
      backgroundColor: isDark ? "#111827" : "#F3F4F6",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
      paddingBottom: 32,
    },
    userCard: {
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#E5E7EB",
    },
    userCardUnassigned: {
      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
      borderColor: isDark ? "#991B1B" : "#FCA5A5",
    },
    userHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    userName: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
      flex: 1,
      marginRight: 8,
    },
    userNameUnassigned: {
      color: isDark ? "#FCA5A5" : "#DC2626",
    },
    userTotal: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
    },
    venmoButton: {
      backgroundColor: "#008CFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 8,
      marginBottom: 12,
    },
    venmoButtonText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#fff",
      letterSpacing: 0.5,
    },
    breakdown: {
      gap: 6,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    breakdownLabel: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    breakdownValue: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    itemsSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    itemsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    itemsHeaderText: {
      fontSize: 10,
      fontWeight: "bold",
      color: isDark ? "#9CA3AF" : "#6B7280",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    itemsList: {
      marginTop: 8,
      gap: 6,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    itemDescription: {
      flex: 1,
      fontSize: 10,
      color: isDark ? "#D1D5DB" : "#4B5563",
      marginRight: 8,
    },
    itemAmount: {
      fontSize: 10,
      color: isDark ? "#D1D5DB" : "#4B5563",
    },
    footer: {
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: Math.max(bottomInset, 16) + 8,
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
      gap: 6,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerLabel: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    footerValue: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
    },
  });
