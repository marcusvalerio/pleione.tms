import { describe, expect, it } from "vitest";
import { hashPassword, passwordProblem, verifyPassword } from "./password";
import { createToken, verifyToken } from "./token";

describe("senha", () => {
  it("confere a senha certa e recusa a errada", async () => {
    const h = await hashPassword("pleione-demo");
    expect(await verifyPassword("pleione-demo", h)).toBe(true);
    expect(await verifyPassword("outra-senha1", h)).toBe(false);
    expect(await verifyPassword("x", null)).toBe(false);
  });
  it("exige 10 caracteres com letras e números", () => {
    expect(passwordProblem("curta1")).not.toBeNull();
    expect(passwordProblem("semnumeroaqui")).not.toBeNull();
    expect(passwordProblem("boa-senha-2026")).toBeNull();
  });
});

describe("token de sessão", () => {
  const secret = "s".repeat(40);
  it("valida o token assinado e recusa adulterado ou vencido", () => {
    const t = createToken("u1", 60, secret);
    expect(verifyToken(t, secret)?.uid).toBe("u1");
    expect(verifyToken(t, "x".repeat(40))).toBeNull();
    const [data, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "admin", exp: 9e9 })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`, secret)).toBeNull();
    expect(verifyToken(createToken("u1", -1, secret), secret)).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });
});
