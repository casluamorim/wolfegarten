import { useText } from "@/hooks/use-site-content";
import { SmartVideo, type SmartVideoSource } from "@/components/SmartVideo";
import { optimizeImageUrl, srcSet, fallbackToOriginal } from "@/lib/img-url";

function inferType(url: string): string | undefined {
  const u = url.toLowerCase().split("?")[0];
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".mov")) return "video/quicktime";
  return undefined;
}

interface Props {
  /** prefixo no site_content, ex.: "phase2.home.conceito" */
  baseKey: string;
  fallbackImage?: string;
  className?: string;
  alt?: string;
}

/**
 * Lê {baseKey}.media_type ("image" | "video"),
 * e então {baseKey}.image_url ou {baseKey}.video_url + .video_poster.
 */
export function FlexibleMedia({ baseKey, fallbackImage, className = "", alt = "" }: Props) {
  const type = useText(`${baseKey}.media_type`, "image");
  const image = useText(`${baseKey}.image_url`, "");
  const video = useText(`${baseKey}.video_url`, "");
  const poster = useText(`${baseKey}.video_poster`, "");

  if (type === "video" && video) {
    const sources: SmartVideoSource[] = [{ src: video, type: inferType(video) }];
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <SmartVideo
          sources={sources}
          poster={poster || image || fallbackImage}
          autoPlay
          loop
          ariaLabel={alt}
        />
      </div>
    );
  }

  const src = image || fallbackImage;
  if (!src) {
    return (
      <div className={`relative h-full w-full bg-card ${className}`} aria-hidden="true" />
    );
  }
  return (
    <img
      src={optimizeImageUrl(src, { width: 1280, quality: 78 })}
      srcSet={srcSet(src, [640, 960, 1280, 1600], 78)}
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={fallbackToOriginal(src)}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
