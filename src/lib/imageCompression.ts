/**
 * Client-Side Image Compression & Validation Utility
 * Compresses raster images in-browser using HTML5 Canvas before uploading to Cloudinary.
 * Enforces strict image-only file type constraints.
 */

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetType?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  originalFormat: string;
  compressedFormat: string;
}

/**
 * Checks whether a file is an authorized image MIME type.
 */
export function isImageFile(file: File): boolean {
  if (!file) return false;
  return ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) || file.type.startsWith("image/");
}

/**
 * Formats bytes into a human-readable string (e.g. "450 KB", "1.8 MB").
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates and compresses an image file before upload.
 * Rejects non-image files with an explicit error.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    targetType = "image/webp",
  } = options;

  // 1. Strict image-only validation
  const lowerType = file.type.toLowerCase();
  const isAllowed = ALLOWED_IMAGE_TYPES.includes(lowerType);
  if (!isAllowed) {
    throw new Error(
      `Unsupported file type (${file.type || "unknown"}). Only image files (JPG, PNG, WebP, GIF) are allowed.`
    );
  }

  const originalSize = file.size;

  // 2. Pass-through for animated GIFs or tiny images (< 40KB) where re-encoding might inflate or strip frames
  if (lowerType === "image/gif") {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savingsPercent: 0,
      width: 0,
      height: 0,
      originalFormat: file.type,
      compressedFormat: file.type,
    };
  }

  // 3. Load image into memory
  const imgUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to parse image data. Please ensure it is a valid image file."));
    image.src = imgUrl;
  });

  try {
    let { width, height } = img;

    // 4. Calculate aspect-ratio-preserved bounding dimensions
    if (width > maxWidth || height > maxHeight) {
      if (width / maxWidth > height / maxHeight) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    // 5. Draw onto canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context initialization failed.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // 6. Compress to target Blob
    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), targetType, quality);
    });

    if (!compressedBlob) {
      throw new Error("Failed to compress image.");
    }

    // 7. If compressed version is somehow larger than original, return original
    if (compressedBlob.size >= originalSize) {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        savingsPercent: 0,
        width,
        height,
        originalFormat: file.type,
        compressedFormat: file.type,
      };
    }

    // Create a new File from compressed Blob
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const ext = targetType === "image/webp" ? "webp" : "jpg";
    const compressedFile = new File([compressedBlob], `${baseName}.${ext}`, {
      type: targetType,
      lastModified: Date.now(),
    });

    const savingsPercent = Math.round(((originalSize - compressedBlob.size) / originalSize) * 100);

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedBlob.size,
      savingsPercent,
      width,
      height,
      originalFormat: file.type,
      compressedFormat: targetType,
    };
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}
