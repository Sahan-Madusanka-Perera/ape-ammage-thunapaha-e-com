import { DeliveryEditor } from "@/components/admin/delivery-editor";
import { PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";

export const instant = false;

export default async function DeliveryPage() {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const [settings, overrides] = await Promise.all([
    db.settings.findUniqueOrThrow({ where: { id: 1 } }),
    db.districtFee.findMany(),
  ]);

  return (
    <div>
      <PageTitle>{t.nav.delivery}</PageTitle>
      <DeliveryEditor
        lang={lang}
        rates={{
          baseFee: settings.deliveryBaseFee,
          perExtraKg: settings.deliveryPerExtraKg,
          freeOver: settings.freeDeliveryOver,
          overrides: Object.fromEntries(overrides.map((o) => [o.district, { baseFee: o.baseFee, perExtraKg: o.perExtraKg }])),
        }}
      />
    </div>
  );
}
