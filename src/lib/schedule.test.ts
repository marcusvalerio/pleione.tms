import { describe, expect, it } from "vitest";
import { fmtClock, schedule } from "./schedule";

describe("schedule", () => {
  it("soma trecho e descarga, e espera a janela abrir", () => {
    const r = schedule("06:00", [60, 30], [
      { window: ["08:00", "12:00"], serviceMin: 20 },
      { window: null, serviceMin: 20 },
    ]);
    expect(fmtClock(r[0].arrive)).toBe("07:00");
    expect(r[0].status).toBe("wait");
    expect(r[0].waitMin).toBe(60);
    expect(fmtClock(r[0].leave)).toBe("08:20");
    expect(fmtClock(r[1].arrive)).toBe("08:50");
    expect(r[1].status).toBe("ok");
  });

  it("marca fora da janela quando chega depois do fechamento", () => {
    const r = schedule("10:00", [180], [{ window: ["08:00", "12:00"], serviceMin: 20 }]);
    expect(r[0].status).toBe("late");
  });

  it("mostra o dia seguinte", () => {
    expect(fmtClock(1500)).toBe("01:00 (+1d)");
  });
});
