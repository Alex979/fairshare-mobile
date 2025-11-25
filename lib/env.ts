import Constants from "expo-constants";

/**
 * Get the OpenRouter API key from environment variables
 */
export function getOpenRouterApiKey(): string {
  // In Expo, environment variables prefixed with EXPO_PUBLIC_ are available
  const apiKey =
    Constants.expoConfig?.extra?.openRouterApiKey ||
    process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "EXPO_PUBLIC_OPENROUTER_API_KEY is not configured. " +
        "Please add it to your .env file. See .env.example for reference."
    );
  }

  return apiKey;
}
