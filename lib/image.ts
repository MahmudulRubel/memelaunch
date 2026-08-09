/**
 * Utility function to compress images using Canvas.
 * Returns a Blob containing the compressed image data.
 */
/**
 * Utility function to compress images using Canvas.
 * Returns a Blob containing the compressed image data, or the original file if compression fails.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<Blob> {
  // If not in browser context or file is invalid, return original file
  if (typeof window === 'undefined' || !file || !(file instanceof Blob)) {
    return file;
  }

  // Do not compress SVG files as canvas rasterizes and can break vector scaling
  if (file.type === 'image/svg+xml' || file.name?.endsWith('.svg')) {
    return file;
  }

  return new Promise((resolve) => {
    let objectUrl: string | null = null;

    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // Failed to create object URL, will fallback to FileReader
    }

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore cleanup error
        }
      }
    };

    const attemptCanvasCompression = (img: HTMLImageElement) => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          cleanup();
          resolve(file);
          return;
        }

        // Maintain aspect ratio while limiting max dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          mimeType,
          quality
        );
      } catch {
        cleanup();
        resolve(file);
      }
    };

    if (objectUrl) {
      const img = new Image();
      img.onload = () => attemptCanvasCompression(img);
      img.onerror = () => {
        cleanup();
        // Fallback to FileReader if objectUrl failed
        fallbackFileReader();
      };
      img.src = objectUrl;
    } else {
      fallbackFileReader();
    }

    function fallbackFileReader() {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const img = new Image();
            img.onload = () => attemptCanvasCompression(img);
            img.onerror = () => resolve(file);
            img.src = result;
          } else {
            resolve(file);
          }
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
      } catch {
        resolve(file);
      }
    }
  });
}
