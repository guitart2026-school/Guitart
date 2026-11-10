export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export interface CloudinaryDeleteResponse {
  success: boolean;
  result?: string;
  public_id?: string;
  error?: string;
}

/**
 * Checks if a given string is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com');
}

/**
 * Extracts public_id from a Cloudinary URL or returns the id as is
 */
export function extractCloudinaryPublicId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/\.[^/.]+$/, '');
  }

  if (!trimmed.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const urlObj = new URL(trimmed);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) return null;

    let subParts = pathParts.slice(uploadIndex + 1);
    if (subParts[0] && /^v\d+$/.test(subParts[0])) {
      subParts = subParts.slice(1);
    }

    const fullPathWithExt = subParts.join('/');
    return fullPathWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

/**
 * Uploads an image file directly to Cloudinary via the /api/upload endpoint.
 * Enforces Cloudinary-only storage with NO local or base64 fallback.
 * 
 * @param file The image File object from an <input type="file" />
 * @param folder Optional Cloudinary folder path (defaults to 'guitart_academy')
 * @returns Promise resolving to Cloudinary upload response with secure URL
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'guitart_academy'
): Promise<CloudinaryUploadResponse> {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
    throw new Error(`File is not an image (${file.type || 'unknown'}). Please select a valid image file (.png, .jpg, .ico, .svg, .webp).`);
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error(`Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error || `Upload failed with status code ${response.status}`);
  }

  return data;
}

/**
 * Deletes an image from Cloudinary by its public ID or full Cloudinary URL.
 * 
 * @param publicIdOrUrl The public_id or the full Cloudinary URL of the image
 * @returns Promise resolving to Cloudinary delete response
 */
export async function deleteImageFromCloudinary(
  publicIdOrUrl: string
): Promise<CloudinaryDeleteResponse> {
  if (!publicIdOrUrl) {
    throw new Error('No image URL or ID provided for deletion.');
  }

  const response = await fetch(
    `/api/upload?url=${encodeURIComponent(publicIdOrUrl)}`,
    {
      method: 'DELETE',
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error || `Failed to delete image (status ${response.status})`);
  }

  return data;
}
