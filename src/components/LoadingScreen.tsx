import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), 2000);
    const t2 = setTimeout(() => setHidden(true), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-forest-deep transition-opacity duration-700"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="text-[10px] tracking-luxe text-gold animate-fade-up">WOLFEGARTEN</div>
        <div className="gold-divider animate-glow" />
        <div
          className="text-[9px] tracking-wide-luxe text-muted-foreground animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          EXPERIÊNCIA EXCLUSIVA
        </div>
      </div>
    </div>
  );
}
