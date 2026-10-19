const INK = "#1c130e";
const LIME = "#f8f6f1";

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Linear mix in sRGB; t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const ca = parse(a);
  const cb = parse(b);
  return toHex([0, 1, 2].map((i) => ca[i] + (cb[i] - ca[i]) * t) as [number, number, number]);
}

function luminance(hex: string): number {
  const [r, g, b] = parse(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Lime or ink, whichever reads better on the given pigment. */
export function textOn(pigment: string): string {
  return contrast(pigment, LIME) >= contrast(pigment, INK) ? LIME : INK;
}

export function isHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
