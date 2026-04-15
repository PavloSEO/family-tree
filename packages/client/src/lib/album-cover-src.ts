/** URL превью обложки альбома (`thumbnail` или `src` из API). */
export function albumCoverSrc(rel: string | null): string | null {
  if (!rel) {
    return null;
  }
  if (rel.startsWith("http://") || rel.startsWith("https://")) {
    return rel;
  }
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return `${base}/api/photos/file/${encodeURIComponent(rel)}`;
}
