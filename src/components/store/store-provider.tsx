"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Lang } from "@/lib/format";
import type { BagLine, CatalogCategory, CatalogProduct, CatalogVariant } from "@/lib/types";

const KEY = "aat-bag-v1";
const EMPTY: BagLine[] = [];

let snapshot: BagLine[] | null = null;
const listeners = new Set<() => void>();

function sanitise(value: unknown): BagLine[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (l): l is BagLine =>
        typeof l?.variantId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0,
    )
    .map((l) => ({ variantId: l.variantId, quantity: Math.min(l.quantity, 50) }));
}

function read(): BagLine[] {
  if (snapshot) return snapshot;
  try {
    snapshot = sanitise(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    snapshot = [];
  }
  return snapshot;
}

function write(lines: BagLine[]) {
  snapshot = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or full storage: the bag still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export type PricedLine = {
  variantId: string;
  quantity: number;
  product: CatalogProduct | null;
  variant: CatalogVariant | null;
  lineTotal: number;
  available: boolean;
};

type StoreContextValue = {
  lang: Lang;
  catalog: CatalogCategory[];
  lines: PricedLine[];
  count: number;
  subtotal: number;
  totalGrams: number;
  hasUnavailable: boolean;
  hydrated: boolean;
  pulse: number;
  lastAdded: { product: CatalogProduct; variant: CatalogVariant } | null;
  add: (variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  lang,
  catalog,
  children,
}: {
  lang: Lang;
  catalog: CatalogCategory[];
  children: ReactNode;
}) {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [pulse, setPulse] = useState(0);
  const [lastAdded, setLastAdded] = useState<StoreContextValue["lastAdded"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const index = useMemo(() => {
    const map = new Map<string, { product: CatalogProduct; variant: CatalogVariant }>();
    for (const c of catalog) for (const p of c.products) for (const v of p.variants) map.set(v.id, { product: p, variant: v });
    return map;
  }, [catalog]);

  const lines = useMemo<PricedLine[]>(
    () =>
      raw.map((l) => {
        const hit = index.get(l.variantId);
        const available = Boolean(hit?.variant.inStock);
        return {
          variantId: l.variantId,
          quantity: l.quantity,
          product: hit?.product ?? null,
          variant: hit?.variant ?? null,
          lineTotal: available && hit ? hit.variant.price * l.quantity : 0,
          available,
        };
      }),
    [raw, index],
  );

  const add = useCallback(
    (variantId: string, quantity = 1) => {
      const current = read();
      const existing = current.find((l) => l.variantId === variantId);
      write(
        existing
          ? current.map((l) =>
              l.variantId === variantId ? { ...l, quantity: Math.min(l.quantity + quantity, 50) } : l,
            )
          : [...current, { variantId, quantity }],
      );
      const hit = index.get(variantId);
      if (hit) {
        setLastAdded(hit);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setLastAdded(null), 4000);
      }
      setPulse((p) => p + 1);
    },
    [index],
  );

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    const q = Math.max(1, Math.min(50, Math.round(quantity)));
    write(read().map((l) => (l.variantId === variantId ? { ...l, quantity: q } : l)));
  }, []);

  const remove = useCallback((variantId: string) => {
    write(read().filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<StoreContextValue>(() => {
    const available = lines.filter((l) => l.available);
    return {
      lang,
      catalog,
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: available.reduce((n, l) => n + l.lineTotal, 0),
      totalGrams: available.reduce((n, l) => n + (l.variant?.grams ?? 0) * l.quantity, 0),
      hasUnavailable: lines.some((l) => !l.available),
      hydrated,
      pulse,
      lastAdded,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lang, catalog, lines, hydrated, pulse, lastAdded, add, setQuantity, remove, clear]);

  return <StoreContext value={value}>{children}</StoreContext>;
}

export function useStore() {
  const ctx = use(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
