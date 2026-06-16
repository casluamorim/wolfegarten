// Helpers para deixar imagens do Supabase Storage mais rápidas:
// usa o endpoint de Image Transformations (render/image) para entregar
// versões redimensionadas/comprimidas. Se falhar, basta usar a URL original
// como fallback (via onError).

export interface ImgOpts {
  width?: number;
  height?: number;
  quality?: number; // 20-100
  resize?: "cover" | "contain" | "fill";
}

const STORAGE_OBJECT = "/storage/v1/object/public/";
const STORAGE_RENDER = "/storage/v1/render/image/public/";

export function optimizeImageUrl(url: string | undefined | null, opts: ImgOpts = {}): string {
  if (!url) return "";
  if (!url.includes(STORAGE_OBJECT)) return url;
  const { width, height, quality = 78, resize = "cover" } = opts;
  const base = url.replace(STORAGE_OBJECT, STORAGE_RENDER);
  const params = new URLSearchParams();
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  if (width || height) params.set("resize", resize);
  return `${base}?${params.toString()}`;
}

/** Constrói srcset com múltiplas larguras (responsivo). */
export function srcSet(url: string | undefined | null, widths: number[], quality = 78): string {
  if (!url) return "";
  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w, quality })} ${w}w`)
    .join(", ");
}

/** onError handler que volta para a URL original (caso transform falhe). */
export function fallbackToOriginal(original: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.srcset = "";
    img.src = original;
  };
}
