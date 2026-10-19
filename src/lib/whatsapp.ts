import { formatRs, orderCode, sizeLabel, waNumber, type Lang } from "./format";

type MessageOrder = {
  number: number;
  customerName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  total: number;
  items: { nameEn: string; nameSi: string; grams: number; quantity: number; lineTotal: number }[];
};

export function orderMessage(order: MessageOrder, lang: Lang, orderUrl: string): string {
  const si = lang === "si";
  const lines = [
    si ? `ආයුබෝවන් අම්මේ! මගේ ඇණවුම ${orderCode(order.number)}` : `Hello Amma! My order ${orderCode(order.number)}`,
    "",
    ...order.items.map(
      (i) => `• ${si ? i.nameSi : i.nameEn} ${sizeLabel(i.grams)} × ${i.quantity} = ${formatRs(i.lineTotal)}`,
    ),
    "",
    `${si ? "භාණ්ඩ" : "Items"}: ${formatRs(order.subtotal)}`,
    `${si ? "බෙදාහැරීම" : "Delivery"}: ${formatRs(order.deliveryFee)}`,
    ...(order.codFee > 0 ? [`${si ? "COD ගාස්තුව" : "COD charge"}: ${formatRs(order.codFee)}`] : []),
    `${si ? "මුළු මුදල" : "Total"}: ${formatRs(order.total)}`,
    "",
    `${order.customerName} · ${order.phone}`,
    `${order.addressLine}, ${order.city}, ${order.district}`,
    "",
    orderUrl,
  ];
  return lines.join("\n");
}

export function waLink(number: string, text?: string): string {
  const base = `https://wa.me/${waNumber(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
