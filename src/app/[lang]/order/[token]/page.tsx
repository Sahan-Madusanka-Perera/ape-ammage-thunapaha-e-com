import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Check, Phone } from "lucide-react";
import { RegisterRule, WhatsAppIcon } from "@/components/art";
import { ClearBagOnce, SlipUpload } from "@/components/store/order-parts";
import { db } from "@/lib/server/db";
import { getStoreSettings } from "@/lib/server/catalog";
import { getLang } from "@/lib/server/lang";
import { getDict } from "@/lib/i18n";
import { districtName } from "@/lib/delivery";
import { displayPhone, formatRs, orderCode, pick, sizeLabel, type Lang } from "@/lib/format";
import { orderMessage, waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { robots: { index: false } };

const STEPS = ["NEW", "CONFIRMED", "DISPATCHED", "DELIVERED"] as const;

export default function OrderPage(props: PageProps<"/[lang]/order/[token]">) {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse bg-vermilion/90" />}>
      <OrderView {...props} />
    </Suspense>
  );
}

async function OrderView({ params, searchParams }: PageProps<"/[lang]/order/[token]">) {
  const lang = await getLang();
  const d = getDict(lang);
  const { token } = await params;
  const { placed } = await searchParams;

  const [order, settings] = await Promise.all([
    db.order.findUnique({ where: { publicToken: token }, include: { items: true } }),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const orderUrl = `${origin}${lang === "si" ? "/si" : ""}/order/${order.publicToken}`;
  const code = orderCode(order.number);
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <>
      {placed === "1" && <ClearBagOnce />}

      <section className="bg-vermilion text-lime">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <p className="tabular font-display text-[1.3rem] text-ochre-pale">
            {d.order.number} {code}
          </p>
          <h1 className="mt-1 font-display text-[2.6rem] font-bold leading-[1.02] sm:text-[3.4rem]">
            {d.order.thanks(order.customerName.split(" ")[0])}
          </h1>
          <p className="mt-3 max-w-xl text-[1.08rem] text-lime/90">{d.order.placed}</p>

          {order.status === "CANCELLED" ? (
            <p className="mt-8 inline-block bg-ink px-4 py-2 font-semibold">{d.order.status.CANCELLED}</p>
          ) : (
            <ol className="mt-8 grid grid-cols-4 gap-1.5">
              {STEPS.map((s, i) => {
                const done = i <= stepIndex;
                return (
                  <li
                    key={s}
                    aria-current={i === stepIndex ? "step" : undefined}
                    className={`flex min-h-16 flex-col justify-between px-2.5 py-2 sm:px-3 ${done ? "bg-lime text-ink" : "bg-vermilion-deep text-lime/70"}`}
                  >
                    <span className={`grid size-5 place-items-center rounded-full ${done ? "bg-ochre" : "border border-lime/40"}`}>
                      {done && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="mt-2 text-[0.82rem] font-semibold leading-tight sm:text-[0.95rem]">
                      {d.order.status[s]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {order.trackingNumber && (
            <p className="mt-4 text-[0.98rem]">
              {d.order.tracking}: <span className="tabular font-bold">{order.trackingNumber}</span>
            </p>
          )}
        </div>
        <RegisterRule />
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:gap-16 lg:px-8">
        <section aria-labelledby="pay">
          <h2 id="pay" className="font-display text-[1.9rem] font-bold leading-none">
            {d.order.payment}
          </h2>
          <PaymentPanel
            lang={lang}
            order={order}
            code={code}
            settings={settings}
            whatsappHref={waLink(settings.whatsappNumber, orderMessage(order, lang, orderUrl))}
          />

          <h2 className="mt-12 font-display text-[1.9rem] font-bold leading-none">{d.order.deliverTo}</h2>
          <address className="mt-4 text-[1.02rem] not-italic leading-relaxed">
            {order.customerName}
            <br />
            {order.addressLine}
            <br />
            {order.city}, {districtName(order.district, lang)}
            <br />
            <span className="tabular">{displayPhone(order.phone)}</span>
          </address>
        </section>

        <section aria-labelledby="items">
          <h2 id="items" className="font-display text-[1.9rem] font-bold leading-none">
            {d.order.items}
          </h2>
          <ul className="mt-4 divide-y divide-ink/15 border-y-[1.5px] border-ink">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-baseline justify-between gap-3 py-3">
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
          <dl className="mt-3 space-y-1.5 text-[1rem]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{d.checkout.subtotal}</dt>
              <dd className="tabular">{formatRs(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{d.checkout.delivery}</dt>
              <dd className="tabular">{order.deliveryFee === 0 ? d.checkout.free : formatRs(order.deliveryFee)}</dd>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">{d.checkout.codFee}</dt>
                <dd className="tabular">{formatRs(order.codFee)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t-[1.5px] border-ink pt-2 text-[1.2rem] font-bold">
              <dt>{d.checkout.total}</dt>
              <dd className="tabular">{formatRs(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-10 border-t border-ink/15 pt-5">
            <p className="font-semibold">{d.order.question}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={waLink(settings.whatsappNumber, `${code}`)} className="btn btn-line text-ink">
                <WhatsAppIcon className="size-5 text-leaf" />
                {displayPhone(settings.whatsappNumber)}
              </a>
              <a href={`tel:${settings.phone}`} className="btn btn-line text-ink">
                <Phone className="size-5" strokeWidth={1.8} aria-hidden="true" />
                {displayPhone(settings.phone)}
              </a>
            </div>
            <p className="mt-4 text-[0.92rem] text-ink-soft">{d.order.keep}</p>
          </div>
        </section>
      </div>
    </>
  );
}

function PaymentPanel({
  lang,
  order,
  code,
  settings,
  whatsappHref,
}: {
  lang: Lang;
  order: { paymentMethod: string; paymentStatus: string; total: number; publicToken: string };
  code: string;
  settings: Awaited<ReturnType<typeof getStoreSettings>>;
  whatsappHref: string;
}) {
  const d = getDict(lang);
  const c = d.checkout;
  const total = formatRs(order.total);

  if (order.paymentStatus === "PAID") {
    return (
      <p className="mt-4 flex items-center gap-2 bg-leaf-pale px-4 py-3 font-semibold text-leaf">
        <Check className="size-5" strokeWidth={2.6} aria-hidden="true" /> {d.order.paid}
      </p>
    );
  }

  if (order.paymentMethod === "COD") {
    return (
      <div className="mt-4">
        <p className="font-semibold">{c.methods.COD.title}</p>
        <p className="mt-1 text-[1.02rem] text-ink-soft">{d.order.cod(total)}</p>
      </div>
    );
  }

  if (order.paymentMethod === "WHATSAPP") {
    return (
      <div className="mt-4">
        <p className="text-[1.02rem]">{d.order.whatsappIntro}</p>
        <a href={whatsappHref} className="btn btn-leaf mt-4 w-full sm:w-auto">
          <WhatsAppIcon className="size-5" />
          {d.order.whatsappButton}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="font-semibold">{c.methods.BANK_TRANSFER.title}</p>
      {order.paymentStatus === "SLIP_UPLOADED" ? (
        <p className="mt-2 flex items-center gap-2 bg-ochre-pale px-4 py-3 font-semibold">
          <Check className="size-5" strokeWidth={2.6} aria-hidden="true" /> {d.order.slipReceived}
        </p>
      ) : (
        <>
          <p className="mt-1 text-[1.02rem] text-ink-soft">{d.order.bankIntro(total)}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-[1.5px] border-ink bg-lime p-4 text-[0.98rem]">
            <dt className="text-ink-soft">{c.bank}</dt>
            <dd>{settings.payments.bank.bankName}</dd>
            {settings.payments.bank.branch && (
              <>
                <dt className="text-ink-soft">{c.branch}</dt>
                <dd>{settings.payments.bank.branch}</dd>
              </>
            )}
            <dt className="text-ink-soft">{c.accountName}</dt>
            <dd>{settings.payments.bank.accountName}</dd>
            <dt className="text-ink-soft">{c.accountNumber}</dt>
            <dd className="tabular text-[1.1rem] font-bold">{settings.payments.bank.accountNumber}</dd>
          </dl>
          <p className="mt-2 text-[0.92rem] text-ink-soft">{d.order.reference(code)}</p>
          <SlipUpload token={order.publicToken} lang={lang} />
        </>
      )}
    </div>
  );
}
