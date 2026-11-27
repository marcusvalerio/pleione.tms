"use client";

import { useEffect, useRef, useState } from "react";

/** Número que conta até o valor ao aparecer (1,4 s). Com "reduzir movimento", mostra o valor direto. */
export function CountUp({ value, decimals = 0, duration = 1400 }: { value: number; decimals?: number; duration?: number }) {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [shown, setShown] = useState(fmt(value));
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ran.current = true;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setShown(fmt(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <span className="tabular-nums">{shown}</span>;
}
