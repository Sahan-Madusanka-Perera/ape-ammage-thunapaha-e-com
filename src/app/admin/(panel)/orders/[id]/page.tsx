import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/art";
import { AdminForm, ConfirmButton } from "@/components/admin/controls";
import { StatusBadge } from "@/components/admin/ui";
import {
  advanceOrder,
  cancelOrder,
  reopenOrder,
  saveOrderNote,
  setOrderPaid,
} from "@/app/admin/actions";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { formatDateTime, getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";
import { districtName } from "@/lib/delivery";
import { displayPhone, formatRs, orderCode, pick, sizeLabel } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

export const instant = false;

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      slip: { select: { id: true, mime: true } },
    },
  });
  if (!order) notFound();

  const code = orderCode(order.number);
  const next = order.status === "NEW" || order.status === "CONFIRMED" || order.status === "DISPATCHED" ? order.status : null;
  const items = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div>
      <Link href="/admin" className="-ml-1 inline-flex min-h-11 items-center gap-2 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-5" aria-hidden="true" /> {t.orders.title}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="tabular font-display text-[2.4rem] font-bold leading-none">{code}</h1>
        <StatusBadge status={order.status} label={t.status[order.status]} />
      </div>
      <p className="mt-1.5 text-ink-soft">
        {formatDateTime(order.createdAt, lang)} · {t.method[order.paymentMethod]} ·{" "}
        <span className="tabular font-semibold text-ink">{formatRs(order.total)}</span>
      </p>

      {/* The one next step, as large as the screen allows. */}
      {next && (
        <form action={advanceOrder} className="mt-6 border-[1.5px] border-ink bg-lime p-4">
          <input type="hidden" name="id" value={order.id} />
          {next === "CONFIRMED" && (
            <div className="mb-3">
              <label htmlFor="trackingNumber" className="mb-1.5 block font-semibold">
                {t.order.tracking}
              </label>
              <input id="trackingNumber" name="trackingNumber" className="field tabular" defaultValue={order.trackingNumber ?? ""} />
            </div>
          )}
          <button type="submit" className="btn btn-primary w-full text-[1.05rem]">
            {t.order.next[next]}
          </button>
        </form>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border-t-[1.5px] border-ink pt-4">
          <h2 className="font-display text-[1.45rem] font-bold">{t.order.customer}</h2>
          <p className="mt-2 text-[1.1rem] font-semibold">{order.customerName}</p>
          <p className="tabular text-ink-soft">{displayPhone(order.phone)}</p>
          {order.email && <p className="text-ink-soft">{order.email}</p>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href={`tel:${order.phone}`} className="btn btn-line">
              <Phone className="size-5" strokeWidth={1.9} aria-hidden="true" /> {t.order.call}
            </a>
            <a href={waLink(order.phone, t.order.greeting(code))} className="btn btn-line">
              <WhatsAppIcon className="size-5 text-leaf" /> {t.order.whatsapp}
            </a>
          </div>
          <h3 className="mt-5 font-semibold">{t.order.address}</h3>
          <address className="mt-1 not-italic leading-relaxed">
            {order.addressLine}
            <br />
            {order.city}, {districtName(order.district, lang)}
          </address>
          {order.notes && (
            <>
              <h3 className="mt-4 font-semibold">{t.order.notes}</h3>
              <p className="mt-1 bg-ochre-pale px-3 py-2">{order.notes}</p>
            </>
          )}
        </section>

        <section className="border-t-[1.5px] border-ink pt-4">
          <h2 className="font-display text-[1.45rem] font-bold">
            {t.order.items} <span className="tabular text-[1rem] font-normal text-ink-soft">({items} · {sizeLabel(order.totalGrams)})</span>
          </h2>
          <ul className="mt-2 divide-y divide-ink/10">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-baseline justify-between gap-3 py-2">
                <span>
                  <span className="font-semibold">{pick(lang, i.nameEn, i.nameSi)}</span>{" "}
                  <span className="tabular text-ink-soft">
                    {sizeLabel(i.grams)} × {i.quantity}
                  </span>
                </span>
                <span className="tabular">{formatRs(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-ink/15 pt-2">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.order.subtotal}</dt>
              <dd className="tabular">{formatRs(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.order.delivery}</dt>
              <dd className="tabular">{formatRs(order.deliveryFee)}</dd>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t.order.codFee}</dt>
                <dd className="tabular">{formatRs(order.codFee)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-[1.15rem] font-bold">
              <dt>{t.order.total}</dt>
              <dd className="tabular">{formatRs(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="border-t-[1.5px] border-ink pt-4">
          <h2 className="font-display text-[1.45rem] font-bold">{t.order.payment}</h2>
          <p className="mt-2">
            {t.method[order.paymentMethod]} ·{" "}
            <span className="font-semibold">
              {order.paymentStatus === "PAID"
                ? t.orders.paid
                : order.paymentStatus === "SLIP_UPLOADED"
                  ? t.orders.slipToCheck
                  : t.orders.unpaid}
            </span>
          </p>
          {order.paymentMethod === "BANK_TRANSFER" &&
            (order.slip ? (
              <a
                href={`/files/${order.slip.id}`}
                target="_blank"
                className="mt-3 block border-[1.5px] border-ink bg-lime p-2 hover:bg-ochre-pale"
              >
                {order.slip.mime === "application/pdf" ? (
                  <span className="flex min-h-20 items-center justify-center gap-2 font-semibold">
                    <FileText className="size-6" aria-hidden="true" /> {t.order.openSlip}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/files/${order.slip.id}`} alt={t.order.slip} className="max-h-96 w-full object-contain" />
                )}
              </a>
            ) : (
              <p className="mt-2 text-ink-soft">{t.order.noSlip}</p>
            ))}
          <form action={setOrderPaid} className="mt-3">
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="paid" value={order.paymentStatus === "PAID" ? "0" : "1"} />
            <button
              type="submit"
              className={order.paymentStatus === "PAID" ? "btn btn-line w-full" : "btn btn-leaf w-full"}
            >
              {order.paymentStatus === "PAID" ? t.order.markUnpaid : t.order.markPaid}
            </button>
          </form>
        </section>

        <section className="border-t-[1.5px] border-ink pt-4">
          <h2 className="font-display text-[1.45rem] font-bold">{t.order.history}</h2>
          <ol className="mt-2 space-y-1.5 text-[0.95rem]">
            {order.events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="tabular w-28 shrink-0 text-ink-soft">{formatDateTime(e.createdAt, lang)}</span>
                <span>
                  {e.status ? (e.status === "NEW" && !e.note ? t.order.placed : t.status[e.status]) : null}
                  {e.status && e.note ? " · " : null}
                  {e.note}
                </span>
              </li>
            ))}
          </ol>
          {order.trackingNumber && (
            <p className="mt-3">
              {t.order.tracking}: <span className="tabular font-semibold">{order.trackingNumber}</span>
            </p>
          )}
          <a
            href={`/order/${order.publicToken}`}
            target="_blank"
            className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-vermilion underline-offset-4"
          >
            <ExternalLink className="size-4" aria-hidden="true" /> {t.order.customerLink}
          </a>
        </section>
      </div>

      <section className="mt-8">
        <AdminForm action={saveOrderNote} lang={lang} saveLabel={t.order.saveNote}>
          <input type="hidden" name="id" value={order.id} />
          <label htmlFor="adminNote" className="mb-1.5 block font-semibold">
            {t.order.note}
          </label>
          <textarea id="adminNote" name="adminNote" rows={3} defaultValue={order.adminNote ?? ""} className="field" />
        </AdminForm>
      </section>

      <div className="mt-10 border-t border-ink/15 pt-6">
        {order.status === "CANCELLED" ? (
          <form action={reopenOrder}>
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="btn btn-line">
              {t.order.reopen}
            </button>
          </form>
        ) : (
          <form action={cancelOrder}>
            <input type="hidden" name="id" value={order.id} />
            <ConfirmButton label={t.order.cancelOrder} confirmLabel={t.order.confirmCancel} cancelLabel={t.cancel} />
          </form>
        )}
      </div>
    </div>
  );
}
