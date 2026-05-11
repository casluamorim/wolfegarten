// Gera um poster JPEG a partir do primeiro frame de um vídeo, no client.
// Usado para preview na biblioteca e como poster nativo do <video>.

export interface VideoMeta {
  posterBlob: Blob | null;
  width: number;
  height: number;
  duration: number;
}

export async function probeVideo(file: File): Promise<VideoMeta> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      v.remove();
    };

    const fail = () => {
      cleanup();
      resolve({ posterBlob: null, width: 0, height: 0, duration: 0 });
    };

    v.onloadedmetadata = () => {
      // pula um pouco para garantir frame visível
      try {
        v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
      } catch {
        fail();
      }
    };

    v.onseeked = () => {
      try {
        const w = v.videoWidth;
        const h = v.videoHeight;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return fail();
        ctx.drawImage(v, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve({ posterBlob: blob, width: w, height: h, duration: v.duration || 0 });
          },
          "image/jpeg",
          0.82,
        );
      } catch {
        fail();
      }
    };

    v.onerror = fail;
  });
}
