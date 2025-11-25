import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Participant } from "../types";

interface ParticipantsListProps {
  participants: Participant[];
  onUpdateName: (id: string, name: string) => void;
  onAddParticipant: () => Participant;
  onDeleteParticipant: (id: string) => void;
}

export default function ParticipantsList({
  participants,
  onUpdateName,
  onAddParticipant,
  onDeleteParticipant,
}: ParticipantsListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editName, setEditName] = useState("");
  const styles = createStyles(isDark);

  const handleChipPress = (participant: Participant) => {
    setEditingParticipant(participant);
    setEditName(participant.name);
  };

  const handleAdd = () => {
    const participant = onAddParticipant();
    setEditingParticipant(participant);
    setEditName(participant.name);
  }

  const handleSave = () => {
    if (editingParticipant && editName.trim()) {
      onUpdateName(editingParticipant.id, editName.trim());
    }
    setEditingParticipant(null);
  };

  const handleDelete = () => {
    if (!editingParticipant) return;
    
    if (participants.length === 1) {
      Alert.alert("Cannot Delete", "You must have at least one participant.");
      return;
    }
    
    Alert.alert("Delete Participant", `Remove ${editingParticipant.name}?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          onDeleteParticipant(editingParticipant.id);
          setEditingParticipant(null);
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Participants</Text>
        <Text style={styles.count}>{participants.length}</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsList}
      >
        {participants.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.chip}
            onPress={() => handleChipPress(p)}
          >
            <View style={styles.chipAvatar}>
              <Text style={styles.chipAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.chipName} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.addChip} onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#2563EB" />
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editingParticipant !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setEditingParticipant(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setEditingParticipant(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Edit Participant</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              autoFocus
              selectTextOnFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 4,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#9CA3AF" : "#6B7280",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    count: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#6B7280" : "#9CA3AF",
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    chipsList: {
      flexDirection: "row",
      gap: 8,
      paddingRight: 16,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderRadius: 20,
      paddingVertical: 6,
      paddingLeft: 6,
      paddingRight: 12,
      gap: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    chipAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    chipAvatarText: {
      fontSize: 12,
      fontWeight: "bold",
      color: isDark ? "#D1D5DB" : "#4B5563",
    },
    chipName: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#fff" : "#1F2937",
      maxWidth: 80,
    },
    addChip: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      width: "100%",
      maxWidth: 300,
      backgroundColor: isDark ? "#1F2937" : "#fff",
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#1F2937",
      marginBottom: 16,
      textAlign: "center",
    },
    modalInput: {
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#fff" : "#1F2937",
      backgroundColor: isDark ? "#374151" : "#F9FAFB",
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: "row",
      gap: 12,
    },
    deleteButton: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
    },
    saveButton: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });
