import { ExternalLink, LogOut } from "lucide-react";
import { AdminForm } from "@/components/admin/controls";
import { FieldLabel, PageTitle, Panel } from "@/components/admin/ui";
import { PortraitNiche } from "@/components/store/catalog-views";
import { changePassword, logout, saveShop } from "@/app/admin/actions";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminLang } from "@/lib/server/admin";
import { getAdminDict } from "@/lib/admin-i18n";

export const instant = false;

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  const st = t.settings;
  const s = await db.settings.findUniqueOrThrow({ where: { id: 1 } });

  return (
    <div>
      <PageTitle>{st.title}</PageTitle>

      <AdminForm action={saveShop} lang={lang} errors={{ photo: t.products.errors.photo }} className="mt-6">
        <div className="space-y-10">
          <Panel title={st.shop}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="phone">{st.phone}</FieldLabel>
                <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={s.phone} className="field tabular" />
              </div>
              <div>
                <FieldLabel htmlFor="email">{st.email}</FieldLabel>
                <input id="email" name="email" type="email" defaultValue={s.email} className="field" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="addressSi">{st.addressSi}</FieldLabel>
                <input id="addressSi" name="addressSi" lang="si" defaultValue={s.addressSi} className="field" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="addressEn">{st.addressEn}</FieldLabel>
                <input id="addressEn" name="addressEn" defaultValue={s.addressEn} className="field" />
              </div>
            </div>
          </Panel>

          <Panel title={st.announcement} lead={st.announcementHint}>
            <div className="grid gap-4">
              <div>
                <FieldLabel htmlFor="announcementSi">{st.announcementSi}</FieldLabel>
                <input id="announcementSi" name="announcementSi" lang="si" defaultValue={s.announcementSi} className="field" />
              </div>
              <div>
                <FieldLabel htmlFor="announcementEn">{st.announcementEn}</FieldLabel>
                <input id="announcementEn" name="announcementEn" defaultValue={s.announcementEn} className="field" />
              </div>
            </div>
          </Panel>

          <Panel title={st.portrait} lead={st.portraitHint}>
            <div className="flex flex-wrap items-start gap-5">
              <div className="w-28 shrink-0 border-[1.5px] border-ink bg-vermilion p-1.5">
                <PortraitNiche portraitId={s.portraitId} alt={st.portrait} />
              </div>
              <div className="min-w-0 flex-1">
                <input
                  type="file"
                  name="portrait"
                  accept="image/*"
                  className="block w-full text-[0.95rem] file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-[2px] file:border-[1.5px] file:border-ink file:bg-lime file:px-4 file:font-semibold"
                />
                {s.portraitId && (
                  <label className="mt-3 flex min-h-11 items-center gap-3">
                    <input type="checkbox" name="removePortrait" className="size-5 accent-vermilion" />
                    {st.removePortrait}
                  </label>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </AdminForm>

      <div className="mt-14">
        <AdminForm
          action={changePassword}
          lang={lang}
          saveLabel={st.password}
          errors={{ wrong: st.passwordErrors.wrong, short: st.passwordErrors.short, mismatch: st.passwordErrors.mismatch }}
        >
          <Panel title={st.password} lead={admin.email}>
            <input type="hidden" name="username" autoComplete="username" value={admin.email} readOnly />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="current">{st.current}</FieldLabel>
                <input id="current" name="current" type="password" autoComplete="current-password" className="field" />
              </div>
              <div>
                <FieldLabel htmlFor="next">{st.next}</FieldLabel>
                <input id="next" name="next" type="password" autoComplete="new-password" className="field" />
              </div>
              <div>
                <FieldLabel htmlFor="confirm">{st.confirm}</FieldLabel>
                <input id="confirm" name="confirm" type="password" autoComplete="new-password" className="field" />
              </div>
            </div>
          </Panel>
        </AdminForm>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/15 pt-6 lg:hidden">
        <a href="/" target="_blank" className="btn btn-line">
          <ExternalLink className="size-5" aria-hidden="true" /> {t.viewShop}
        </a>
        <form action={logout}>
          <button type="submit" className="btn btn-line">
            <LogOut className="size-5" aria-hidden="true" /> {t.logout}
          </button>
        </form>
      </div>
    </div>
  );
}
