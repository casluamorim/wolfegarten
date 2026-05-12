import { createContext, useCallback, useContext, useRef, useState } from "react";

interface Ctx {
  current: string | null;
  setCurrent: (id: string | null) => void;
  register: (id: string, pause: () => void) => void;
  unregister: (id: string) => void;
}

const VideoCtx = createContext<Ctx | null>(null);

export function VideoPlaybackProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrentState] = useState<string | null>(null);
  const pausers = useRef(new Map<string, () => void>());

  const setCurrent = useCallback((id: string | null) => {
    setCurrentState((prev) => {
      if (prev && prev !== id) {
        pausers.current.get(prev)?.();
      }
      return id;
    });
  }, []);

  const register = useCallback((id: string, pause: () => void) => {
    pausers.current.set(id, pause);
  }, []);

  const unregister = useCallback((id: string) => {
    pausers.current.delete(id);
  }, []);

  return (
    <VideoCtx.Provider value={{ current, setCurrent, register, unregister }}>
      {children}
    </VideoCtx.Provider>
  );
}

export function useVideoPlayback() {
  return useContext(VideoCtx);
}
