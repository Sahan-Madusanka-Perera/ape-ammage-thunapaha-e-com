import { ArchNiche, SpiceMotif } from "@/components/art";
import { mix, textOn } from "@/lib/color";
import type { CatalogProduct } from "@/lib/types";

/**
 * A product's own composition: its pigment as the field, the spice drawn in an arched niche
 * (or the owner's photo when she has uploaded one).
 */
export function PackFace({
  product,
  size = "md",
  alt,
  priority = false,
  rise = false,
}: {
  product: Pick<CatalogProduct, "pigment" | "motif" | "imageId" | "nameEn">;
  size?: "sm" | "md" | "lg";
  alt?: string;
  priority?: boolean;
  /** Let the pigment rise into the pack as it scrolls into view. */
  rise?: boolean;
}) {
  const pad = size === "sm" ? "p-1.5" : size === "md" ? "p-3 sm:p-4" : "p-5 sm:p-8";
  const frame = mix(product.pigment, textOn(product.pigment), 0.38);

  return (
    <div
      className={`relative isolate ${pad}`}
      style={{ background: rise ? mix(product.pigment, "#eeebe3", 0.72) : product.pigment }}
    >
      {rise && (
        <div aria-hidden="true" className="pigment-rise absolute inset-0 -z-10" style={{ background: product.pigment }} />
      )}
      {size !== "sm" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-1.5 sm:inset-2"
          style={{ border: `1px solid ${frame}` }}
        />
      )}
      <ArchNiche className="relative" fill="#eeebe3">
        {product.imageId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/files/${product.imageId}`}
            alt={alt ?? product.nameEn}
            className="absolute inset-0 h-full w-full object-cover"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-end justify-center pb-[8%]">
            <SpiceMotif motif={product.motif} pigment={product.pigment} className="w-[82%]" />
          </div>
        )}
      </ArchNiche>
    </div>
  );
}
