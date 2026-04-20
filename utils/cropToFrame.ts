// Image Cropping Utility for ID Capture
// Crops captured photo to only the frame border area

import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FrameConfig {
  frameWidth: number;
  frameHeight: number;
  frameLeft: number;
  frameTop: number;
}

interface CropResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Crop captured image to frame border area only
 * Maps screen coordinates to actual photo pixel coordinates
 *
 * @param photoUri - URI of the captured photo
 * @param frame - Frame configuration (width, height, left, top)
 * @param photoWidth - Actual photo resolution width
 * @param photoHeight - Actual photo resolution height
 * @returns Cropped image URI
 */
export async function cropImageToFrame(
  photoUri: string,
  frame: FrameConfig,
  photoWidth: number,
  photoHeight: number
): Promise<CropResult> {
  try {
    console.log('📸 Crop Input:', {
      photoUri,
      photoWidth,
      photoHeight,
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      frame,
    });

    // Calculate frame position as percentages of screen size
    const leftPercent = frame.frameLeft / SCREEN_WIDTH;
    const topPercent = frame.frameTop / SCREEN_HEIGHT;
    const widthPercent = frame.frameWidth / SCREEN_WIDTH;
    const heightPercent = frame.frameHeight / SCREEN_HEIGHT;

    console.log('📊 Frame percentages:', { leftPercent, topPercent, widthPercent, heightPercent });

    // Calculate crop region using percentages
    let cropRegion = {
      originX: Math.round(photoWidth * leftPercent),
      originY: Math.round(photoHeight * topPercent),
      width: Math.round(photoWidth * widthPercent),
      height: Math.round(photoHeight * heightPercent),
    };

    console.log('✂️ Calculated crop region:', cropRegion);

    // Validate and adjust crop region to be within bounds
    const maxOriginX = photoWidth - cropRegion.width;
    const maxOriginY = photoHeight - cropRegion.height;

    if (cropRegion.originX > maxOriginX || cropRegion.originY > maxOriginY) {
      console.warn('⚠️ Crop region exceeds bounds, adjusting...', {
        cropRegion,
        maxOriginX,
        maxOriginY,
        photoWidth,
        photoHeight,
      });

      // Adjust to be within bounds
      cropRegion.originX = Math.max(0, Math.min(cropRegion.originX, maxOriginX));
      cropRegion.originY = Math.max(0, Math.min(cropRegion.originY, maxOriginY));
    }

    // Also ensure minimum bounds
    cropRegion.originX = Math.max(0, cropRegion.originX);
    cropRegion.originY = Math.max(0, cropRegion.originY);

    // Ensure crop region has valid dimensions
    if (cropRegion.width <= 0 || cropRegion.height <= 0) {
      throw new Error(`Invalid crop dimensions: ${cropRegion.width}x${cropRegion.height}`);
    }

    console.log('✂️ Final crop region:', cropRegion);

    const result = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ crop: cropRegion }],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('✅ Crop successful:', {
      uri: result.uri,
      width: result.width,
      height: result.height,
    });
    return {
      success: true,
      uri: result.uri,
    };
  } catch (error) {
    console.error('❌ Crop error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown crop error',
    };
  }
}

/**
 * Get actual dimensions of a captured photo
 *expo-camera's takePictureAsync returns width/height in the result
 */
export function getPhotoDimensions(photo: {
  width?: number;
  height?: number;
}): { width: number; height: number } {
  const dimensions = {
    width: photo.width || SCREEN_WIDTH,
    height: photo.height || SCREEN_HEIGHT,
  };
  console.log('📏 getPhotoDimensions:', dimensions);
  return dimensions;
}
