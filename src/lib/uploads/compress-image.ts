import { EVENT_IMAGE_COMPRESS_ABOVE_BYTES } from "@/constants/uploads";

const SKIP_TYPES = new Set(["image/gif", "image/svg+xml"]);
const MAX_DIMENSION = 1920;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function scaledSize(width: number, height: number) {
  const longest = Math.max(width, height);
  if (longest <= MAX_DIMENSION) {
    return { width, height };
  }
  const scale = MAX_DIMENSION / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Compress raster images larger than 1 MB so uploads stay under proxy limits.
 * GIFs and SVGs are left untouched.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= EVENT_IMAGE_COMPRESS_ABOVE_BYTES) {
    return file;
  }
  if (SKIP_TYPES.has(file.type) || !file.type.startsWith("image/")) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const { width, height } = scaledSize(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }
    context.drawImage(image, 0, 0, width, height);

    const outputType = "image/jpeg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const extension = "jpg";

    let best: Blob | null = null;
    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, outputType, quality);
      if (!blob) {
        continue;
      }
      best = blob;
      if (blob.size <= EVENT_IMAGE_COMPRESS_ABOVE_BYTES) {
        break;
      }
    }

    if (!best || best.size >= file.size) {
      return file;
    }

    return new File([best], `${baseName}.${extension}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
