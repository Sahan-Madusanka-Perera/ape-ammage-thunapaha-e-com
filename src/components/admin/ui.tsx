import type { ReactNode } from "react";

/** An on/off switch that is a real checkbox, so it works in any form. */
export function Toggle({
  name,
  defaultChecked,
  label,
  hint,
}: {
  name: string;
  defaultChecked?: boolean;
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-1">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-[0.9rem] text-ink-soft">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        name={name}
        defaultChecked={defaultChecked}
        className="peer relative h-8 w-14 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-ink/40 bg-plaster-deep transition-colors before:absolute before:left-1 before:top-1/2 before:size-5.5 before:-translate-y-1/2 before:rounded-full before:bg-lime before:shadow-[0_1px_2px_rgba(28,19,14,0.4)] before:transition-transform checked:border-ink checked:bg-leaf checked:before:translate-x-6"
      />
    </label>
  );
}

export function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block font-semibold">
        {children}
      </label>
      {hint && <p className="text-[0.88rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, lead }: { title: string; children: ReactNode; lead?: string }) {
  return (
    <section className="border-t-[1.5px] border-ink pt-5">
      <h2 className="font-display text-[1.55rem] font-bold leading-tight">{title}</h2>
      {lead && <p className="mt-1 max-w-[60ch] text-[0.95rem] text-ink-soft">{lead}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h1 className="font-display text-[2.2rem] font-bold leading-none sm:text-[2.6rem]">{children}</h1>
      {action}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-ochre text-ink",
  CONFIRMED: "bg-leaf-pale text-leaf",
  DISPATCHED: "bg-ink text-lime",
  DELIVERED: "bg-plaster-deep text-ink-soft",
  CANCELLED: "bg-transparent text-vermilion line-through decoration-1",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-[2px] px-2 py-0.5 text-[0.82rem] font-bold ${STATUS_STYLE[status] ?? ""}`}>
      {label}
    </span>
  );
}
