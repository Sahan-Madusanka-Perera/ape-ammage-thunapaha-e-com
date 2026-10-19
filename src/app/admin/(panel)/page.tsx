import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { PageTitle, StatusBadge } from "@/components/admin/ui";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang, requestNow, timeAgo } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";
import { districtName } from "@/lib/delivery";
import { formatRs, normalisePhone, orderCode } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

const FILTERS = ["action", "confirmed", "dispatched", "delivered", "cancelled", "all"] as const;
type Filter = (typeof FILTERS)[number];

const WHERE: Record<Filter, Prisma.OrderWhereInput> = {
  action: { OR: [{ status: "NEW" }, { paymentStatus: "SLIP_UPLOADED", status: { not: "CANCELLED" } }] },
  confirmed: { status: "CONFIRMED" },
  dispatched: { status: "DISPATCHED" },
  delivered: { status: "DELIVERED" },
  cancelled: { status: "CANCELLED" },
  all: {},
};

function searchWhere(q: string): Prisma.OrderWhereInput {
  const number = Number(q.replace(/^#/, ""));
  const phone = normalisePhone(q);
  return {
    OR: [
      ...(Number.isInteger(number) && number > 0 ? [{ number }] : []),
      ...(phone ? [{ phone }] : []),
      { customerName: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

export const instant = false;

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const sp = await searchParams;
  const filter: Filter = FILTERS.includes(sp.f as Filter) ? (sp.f as Filter) : "action";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: q ? searchWhere(q) : WHERE[filter],
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        number: true,
        customerName: true,
        district: true,
        total: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    Promise.all(FILTERS.slice(0, 3).map((f) => db.order.count({ where: WHERE[f] }))),
  ]);
  const now = await requestNow();

  return (
    <div>
      <PageTitle>{t.orders.title}</PageTitle>

      <form action="/admin" className="relative mt-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t.orders.search}
          aria-label={t.orders.search}
          className="field pl-11"
        />
      </form>

      {!q && (
        <nav aria-label={t.orders.title} className="-mx-4 mt-4 overflow-x-auto px-4">
          <ul className="flex gap-1.5">
            {FILTERS.map((f, i) => {
              const active = f === filter;
              return (
                <li key={f} className="shrink-0">
                  <Link
                    href={f === "action" ? "/admin" : `/admin?f=${f}`}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-[2px] border-[1.5px] px-3.5 text-[0.95rem] font-semibold ${active ? "border-ink bg-ink text-lime" : "border-ink/20 bg-lime hover:border-ink/50"}`}
                  >
                    {t.orders.filters[f]}
                    {i < 3 && counts[i] > 0 && (
                      <span className={`tabular rounded-full px-1.5 text-[0.8rem] ${active ? "bg-ochre text-ink" : "bg-plaster-deep"}`}>
                        {counts[i]}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {orders.length === 0 ? (
        <p className="mt-10 border-y-[1.5px] border-ink py-10 text-center text-[1.05rem] text-ink-soft">
          {filter === "action" && !q ? t.orders.emptyAction : t.orders.empty}
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-ink/15 border-y-[1.5px] border-ink">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 py-3.5 hover:bg-lime">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="tabular font-bold">{orderCode(o.number)}</span>
                    <span className="truncate font-semibold">{o.customerName}</span>
                  </div>
                  <p className="mt-0.5 text-[0.9rem] text-ink-soft">
                    {districtName(o.district, lang)} · {t.orders.items(o._count.items)} · {t.method[o.paymentMethod]} ·{" "}
                    {timeAgo(o.createdAt, t, now)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <StatusBadge status={o.status} label={t.status[o.status]} />
                    {o.paymentStatus === "SLIP_UPLOADED" && o.status !== "CANCELLED" && (
                      <span className="rounded-[2px] border border-ink px-2 py-0.5 text-[0.82rem] font-bold">{t.orders.slipToCheck}</span>
                    )}
                    {o.paymentStatus === "PAID" && (
                      <span className="rounded-[2px] bg-leaf-pale px-2 py-0.5 text-[0.82rem] font-bold text-leaf">{t.orders.paid}</span>
                    )}
                  </div>
                </div>
                <span className="tabular shrink-0 text-[1.05rem] font-bold">{formatRs(o.total)}</span>
                <ChevronRight className="size-5 shrink-0 text-ink-soft" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
