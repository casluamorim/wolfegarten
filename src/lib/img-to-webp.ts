// Conversão client-side de PNG/JPG para WebP. Mantém qualidade premium.
// Devolve o arquivo original quando não é imagem rasterizada (SVG/WebP/etc).

const RASTER = ["image/png", "image/jpeg", "image/jpg"];

export async function toWebpIfRaster(file: File, quality = 0.9, maxDim = 3200): Promise<File> {
  if (!RASTER.includes(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/webp", quality),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.(png|jpe?g)$/i, ".webp");
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB original
export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

export function humanBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
