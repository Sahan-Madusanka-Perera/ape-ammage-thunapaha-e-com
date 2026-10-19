import Link from "next/link";
import { SpiceMotif } from "@/components/art";

// Root-param getters are unavailable here, so the page carries both languages.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-20 sm:flex-row sm:items-center sm:gap-12 sm:px-6">
      <SpiceMotif motif="CHILLI" pigment="#c3361f" className="w-32 shrink-0 sm:w-44" />
      <div>
        <h1 className="font-display text-[2.4rem] font-bold leading-tight">This page isn&apos;t on the shelf.</h1>
        <p lang="si" className="mt-1 font-display text-[1.4rem] text-vermilion">
          මේ පිටුව රාක්කයේ නැහැ.
        </p>
        <p className="mt-4 text-ink-soft">The link may be old. Everything Amma sells is on the price list.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/#price-list" className="btn btn-primary">
            See the price list
          </Link>
          <Link href="/si#price-list" className="btn btn-line">
            මිල ලැයිස්තුව
          </Link>
        </div>
      </div>
    </div>
  );
}
