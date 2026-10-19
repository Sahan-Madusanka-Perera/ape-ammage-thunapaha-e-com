export const DISTRICTS = [
  { key: "Ampara", si: "අම්පාර" },
  { key: "Anuradhapura", si: "අනුරාධපුරය" },
  { key: "Badulla", si: "බදුල්ල" },
  { key: "Batticaloa", si: "මඩකලපුව" },
  { key: "Colombo", si: "කොළඹ" },
  { key: "Galle", si: "ගාල්ල" },
  { key: "Gampaha", si: "ගම්පහ" },
  { key: "Hambantota", si: "හම්බන්තොට" },
  { key: "Jaffna", si: "යාපනය" },
  { key: "Kalutara", si: "කළුතර" },
  { key: "Kandy", si: "මහනුවර" },
  { key: "Kegalle", si: "කෑගල්ල" },
  { key: "Kilinochchi", si: "කිලිනොච්චිය" },
  { key: "Kurunegala", si: "කුරුණෑගල" },
  { key: "Mannar", si: "මන්නාරම" },
  { key: "Matale", si: "මාතලේ" },
  { key: "Matara", si: "මාතර" },
  { key: "Monaragala", si: "මොණරාගල" },
  { key: "Mullaitivu", si: "මුලතිව්" },
  { key: "Nuwara Eliya", si: "නුවරඑළිය" },
  { key: "Polonnaruwa", si: "පොළොන්නරුව" },
  { key: "Puttalam", si: "පුත්තලම" },
  { key: "Ratnapura", si: "රත්නපුර" },
  { key: "Trincomalee", si: "ත්‍රිකුණාමලය" },
  { key: "Vavuniya", si: "වව්නියාව" },
] as const;

export type DistrictKey = (typeof DISTRICTS)[number]["key"];

export function isDistrict(value: string): value is DistrictKey {
  return DISTRICTS.some((d) => d.key === value);
}

export function districtName(key: string, lang: "en" | "si"): string {
  const d = DISTRICTS.find((x) => x.key === key);
  if (!d) return key;
  return lang === "si" ? d.si : d.key;
}

export type Rate = { baseFee: number; perExtraKg: number };

export type DeliveryRates = Rate & {
  freeOver: number | null;
  overrides: Record<string, Rate>;
};

/** Billable kilos: every started kilo counts, minimum one. */
export function billableKg(totalGrams: number): number {
  return Math.max(1, Math.ceil(totalGrams / 1000));
}

export function rateFor(rates: DeliveryRates, district: string): Rate {
  return rates.overrides[district] ?? { baseFee: rates.baseFee, perExtraKg: rates.perExtraKg };
}

export function deliveryFee(
  rates: DeliveryRates,
  district: string,
  totalGrams: number,
  subtotal: number,
): number {
  if (totalGrams <= 0) return 0;
  if (rates.freeOver !== null && subtotal >= rates.freeOver) return 0;
  const rate = rateFor(rates, district);
  return rate.baseFee + (billableKg(totalGrams) - 1) * rate.perExtraKg;
}
