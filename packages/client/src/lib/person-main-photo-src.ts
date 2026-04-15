/** mainPhoto preview URL (relative path or absolute URL). */
export function mainPhotoSrc(mainPhoto: string | null): string | null {
  if (!mainPhoto) {
    return null;
  }
  if (mainPhoto.startsWith("http://") || mainPhoto.startsWith("https://")) {
    return mainPhoto;
  }
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return `${base}/api/photos/file/${encodeURIComponent(mainPhoto)}`;
}
