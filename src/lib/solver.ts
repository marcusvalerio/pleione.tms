/**
 * Sequenciamento de entregas com janela de horário (TSP com janelas, versão prática).
 * Entrada: matriz de tempos (min) e distâncias (km) entre origem (índice 0) e paradas (1..n).
 * Objetivo, em ordem de prioridade:
 *   1. menos minutos de atraso em relação às janelas;
 *   2. menor horário de término (inclui esperas);
 *   3. menor distância.
 * Até 8 paradas testa todas as ordens (exato). Acima disso, vizinho mais próximo + 2-opt.
 */
import { schedule, type ScheduleStop } from "./schedule";

export interface SolverInput {
  durations: number[][]; // minutos
  distances: number[][]; // km
  stops: ScheduleStop[]; // n paradas (sem a origem)
  departure: string;
}

export interface SolverResult {
  order: number[]; // índices 0..n-1 das paradas
  lateMin: number;
  finish: number;
  km: number;
}

export function evaluate(input: SolverInput, order: number[]) {
  const legs: number[] = [];
  let km = 0;
  let prev = 0;
  for (const i of order) {
    legs.push(input.durations[prev][i + 1]);
    km += input.distances[prev][i + 1];
    prev = i + 1;
  }
  const times = schedule(
    input.departure,
    legs,
    order.map((i) => input.stops[i]),
  );
  let lateMin = 0;
  times.forEach((t, k) => {
    const w = input.stops[order[k]].window;
    if (t.status === "late" && w) {
      const [h, m] = w[1].split(":").map(Number);
      lateMin += t.arrive - (Math.floor(t.arrive / 1440) * 1440 + h * 60 + m);
    }
  });
  return { lateMin, finish: times.length ? times[times.length - 1].leave : 0, km };
}

const better = (a: Omit<SolverResult, "order">, b: Omit<SolverResult, "order">) =>
  a.lateMin !== b.lateMin ? a.lateMin < b.lateMin : Math.abs(a.finish - b.finish) > 0.5 ? a.finish < b.finish : a.km < b.km;

export function solve(input: SolverInput): SolverResult {
  const n = input.stops.length;
  const ids = Array.from({ length: n }, (_, i) => i);
  if (n <= 1) return { order: ids, ...evaluate(input, ids) };

  if (n <= 8) {
    let best: SolverResult | null = null;
    for (const perm of permutations(ids)) {
      const e = evaluate(input, perm);
      if (!best || better(e, best)) best = { order: perm.slice(), ...e };
    }
    return best!;
  }

  // vizinho mais próximo pelo tempo, depois 2-opt sobre o custo completo
  const left = new Set(ids);
  const order: number[] = [];
  let at = 0;
  while (left.size) {
    let pick = -1;
    for (const i of left) if (pick < 0 || input.durations[at][i + 1] < input.durations[at][pick + 1]) pick = i;
    order.push(pick);
    left.delete(pick);
    at = pick + 1;
  }
  let best: SolverResult = { order, ...evaluate(input, order) };
  let improved = true;
  while (improved) {
    improved = false;
    for (let a = 0; a < n - 1; a++) {
      for (let b = a + 1; b < n; b++) {
        const cand = [...best.order.slice(0, a), ...best.order.slice(a, b + 1).reverse(), ...best.order.slice(b + 1)];
        const e = evaluate(input, cand);
        if (better(e, best)) {
          best = { order: cand, ...e };
          improved = true;
        }
      }
    }
  }
  return best;
}

function* permutations(arr: number[]): Generator<number[]> {
  // algoritmo de Heap
  const a = arr.slice();
  const c = new Array(a.length).fill(0);
  yield a;
  let i = 0;
  while (i < a.length) {
    if (c[i] < i) {
      const j = i % 2 === 0 ? 0 : c[i];
      [a[j], a[i]] = [a[i], a[j]];
      yield a;
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
}
