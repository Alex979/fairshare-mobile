import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BillData, LineItem } from "../types";
import { formatMoney } from "../lib/bill-utils";
import { WEIGHT_INCREMENT, WEIGHT_INITIAL, WEIGHT_MIN } from "../lib/constants";

interface LineItemsListProps {
  data: BillData;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: LineItem) => void;
  onUpdateSplit: (itemId: string, participantId: string, weight: number) => void;
}

export default function LineItemsList({
  data,
  activeItemId,
  setActiveItemId,
  onOpenAddModal,
  onOpenEditModal,
  onUpdateSplit,
}: LineItemsListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Line Items</Text>
        <TouchableOpacity onPress={onOpenAddModal} style={styles.addButton}>
          <Ionicons name="add" size={16} color="#2563EB" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {data.line_items.map((item) => {
          const logic = data.split_logic.find((l) => l.item_id === item.id);
          const isExpanded = activeItemId === item.id;
          const isUnassigned = !logic || logic.allocations.length === 0;

          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                isExpanded && styles.itemCardExpanded,
              ]}
            >
              <TouchableOpacity
                style={styles.itemHeader}
                onPress={() => setActiveItemId(isExpanded ? null : item.id)}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    <Text style={styles.itemPrice}>{formatMoney(item.total_price)}</Text>
                  </View>

                  <View style={styles.itemBottomRow}>
                    {isUnassigned ? (
                      <View style={styles.unassignedBadge}>
                        <Text style={styles.unassignedText}>Unassigned</Text>
                      </View>
                    ) : (
                      <View style={styles.avatarsRow}>
                        {logic?.allocations.map((a) => {
                          const person = data.participants.find(
                            (p) => p.id === a.participant_id
                          );
                          return person ? (
                            <View key={a.participant_id} style={styles.miniAvatar}>
                              <Text style={styles.miniAvatarText}>
                                {person.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          ) : null;
                        })}
                      </View>
                    )}

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => onOpenEditModal(item)}
                        style={styles.editButton}
                      >
                        <Ionicons name="pencil" size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#9CA3AF"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.expandedTitle}>ASSIGN SHARES</Text>
                  <View style={styles.participantsList}>
                    {data.participants.map((p) => {
                      const alloc = logic?.allocations.find(
                        (a) => a.participant_id === p.id
                      );
                      const weight = alloc ? alloc.weight : 0;

                      return (
                        <View
                          key={p.id}
                          style={[
                            styles.participantRow,
                            weight > 0 && styles.participantRowActive,
                          ]}
                        >
                          <View style={styles.participantLeft}>
                            <View style={styles.participantAvatar}>
                              <Text style={styles.participantAvatarText}>
                                {p.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.participantName,
                                weight > 0 && styles.participantNameActive,
                              ]}
                            >
                              {p.name}
                            </Text>
                          </View>

                          <View style={styles.weightControls}>
                            <TouchableOpacity
                              style={styles.weightButton}
                              onPress={() =>
                                onUpdateSplit(
                                  item.id,
                                  p.id,
                                  Math.max(WEIGHT_MIN, weight - WEIGHT_INCREMENT)
                                )
                              }
                            >
                              <Text style={styles.weightButtonText}>-</Text>
                            </TouchableOpacity>

                            <Text style={styles.weightValue}>{weight}</Text>

                            <TouchableOpacity
                              style={[styles.weightButton, styles.weightButtonPlus]}
                              onPress={() =>
                                onUpdateSplit(
                                  item.id,
                                  p.id,
                                  weight + (weight === WEIGHT_MIN ? WEIGHT_INITIAL : WEIGHT_INCREMENT)
                                )
                              }
                            >
                              <Text style={styles.weightButtonTextPlus}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#D1D5DB" : "#374151",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
    },
    addButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#2563EB",
    },
    list: {
      gap: 8,
      paddingBottom: 16,
    },
    itemCard: {
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 2,
      borderColor: "transparent",
    },
    itemCardExpanded: {
      borderColor: "#2563EB",
    },
    itemHeader: {
      padding: 12,
    },
    itemInfo: {
      gap: 8,
    },
    itemTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemDescription: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#fff" : "#1F2937",
      marginRight: 8,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
    },
    itemBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    unassignedBadge: {
      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    unassignedText: {
      fontSize: 10,
      fontWeight: "600",
      color: isDark ? "#FCA5A5" : "#DC2626",
    },
    avatarsRow: {
      flexDirection: "row",
      marginLeft: 4,
    },
    miniAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -4,
      borderWidth: 1,
      borderColor: isDark ? "#1F2937" : "#fff",
    },
    miniAvatarText: {
      fontSize: 9,
      fontWeight: "bold",
      color: isDark ? "#D1D5DB" : "#4B5563",
    },
    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    editButton: {
      padding: 4,
    },
    expandedContent: {
      backgroundColor: isDark ? "#111827" : "#F9FAFB",
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    expandedTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: isDark ? "#6B7280" : "#9CA3AF",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    participantsList: {
      gap: 8,
    },
    participantRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#E5E7EB",
    },
    participantRowActive: {
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
      borderColor: isDark ? "#1E40AF" : "#93C5FD",
    },
    participantLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    participantAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    participantAvatarText: {
      fontSize: 10,
      fontWeight: "bold",
      color: isDark ? "#D1D5DB" : "#4B5563",
    },
    participantName: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    participantNameActive: {
      color: isDark ? "#93C5FD" : "#1E40AF",
      fontWeight: "600",
    },
    weightControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    weightButton: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    weightButtonPlus: {
      backgroundColor: isDark ? "#1E40AF" : "#3B82F6",
    },
    weightButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    weightButtonTextPlus: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    weightValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
      minWidth: 24,
      textAlign: "center",
    },
  });

