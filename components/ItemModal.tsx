import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { LineItem } from "../types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DISMISS_THRESHOLD = 100; // How far to drag before dismissing

interface ItemModalProps {
  isOpen: boolean;
  editingItem: Partial<LineItem> | null;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  setEditingItem: (item: Partial<LineItem> | null) => void;
}

export default function ItemModal({
  isOpen,
  editingItem,
  onClose,
  onSave,
  onDelete,
  setEditingItem,
}: ItemModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const isEditing = Boolean(editingItem?.id);

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward drags
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down (positive dy)
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
          // Also fade backdrop proportionally
          const opacity = Math.max(0, 1 - gestureState.dy / 300);
          backdropOpacity.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          // Dismiss the modal
          onClose();
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(dragY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isOpen) {
      // Reset positions before animating in
      slideAnim.setValue(SCREEN_HEIGHT);
      dragY.setValue(0);
      backdropOpacity.setValue(0);

      // Small delay to let layout settle before animating
      // This prevents the keyboard animation from compounding with ours
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 30,
            stiffness: 250,
            mass: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }, 10);

      return () => clearTimeout(timeout);
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  const handleSave = () => {
    if (!editingItem?.description || !editingItem.description.trim()) {
      Alert.alert("Invalid Input", "Please enter a description");
      return;
    }
    if (editingItem.total_price === undefined || editingItem.total_price < 0) {
      Alert.alert("Invalid Input", "Please enter a valid price");
      return;
    }
    onSave();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        {/* Backdrop - fades in */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Modal content - slides up */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }, { translateY: dragY }],
            },
          ]}
        >
          {/* Draggable handle area */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Item" : "Add Item"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={editingItem?.description || ""}
                onChangeText={(text) =>
                  setEditingItem({ ...editingItem, description: text })
                }
                placeholder="Item name"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={String(editingItem?.total_price || 0)}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    setEditingItem({
                      ...editingItem,
                      total_price: num,
                      unit_price: num,
                    });
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            {isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.saveButton, !isEditing && styles.saveButtonFull]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? "Save Changes" : "Add Item"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "ios" ? 34 : 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    handleArea: {
      paddingVertical: 12,
      alignItems: "center",
      cursor: "grab" as any, // Web-only property
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: isDark ? "#4B5563" : "#D1D5DB",
      borderRadius: 2,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
    },
    closeButton: {
      padding: 4,
    },
    form: {
      padding: 20,
      gap: 20,
    },
    field: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#D1D5DB" : "#374151",
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#fff" : "#1F2937",
      backgroundColor: isDark ? "#374151" : "#fff",
    },
    priceInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
      borderRadius: 8,
      backgroundColor: isDark ? "#374151" : "#fff",
      paddingLeft: 12,
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginRight: 4,
    },
    priceInput: {
      flex: 1,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#fff" : "#1F2937",
    },
    actions: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 12,
    },
    deleteButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "#EF4444",
      paddingVertical: 14,
      borderRadius: 10,
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    saveButton: {
      flex: 1,
      backgroundColor: "#2563EB",
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonFull: {
      flex: 2,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });
