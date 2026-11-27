/**
 * Horários previstos de uma rota: saída + tempo de cada trecho + tempo de descarga em cada parada.
 * Se o caminhão chegar antes da janela, espera abrir; se chegar depois, a parada fica "fora da janela".
 */
export interface ScheduleStop {
  window?: [string, string] | null;
  serviceMin: number;
}

export interface ScheduledStop {
  arrive: number; // minutos desde 00:00
  start: number; // início da descarga (após esperar a janela abrir)
  leave: number;
  waitMin: number;
  status: "ok" | "wait" | "late";
}

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const fmtClock = (min: number) => {
  const day = Math.floor(min / 1440);
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const s = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return day > 0 ? `${s} (+${day}d)` : s;
};

export const fmtDuration = (min: number) => `${Math.floor(min / 60)}h${String(Math.round(min % 60)).padStart(2, "0")}`;

export function schedule(departure: string, legMin: number[], stops: ScheduleStop[]): ScheduledStop[] {
  let t = toMin(departure);
  return stops.map((s, i) => {
    const arrive = t + (legMin[i] ?? 0);
    let start = arrive;
    let status: ScheduledStop["status"] = "ok";
    if (s.window) {
      const open = toMin(s.window[0]);
      const close = toMin(s.window[1]);
      // janelas valem para o dia da chegada
      const dayBase = Math.floor(arrive / 1440) * 1440;
      if (arrive < dayBase + open) {
        start = dayBase + open;
        status = "wait";
      } else if (arrive > dayBase + close) status = "late";
    }
    const leave = start + s.serviceMin;
    t = leave;
    return { arrive, start, leave, waitMin: start - arrive, status };
  });
}
