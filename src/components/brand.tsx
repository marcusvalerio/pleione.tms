/**
 * Símbolo PLEIONE: rota curva com sete paradas quadradas (as sete Plêiades) e o destino em Ember.
 * Geometria fixa: não redesenhe à mão, use <PleioneMark />.
 */
export const PLEIONE_STOPS: readonly [number, number, number][] = [
  // x, y, lado (viewBox 100×100)
  [6, 68, 12],
  [21, 49, 8],
  [34, 51, 9],
  [42, 36, 8],
  [56, 18, 9],
  [69, 13, 7],
];

export function PleioneMark({ size = 32, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="currentColor"
    >
      <path d="M12 74 C 18 40, 40 62, 46 40 S 70 10, 88 24" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" />
      {PLEIONE_STOPS.map(([x, y, s]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={s} height={s} />
      ))}
      <rect x={80} y={16} width={15} height={15} fill="#FF5F1F" />
    </svg>
  );
}

export function PleioneLogo({ size = 28, descriptor = true }: { size?: number; descriptor?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex items-center justify-center rounded-md bg-pine p-1 text-cream" style={{ width: size + 6, height: size + 6 }}>
        <PleioneMark size={size - 2} />
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl tracking-tight text-fg lowercase">pleione</span>
        {descriptor ? <span className="mt-0.5 block font-mono text-[10px] text-muted">gestão de transportes</span> : null}
      </span>
    </span>
  );
}
