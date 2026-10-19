import { AdminForm } from "@/components/admin/controls";
import { FieldLabel, PageTitle, Panel, Toggle } from "@/components/admin/ui";
import { savePayments } from "@/app/admin/actions";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";

export const instant = false;

export default async function PaymentsPage() {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const p = t.payments;
  const s = await db.settings.findUniqueOrThrow({ where: { id: 1 } });
  const bankIncomplete = s.bankEnabled && !(s.bankAccountName.trim() && s.bankAccountNumber.trim());

  return (
    <div>
      <PageTitle>{p.title}</PageTitle>
      <AdminForm action={savePayments} lang={lang} className="mt-6">
        <div className="space-y-10">
          <Panel title={p.cod}>
            <Toggle name="codEnabled" defaultChecked={s.codEnabled} label={p.enabled} />
            <div className="mt-3 sm:max-w-xs">
              <FieldLabel htmlFor="codFee">{p.codFee}</FieldLabel>
              <input id="codFee" name="codFee" inputMode="numeric" defaultValue={s.codFee} className="field tabular" />
            </div>
          </Panel>

          <Panel title={p.bank}>
            <Toggle name="bankEnabled" defaultChecked={s.bankEnabled} label={p.enabled} />
            {bankIncomplete && <p className="mt-2 bg-ochre-pale px-4 py-3 text-[0.95rem] font-semibold">{p.bankIncomplete}</p>}
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="bankName">{p.bankName}</FieldLabel>
                <input id="bankName" name="bankName" defaultValue={s.bankName} className="field" />
              </div>
              <div>
                <FieldLabel htmlFor="bankBranch">{p.branch}</FieldLabel>
                <input id="bankBranch" name="bankBranch" defaultValue={s.bankBranch} className="field" />
              </div>
              <div>
                <FieldLabel htmlFor="bankAccountName">{p.accountName}</FieldLabel>
                <input id="bankAccountName" name="bankAccountName" defaultValue={s.bankAccountName} className="field" />
              </div>
              <div>
                <FieldLabel htmlFor="bankAccountNumber">{p.accountNumber}</FieldLabel>
                <input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  inputMode="numeric"
                  defaultValue={s.bankAccountNumber}
                  className="field tabular"
                />
              </div>
            </div>
          </Panel>

          <Panel title={p.whatsapp}>
            <Toggle name="whatsappOrderEnabled" defaultChecked={s.whatsappOrderEnabled} label={p.enabled} />
            <div className="mt-3 sm:max-w-xs">
              <FieldLabel htmlFor="whatsappNumber">{p.whatsappNumber}</FieldLabel>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                inputMode="tel"
                defaultValue={s.whatsappNumber}
                className="field tabular"
              />
            </div>
          </Panel>
        </div>
      </AdminForm>
    </div>
  );
}
