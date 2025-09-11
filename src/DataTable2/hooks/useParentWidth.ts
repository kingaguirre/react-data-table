import { useLayoutEffect, useRef, useState } from "react";

export function useParentWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const next = el.clientWidth;
      setW((prev) => (prev !== next ? next : prev));
    });
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return { ref, width: w };
}
