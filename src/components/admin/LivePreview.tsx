import { useEffect, useState } from "react";
import { Monitor, Smartphone, ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  path?: string;
  heightOffset?: number;
}

export function LivePreview({ path = "/", heightOffset = 260 }: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);
  const [currentPath, setCurrentPath] = useState(path);
  const width = device === "desktop" ? "100%" : "390px";

  useEffect(() => {
    setCurrentPath(path);
    setKey((k) => k + 1);
  }, [path]);

  return (
    <div className="sticky top-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="text-[10px] tracking-luxe text-muted-foreground">PREVIEW</div>
          <code className="truncate rounded bg-card px-2 py-0.5 text-[10px] text-gold/80">
            {currentPath}
          </code>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`rounded p-1.5 transition-colors ${
              device === "desktop" ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-offwhite"
            }`}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`rounded p-1.5 transition-colors ${
              device === "mobile" ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-offwhite"
            }`}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded p-1.5 text-muted-foreground hover:text-offwhite"
            title="Recarregar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href={currentPath}
            target="_blank"
            rel="noreferrer"
            className="rounded p-1.5 text-muted-foreground hover:text-offwhite"
            title="Abrir em nova aba"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded border border-border bg-card">
        <div className="flex items-center justify-center bg-background/50 p-2">
          <iframe
            key={key}
            src={currentPath}
            title="Preview"
            style={{ width, height: `calc(100vh - ${heightOffset}px)`, border: 0 }}
            className="rounded bg-background transition-all"
          />
        </div>
      </div>
    </div>
  );
}
