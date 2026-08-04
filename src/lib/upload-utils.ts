import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Compresses an image file and converts it to a Base64 data URL string.
 * Keeps file size under ~150KB for safe Firestore storage.
 */
export function compressImageToBase64(file: File, maxDimension = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

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
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Storage. If Firebase Storage fails (e.g. storage rules,
 * unauthenticated session, quota, CORS), falls back to compressed Base64 data URL.
 */
export async function uploadImageWithFallback(file: File, folder: string): Promise<string> {
  try {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageRef = ref(storage, `${folder}/${Date.now()}_${safeFileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadResult.ref);
  } catch (error) {
    console.warn(`Firebase Storage upload failed for ${folder}/${file.name}. Falling back to compressed base64 image:`, error);
    return await compressImageToBase64(file);
  }
}
