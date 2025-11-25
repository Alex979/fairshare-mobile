import { Stack } from "expo-router";
import { StyleSheet, useColorScheme, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BillProvider } from "../context/BillContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#111827" : "#F3F4F6";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardProvider>
        <BillProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor },
              animation: "slide_from_right",
              navigationBarColor: backgroundColor,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="editor"
              options={{
                gestureEnabled: true,
                fullScreenGestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="processing"
              options={{ gestureEnabled: false }}
            />
          </Stack>
        </BillProvider>
      </KeyboardProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
