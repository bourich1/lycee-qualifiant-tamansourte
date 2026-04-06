import { useState, useRef, useCallback, useEffect, useMemo } from "react";

const CELL = 80;
const GAP = 2;
const FADE_DUR = 600;

export default function PixelGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [cells2, setCells2] = useState<Record<string, { opacity: number; hovered: boolean }>>({});
  const animRefs = useRef<Record<string, number>>({});
  const hoveredRef = useRef(new Set<string>());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    setDims({ w: el.offsetWidth, h: el.offsetHeight });
    return () => obs.disconnect();
  }, []);

  const cols = Math.ceil(dims.w / (CELL + GAP));
  const rows = Math.ceil(dims.h / (CELL + GAP));

  const cellList = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        arr.push(`${r}-${c}`);
    return arr;
  }, [cols, rows]);

  const startFade = useCallback((id: string) => {
    if (animRefs.current[id]) cancelAnimationFrame(animRefs.current[id]);
    const start = performance.now();
    const tick = (now: number) => {
      if (hoveredRef.current.has(id)) return;
      const t = Math.min((now - start) / FADE_DUR, 1);
      const opacity = 1 - t;
      setCells2((prev) => ({ ...prev, [id]: { opacity, hovered: false } }));
      if (t < 1) {
        animRefs.current[id] = requestAnimationFrame(tick);
      } else {
        setCells2((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
        delete animRefs.current[id];
      }
    };
    animRefs.current[id] = requestAnimationFrame(tick);
  }, []);

  const onEnter = useCallback((id: string) => {
    hoveredRef.current.add(id);
    if (animRefs.current[id]) {
      cancelAnimationFrame(animRefs.current[id]);
      delete animRefs.current[id];
    }
    setCells2((prev) => ({ ...prev, [id]: { opacity: 1, hovered: true } }));
  }, []);

  const onLeave = useCallback((id: string) => {
    hoveredRef.current.delete(id);
    startFade(id);
  }, [startFade]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0 opacity-40 pointer-events-auto"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
        gap: `${GAP}px`,
        padding: `${GAP}px`,
        width: "100%",
        height: "100%",
        background: "transparent",
        overflow: "hidden",
        cursor: "default",
        boxSizing: "border-box",
      }}
    >
      {dims.w > 0 &&
        cellList.map((id) => {
          const state = cells2[id];
          const opacity = state ? state.opacity : 0;
          return (
            <div
              key={id}
              onMouseEnter={() => onEnter(id)}
              onMouseLeave={() => onLeave(id)}
              style={{
                width: CELL,
                height: CELL,
                boxSizing: "border-box",
                borderRadius: "6px",
                border: "1px solid rgba(36, 87, 255, 0.1)",
                background:
                  opacity > 0 ? `rgba(36, 87, 255, ${opacity * 0.2})` : "transparent",
                willChange: "background",
              }}
            />
          );
        })}
    </div>
  );
}
