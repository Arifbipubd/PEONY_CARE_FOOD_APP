import { Image } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Longest edge after resize — enough for food cards, small enough to upload reliably. */
const MAX_LONG_EDGE = 1280;
const JPEG_QUALITY = 0.7;

export type CompressedImage = {
  uri: string;
  name: string;
  mimeType: 'image/jpeg' | 'image/png';
};

function fallbackFromUri(uri: string): CompressedImage {
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpeg';
  return {
    uri,
    name: filename,
    mimeType: ext === 'png' ? 'image/png' : 'image/jpeg',
  };
}

function getImageSize(uri: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve(null),
    );
  });
}

/**
 * Shrinks a local photo and saves it as JPEG so uploads stay small and fast.
 * If compression fails, returns the original file so the upload can still proceed.
 */
export async function compressImageForUpload(uri: string): Promise<CompressedImage> {
  try {
    const size = await getImageSize(uri);
    const context = ImageManipulator.manipulate(uri);

    if (size) {
      const longEdge = Math.max(size.width, size.height);
      if (longEdge > MAX_LONG_EDGE) {
        const scale = MAX_LONG_EDGE / longEdge;
        context.resize({
          width: Math.round(size.width * scale),
          height: Math.round(size.height * scale),
        });
      }
    } else {
      context.resize({ width: MAX_LONG_EDGE });
    }

    const image = await context.renderAsync();
    const result = await image.saveAsync({
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });

    return {
      uri: result.uri,
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
    };
  } catch {
    return fallbackFromUri(uri);
  }
}
