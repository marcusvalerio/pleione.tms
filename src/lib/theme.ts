export const THEME_COOKIE = "astraeus-theme";
export type ThemePref = "light" | "dark" | "system";

export function parseTheme(value: string | undefined): ThemePref {
  return value === "light" || value === "dark" ? value : "system";
}
