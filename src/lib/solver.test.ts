import { describe, expect, it } from "vitest";
import { solve } from "./solver";

// origem 0; A perto (30 min), B longe (120 min). A↔B 100 min.
const durations = [
  [0, 30, 120],
  [30, 0, 100],
  [120, 100, 0],
];
const distances = durations.map((r) => r.map((m) => m));

describe("solve", () => {
  it("sem janela, vai primeiro na parada mais perto", () => {
    const r = solve({ durations, distances, departure: "06:00", stops: [{ serviceMin: 0 }, { serviceMin: 0 }] });
    expect(r.order).toEqual([0, 1]);
    expect(r.lateMin).toBe(0);
  });

  it("a janela que fecha cedo muda a ordem, mesmo andando mais", () => {
    const r = solve({
      durations,
      distances,
      departure: "06:00",
      stops: [{ serviceMin: 0 }, { serviceMin: 0, window: ["06:00", "08:30"] }],
    });
    // A primeiro chegaria em B às 08:10 (ok) — então mantém; com janela até 08:05, inverte
    expect(r.order).toEqual([0, 1]);
    const tight = solve({
      durations,
      distances,
      departure: "06:00",
      stops: [{ serviceMin: 0 }, { serviceMin: 0, window: ["06:00", "08:05"] }],
    });
    expect(tight.order).toEqual([1, 0]);
    expect(tight.lateMin).toBe(0);
  });

  it("resolve mais de 8 paradas com a heurística", () => {
    const n = 10;
    const pts = Array.from({ length: n + 1 }, (_, i) => i * 10);
    const m = pts.map((a) => pts.map((b) => Math.abs(a - b)));
    const r = solve({ durations: m, distances: m, departure: "06:00", stops: Array.from({ length: n }, () => ({ serviceMin: 0 })) });
    expect(r.order).toEqual(Array.from({ length: n }, (_, i) => i));
  });
});
