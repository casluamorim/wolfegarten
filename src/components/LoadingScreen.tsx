import { useEffect, useState } from "react";
import { useSiteAsset } from "@/hooks/use-site-asset";

export function LoadingScreen() {
  const logo = useSiteAsset("logo-main");
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Premium minimal: 0.9s logo, 0.5s fade.
    const t1 = setTimeout(() => setDone(true), 900);
    const t2 = setTimeout(() => setHidden(true), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-5">
        {logo ? (
          <img src={logo} alt="" className="h-10 w-auto animate-fade-up md:h-12" />
        ) : (
          <div className="font-serif text-2xl tracking-luxe text-offwhite animate-fade-up">
            WÖLFEGARTEN
          </div>
        )}
        <div className="h-px w-10 bg-gold/60 animate-glow" />
      </div>
    </div>
  );
}
