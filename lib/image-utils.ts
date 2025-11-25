import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { IMAGE_MAX_WIDTH, IMAGE_QUALITY } from "./constants";

export const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await manipulateAsync(
      uri,
      [{ resize: { width: IMAGE_MAX_WIDTH } }],
      { compress: IMAGE_QUALITY, format: SaveFormat.JPEG, base64: true }
    );

    if (!manipResult.base64) {
      throw new Error("Failed to get base64 from compressed image");
    }

    return manipResult.base64;
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
};
