import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ItemModal from "../components/ItemModal";
import LineItemsList from "../components/LineItemsList";
import ModifierSection from "../components/ModifierSection";
import ParticipantsList from "../components/ParticipantsList";
import ResultsPanel from "../components/ResultsPanel";
import { useBill } from "../context/BillContext";
import { formatMoney } from "../lib/bill-utils";
import { LineItem } from "../types";

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export default function EditorScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const {
    data,
    calculatedTotals,
    resetAll,
    updateParticipantName,
    addParticipant,
    deleteParticipant,
    updateItemSplit,
    updateModifier,
    saveItem,
    deleteItem,
  } = useBill();

  const [activeTab, setActiveTab] = useState(0);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<LineItem> | null>(
    null
  );
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const pagerRef = useRef<PagerView>(null);
  const scrollOffsetAnimatedValue = useRef(new Animated.Value(0)).current;
  const positionAnimatedValue = useRef(new Animated.Value(0)).current;

  // Animated indicator position
  const indicatorPosition = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2],
  });

  const handleStartOver = () => {
    resetAll();
    router.back();
  };

  const openAddModal = () => {
    setEditingItem({
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });
    setIsItemModalOpen(true);
  };

  const openEditModal = (item: LineItem) => {
    setEditingItem({ ...item });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (editingItem) {
      saveItem(editingItem);
      setIsItemModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleDeleteItem = () => {
    if (editingItem?.id) {
      deleteItem(editingItem.id);
      setIsItemModalOpen(false);
      setEditingItem(null);
    }
  };

  const onTabPress = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const styles = createStyles(isDark, insets, width);

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No bill data available</Text>
      </View>
    );
  }

  const participantCount = calculatedTotals
    ? Object.keys(calculatedTotals.byUser).length - 1
    : 0;

  return (
    <View style={styles.container}>
      {/* Header area with status bar background */}
      <View style={styles.headerArea}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={handleStartOver} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons
              name="pie-chart"
              size={20}
              color={isDark ? "#fff" : "#1F2937"}
            />
            <Text style={styles.headerTitle}>FairShare</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => onTabPress(0)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}
            >
              Editor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => onTabPress(1)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}
            >
              Results
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{participantCount}</Text>
            </View>
          </TouchableOpacity>

          {/* Animated indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: indicatorPosition }] },
            ]}
          />
        </View>
      </View>

      {/* Swipeable Content */}
      <AnimatedPagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
        onPageScroll={Animated.event(
          [
            {
              nativeEvent: {
                offset: scrollOffsetAnimatedValue,
                position: positionAnimatedValue,
              },
            },
          ],
          { useNativeDriver: true }
        )}
      >
        {/* Editor Tab */}
        <View key="editor" style={styles.page}>
          <View style={styles.editorContent}>
            <ParticipantsList
              participants={data.participants}
              onUpdateName={updateParticipantName}
              onAddParticipant={addParticipant}
              onDeleteParticipant={deleteParticipant}
            />

            <View style={styles.lineItemsContainer}>
              <LineItemsList
                data={data}
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
                onOpenAddModal={openAddModal}
                onOpenEditModal={openEditModal}
                onUpdateSplit={updateItemSplit}
              />
            </View>

            <ModifierSection
              modifiers={data.modifiers}
              onUpdateModifier={updateModifier}
            />
          </View>

          {/* Bottom Total Bar - inside Editor page */}
          {calculatedTotals && (
            <View style={styles.bottomBar}>
              <View style={styles.bottomBarContent}>
                <Text style={styles.bottomBarLabel}>Grand Total</Text>
                <Text style={styles.bottomBarValue}>
                  {formatMoney(calculatedTotals.grandTotal)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewResultsButton}
                onPress={() => onTabPress(1)}
              >
                <Text style={styles.viewResultsButtonText}>View Split</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Results Tab */}
        <View key="results" style={styles.page}>
          <ResultsPanel
            calculatedTotals={calculatedTotals}
            bottomInset={insets.bottom}
          />
        </View>
      </AnimatedPagerView>

      <ItemModal
        isOpen={isItemModalOpen}
        editingItem={editingItem}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        setEditingItem={setEditingItem}
      />
    </View>
  );
}

const createStyles = (
  isDark: boolean,
  insets: { top: number; bottom: number },
  width: number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#F3F4F6",
    },
    headerArea: {
      backgroundColor: isDark ? "#1F2937" : "#fff",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 8,
      paddingBottom: 8,
    },
    backButton: {
      padding: 8,
      marginLeft: -4,
    },
    headerCenter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: isDark ? "#fff" : "#1F2937",
    },
    headerSpacer: {
      width: 40,
    },
    tabBar: {
      flexDirection: "row",
      position: "relative",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 6,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    tabTextActive: {
      color: "#2563EB",
    },
    tabIndicator: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: width / 2,
      height: 2,
      backgroundColor: "#2563EB",
    },
    badge: {
      backgroundColor: "#2563EB",
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: "center",
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#fff",
    },
    pagerView: {
      flex: 1,
    },
    page: {
      flex: 1,
    },
    editorContent: {
      flex: 1,
      padding: 12,
      gap: 12,
    },
    lineItemsContainer: {
      flex: 1,
      minHeight: 100,
    },
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#1F2937" : "#fff",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#374151" : "#E5E7EB",
    },
    bottomBarContent: {
      flex: 1,
    },
    bottomBarLabel: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
    bottomBarValue: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
    },
    viewResultsButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#2563EB",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    viewResultsButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#fff",
    },
    errorText: {
      color: isDark ? "#fff" : "#1F2937",
      textAlign: "center",
      marginTop: 100,
    },
  });
