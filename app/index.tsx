import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBill } from "../context/BillContext";
import { APP_NAME } from "../lib/constants";

export default function InputScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { height: screenHeight } = useWindowDimensions();

  const {
    imageUri,
    setImageUri,
    promptText,
    setPromptText,
    error,
    processReceiptAction,
    loadMockData,
  } = useBill();

  const isVerySmall = screenHeight < 600;
  const isSmall = screenHeight < 700;

  const pickFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photos to upload a receipt."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your camera to take a photo."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Camera Unavailable",
        "Unable to access camera. Please choose a photo from your library instead.",
        [
          { text: "Choose from Library", onPress: pickFromGallery },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const handleImagePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickFromGallery();
          }
        }
      );
    } else {
      Alert.alert("Upload Receipt", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickFromGallery },
      ]);
    }
  };

  const handleProcess = async () => {
    router.push("/processing");
    const success = await processReceiptAction();
    if (success) {
      router.replace("/editor");
    } else {
      router.back();
    }
  };

  const handleLoadMock = () => {
    loadMockData();
    router.push("/editor");
  };

  const styles = createStyles(isDark, isVerySmall, isSmall);
  const canProcess = imageUri || promptText;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="pie-chart"
              size={isVerySmall ? 18 : 22}
              color="#fff"
            />
          </View>
          <Text style={styles.headerTitle}>{APP_NAME}</Text>
        </View>

        {/* Scrollable content area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={!isVerySmall}
          keyboardShouldPersistTaps="handled"
        >
          {/* Receipt Image Section */}
          <TouchableOpacity
            style={[
              styles.imageSection,
              isVerySmall
                ? { height: 140 }
                : isSmall
                ? { height: 180 }
                : { flex: 1, minHeight: 200 },
            ]}
            onPress={handleImagePress}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.receiptImage} />
                <View style={styles.imageOverlay}>
                  <View style={styles.changeButton}>
                    <Ionicons name="camera" size={16} color="#fff" />
                    <Text style={styles.changeButtonText}>Change</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyImageContainer}>
                <View style={styles.cameraCircle}>
                  <Ionicons
                    name="receipt-outline"
                    size={isVerySmall ? 24 : 28}
                    color={isDark ? "#60A5FA" : "#2563EB"}
                  />
                </View>
                <Text style={styles.addPhotoTitle}>Add Receipt</Text>
                {!isVerySmall && (
                  <Text style={styles.addPhotoSubtitle}>
                    Tap to take photo or choose from library
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Instructions Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Split Instructions</Text>
            <TextInput
              style={styles.textInput}
              placeholder={
                isVerySmall
                  ? "How to split the bill..."
                  : "Describe how to split the bill..."
              }
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              value={promptText}
              onChangeText={setPromptText}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            style={[
              styles.processButton,
              !canProcess && styles.processButtonDisabled,
            ]}
            onPress={handleProcess}
            disabled={!canProcess}
          >
            <Text style={styles.processButtonText}>Process Receipt</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLoadMock} style={styles.demoButton}>
            <Text style={styles.demoButtonText}>Try with demo data</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  isDark: boolean,
  isVerySmall: boolean,
  isSmall: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#fff",
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isVerySmall ? 16 : 20,
      paddingVertical: isVerySmall ? 8 : 12,
    },
    logoContainer: {
      width: isVerySmall ? 30 : 36,
      height: isVerySmall ? 30 : 36,
      borderRadius: isVerySmall ? 8 : 10,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: isVerySmall ? 18 : 20,
      fontWeight: "700",
      color: isDark ? "#fff" : "#111827",
      marginLeft: 10,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isVerySmall ? 16 : 20,
      paddingBottom: isVerySmall ? 12 : 20,
    },
    imageSection: {
      marginBottom: isVerySmall ? 12 : 16,
    },
    imageContainer: {
      flex: 1,
      borderRadius: isVerySmall ? 12 : 16,
      overflow: "hidden",
      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
    },
    receiptImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.2)",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      padding: 10,
    },
    changeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    changeButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#fff",
    },
    emptyImageContainer: {
      flex: 1,
      borderRadius: isVerySmall ? 12 : 16,
      borderWidth: 2,
      borderColor: isDark ? "#374151" : "#E5E7EB",
      borderStyle: "dashed",
      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
      alignItems: "center",
      justifyContent: "center",
      padding: isVerySmall ? 12 : 20,
    },
    cameraCircle: {
      width: isVerySmall ? 48 : 64,
      height: isVerySmall ? 48 : 64,
      borderRadius: isVerySmall ? 24 : 32,
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isVerySmall ? 8 : 12,
    },
    addPhotoTitle: {
      fontSize: isVerySmall ? 15 : 17,
      fontWeight: "600",
      color: isDark ? "#fff" : "#111827",
    },
    addPhotoSubtitle: {
      fontSize: 13,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      marginTop: 4,
    },
    inputSection: {
      marginBottom: isVerySmall ? 10 : 12,
    },
    inputLabel: {
      fontSize: isVerySmall ? 14 : 15,
      fontWeight: "600",
      color: isDark ? "#fff" : "#111827",
      marginBottom: isVerySmall ? 6 : 8,
    },
    textInput: {
      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#E5E7EB",
      borderRadius: isVerySmall ? 10 : 12,
      padding: isVerySmall ? 10 : 14,
      fontSize: isVerySmall ? 14 : 15,
      color: isDark ? "#fff" : "#111827",
      minHeight: isVerySmall ? 60 : 80,
      maxHeight: isVerySmall ? 80 : 100,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
      padding: isVerySmall ? 8 : 10,
      borderRadius: 8,
      marginBottom: isVerySmall ? 10 : 12,
    },
    errorText: {
      flex: 1,
      fontSize: 12,
      color: isDark ? "#FCA5A5" : "#DC2626",
    },
    processButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "#2563EB",
      paddingVertical: isVerySmall ? 12 : 14,
      borderRadius: isVerySmall ? 10 : 12,
    },
    processButtonDisabled: {
      opacity: 0.4,
    },
    processButtonText: {
      fontSize: isVerySmall ? 15 : 16,
      fontWeight: "600",
      color: "#fff",
    },
    demoButton: {
      alignItems: "center",
      paddingVertical: isVerySmall ? 10 : 12,
    },
    demoButtonText: {
      fontSize: isVerySmall ? 12 : 13,
      fontWeight: "500",
      color: "#6B7280",
    },
  });
