import { PleioneMark } from "@/components/brand";

/** Carregando: a onda percorre os 21 raios; a forma não gira (o anel girando é do ORION). */
export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="grid justify-items-center gap-3 text-fg">
        <PleioneMark size={56} motion="loading" />
        <span className="font-mono text-xs text-muted">carregando</span>
      </div>
    </div>
  );
}
