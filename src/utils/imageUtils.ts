/**
 * imageUtils.ts
 * Client-side image compression before sending to Gemini API.
 * Reduces image size dramatically to avoid token limits and speed up requests.
 */

/**
 * Compresses a base64-encoded image by resizing it to a max dimension
 * and reducing JPEG quality. Returns a new base64 string (WITHOUT the data: prefix).
 */
export async function compressImage(
  base64DataUrl: string,
  maxDimension = 800,
  quality = 0.75
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down to maxDimension if needed
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
      if (!ctx) return reject(new Error('Could not get canvas context'));
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = compressedDataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64DataUrl;
  });
}
