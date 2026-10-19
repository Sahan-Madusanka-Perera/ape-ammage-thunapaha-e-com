import { useId, type ReactNode } from "react";
import { mix } from "@/lib/color";
import type { Motif } from "@/lib/types";

const INK = "#1c130e";
const LEAF = "#4e5a38";
const CLAY = "#8c4b2c";
const PLASTER = "#eeebe3";

type BandKind = "vine" | "petals" | "diamonds";

const TILE: Record<BandKind, { w: number; h: number }> = {
  vine: { w: 56, h: 28 },
  petals: { w: 22, h: 14 },
  diamonds: { w: 16, h: 10 },
};

/**
 * A repeating ornament band, the only place ornament lives (between registers, never inside fields).
 * vine: liyawela scroll. petals: pala peti lotus petals. diamonds: bead chain.
 */
export function Band({
  kind,
  line = INK,
  fill = "#d9a21b",
  ground = "transparent",
  height,
  className,
}: {
  kind: BandKind;
  line?: string;
  fill?: string;
  ground?: string;
  height?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const tile = TILE[kind];
  const h = height ?? tile.h;
  const scale = h / tile.h;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height={h}
      style={{ display: "block", background: ground }}
    >
      <defs>
        <pattern
          id={id}
          width={tile.w * scale}
          height={h}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          {kind === "vine" && (
            <g fill="none" stroke={line} strokeWidth={1.6} strokeLinecap="round">
              <path d="M0 14 C 9 4, 19 4, 28 14 C 37 24, 47 24, 56 14" />
              <path d="M14 8.6 C 12 3.4, 18.6 1.4, 20.2 5 C 21.2 8, 17 9.2, 16.4 6.8" />
              <path d="M42 19.4 C 44 24.6, 37.4 26.6, 35.8 23 C 34.8 20, 39 18.8, 39.6 21.2" />
              <path d="M4.2 10.6 C 4 6.2, 7.6 3.8, 10.4 3.6 C 9.6 7, 7.4 9.4, 4.2 10.6 Z" fill={fill} />
              <path d="M51.8 17.4 C 52 21.8, 48.4 24.2, 45.6 24.4 C 46.4 21, 48.6 18.6, 51.8 17.4 Z" fill={fill} />
              <circle cx="28" cy="4.4" r="1.4" fill={line} stroke="none" />
              <circle cx="0" cy="23.6" r="1.4" fill={line} stroke="none" />
              <circle cx="56" cy="23.6" r="1.4" fill={line} stroke="none" />
            </g>
          )}
          {kind === "petals" && (
            <g stroke={line} strokeWidth={1.3} strokeLinejoin="round">
              <path d="M1 14 C 1 7, 6 2.2, 11 1 C 16 2.2, 21 7, 21 14 Z" fill={fill} />
              <path d="M6 14 C 6 9.6, 8.4 6.6, 11 5.6 C 13.6 6.6, 16 9.6, 16 14" fill="none" />
              <circle cx="11" cy="10.6" r="1.1" fill={line} stroke="none" />
            </g>
          )}
          {kind === "diamonds" && (
            <g>
              <path d="M8 1 L13 5 L8 9 L3 5 Z" fill={fill} stroke={line} strokeWidth={1.1} />
              <circle cx="0" cy="5" r="1.1" fill={line} />
              <circle cx="16" cy="5" r="1.1" fill={line} />
            </g>
          )}
        </pattern>
      </defs>
      <rect width="100%" height={h} fill={`url(#${id})`} />
    </svg>
  );
}

/** The frame between two registers: brush rule, ochre vine band, fine rule. */
export function RegisterRule({ tone = "plaster" }: { tone?: "plaster" | "vermilion" | "ink" }) {
  const line = tone === "plaster" ? INK : tone === "ink" ? "#d9a21b" : INK;
  const ground = tone === "ink" ? INK : "#d9a21b";
  const fill = tone === "ink" ? "#a3291b" : "#a3291b";
  return (
    <div aria-hidden="true">
      <div style={{ height: 3, background: INK }} />
      <Band kind="vine" line={line} fill={fill} ground={ground} height={26} />
      <div style={{ height: 1.5, background: INK }} />
    </div>
  );
}

/** Pointed arch, the niche every spice sits in. viewBox 100 × 120. */
const ARCH_PATH = "M0 120 L0 50 C0 24 22 6 50 0 C78 6 100 24 100 50 L100 120 Z";
const ARCH_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' preserveAspectRatio='none'><path d='${ARCH_PATH}'/></svg>`,
)}")`;

export function ArchNiche({
  children,
  fill = PLASTER,
  stroke = INK,
  outline = false,
  className,
}: {
  children?: ReactNode;
  fill?: string;
  stroke?: string;
  /** Draw the arch's outer contour in heavy ink, as when it is cut into a wall. */
  outline?: boolean;
  className?: string;
}) {
  return (
    <div className={className} style={{ position: "relative", aspectRatio: "100 / 120" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: fill,
          maskImage: ARCH_MASK,
          WebkitMaskImage: ARCH_MASK,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        {children}
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 120"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
      >
        <path
          d="M5 120 L5 51 C5 28 25 11.5 50 5.4 C75 11.5 95 28 95 51 L95 120"
          fill="none"
          stroke={stroke}
          strokeOpacity={0.5}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {outline && (
          <>
            <path
              d="M0.8 120 L0.8 50 C0.8 24.5 22.5 6.6 50 0.9 C77.5 6.6 99.2 24.5 99.2 50 L99.2 120"
              fill="none"
              stroke={stroke}
              strokeWidth={3}
              vectorEffect="non-scaling-stroke"
            />
            <path d="M-3 119.4 H103" fill="none" stroke={stroke} strokeWidth={5} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    </div>
  );
}

/** Line drawing of the spice itself, in mural style: flat fills, brush outline. viewBox 120 × 120. */
export function SpiceMotif({
  motif,
  pigment,
  className,
}: {
  motif: Motif;
  pigment: string;
  className?: string;
}) {
  const light = mix(pigment, "#f8f6f1", 0.45);
  const dark = mix(pigment, INK, 0.35);
  const s = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const brush = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <BrushFilter id={brush} />
      <g filter={`url(#${brush})`}>
      {motif === "CURRY" && (
        <g {...s}>
          <path d="M72 34 C 80 22, 92 15, 104 13" fill="none" stroke={LEAF} />
          {[
            [78, 26, -38],
            [88, 19, -28],
            [98, 15, -18],
            [83, 31, 32],
            [94, 23, 40],
          ].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="7" ry="3.4" transform={`rotate(${r} ${x} ${y})`} fill={LEAF} strokeWidth={1.6} />
          ))}
          <path d="M22 68 C 30 48, 45 33, 60 31 C 75 33, 90 48, 98 68 Z" fill={pigment} />
          {[
            [48, 52],
            [62, 44],
            [70, 58],
            [55, 62],
            [80, 62],
            [40, 63],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill={light} stroke="none" />
          ))}
          <path d="M12 68 H108 C 106 93, 86 108, 60 108 C 34 108, 14 93, 12 68 Z" fill={CLAY} />
          <path
            d="M24 84 C 31 79, 38 89, 45 84 S 59 79, 66 84 S 80 89, 87 84 S 94 81, 97 83"
            fill="none"
            stroke="#d9a21b"
            strokeWidth={2.6}
          />
          <path d="M8 68 H112" fill="none" />
        </g>
      )}

      {motif === "CHILLI" && (
        <g {...s}>
          <g transform="matrix(-1 0 0 1 122 12)">
            <path d="M26 28 C 44 24, 72 40, 94 86 C 96 93, 90 97, 86 92 C 66 64, 44 47, 24 40 C 17 37, 19 29, 26 28 Z" fill={dark} />
            <path d="M18 30 C 20 25, 27 25, 29 30 C 27 36, 21 37, 18 34 Z" fill={LEAF} />
            <path d="M19 30 C 14 28, 11 31, 8 27" fill="none" stroke={LEAF} />
          </g>
          <path d="M26 28 C 44 24, 72 40, 94 86 C 96 93, 90 97, 86 92 C 66 64, 44 47, 24 40 C 17 37, 19 29, 26 28 Z" fill={pigment} />
          <path d="M34 34 C 52 38, 70 54, 84 78" fill="none" stroke={light} strokeWidth={2.4} strokeOpacity={0.7} />
          <path d="M18 30 C 20 25, 27 25, 29 30 C 27 36, 21 37, 18 34 Z" fill={LEAF} />
          <path d="M19 30 C 14 28, 11 31, 8 27" fill="none" stroke={LEAF} />
        </g>
      )}

      {motif === "FLAKES" && (
        <g {...s} strokeWidth={1.8}>
          {[
            "M20 92 L34 84 L40 94 L28 101 Z",
            "M38 78 L52 70 L58 82 L44 88 Z",
            "M58 90 L74 84 L76 98 L62 102 Z",
            "M76 72 L90 68 L94 82 L80 86 Z",
            "M50 56 L64 50 L68 62 L54 66 Z",
            "M86 92 L100 88 L102 101 L90 104 Z",
            "M30 64 L42 60 L44 72 L32 74 Z",
            "M68 38 L80 34 L84 46 L72 50 Z",
            "M44 98 L56 96 L56 106 L46 107 Z",
          ].map((d, i) => (
            <path key={i} d={d} fill={i % 3 === 1 ? dark : pigment} />
          ))}
          {[
            [36, 74, 20],
            [66, 72, -30],
            [52, 86, 60],
            [84, 58, 10],
            [72, 106, -50],
            [26, 82, 80],
            [96, 76, -20],
          ].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="3.2" ry="2" transform={`rotate(${r} ${x} ${y})`} fill="#f1dc9a" strokeWidth={1.2} />
          ))}
        </g>
      )}

      {motif === "TURMERIC" && (
        <g {...s}>
          <path
            d="M14 66 C 14 54, 28 47, 42 51 C 50 37, 68 32, 78 41 C 90 37, 104 45, 101 58 C 108 66, 101 79, 89 76 C 78 86, 60 85, 50 77 C 38 84, 14 80, 14 66 Z"
            fill={mix(pigment, "#6b3d1d", 0.55)}
          />
          {["M30 56 C 32 62, 31 68, 27 73", "M56 46 C 59 54, 58 64, 54 72", "M80 46 C 83 53, 83 62, 79 69"].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.6} />
          ))}
          <circle cx="82" cy="94" r="16" fill={pigment} />
          <circle cx="82" cy="94" r="10" fill="none" stroke={light} strokeWidth={2} />
          <circle cx="82" cy="94" r="3" fill={light} stroke="none" />
          <circle cx="50" cy="100" r="11" fill={pigment} />
          <circle cx="50" cy="100" r="6" fill="none" stroke={light} strokeWidth={1.8} />
        </g>
      )}

      {motif === "PEPPER" && (
        <g {...s}>
          <path d="M60 14 C 84 16, 100 36, 96 56 C 82 50, 64 36, 60 14 Z" fill={LEAF} />
          <path d="M60 14 C 70 28, 82 40, 96 56" fill="none" stroke={PLASTER} strokeWidth={1.4} />
          {[
            [40, 60, 11],
            [62, 64, 12],
            [50, 82, 12],
            [74, 84, 11],
            [30, 82, 10],
            [86, 66, 10],
            [62, 102, 10],
            [40, 101, 9],
            [84, 100, 9],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill={i % 2 ? dark : pigment} />
              <path
                d={`M${x - r * 0.5} ${y - r * 0.2} C ${x - r * 0.1} ${y - r * 0.55}, ${x + r * 0.3} ${y - r * 0.1}, ${x + r * 0.45} ${y + r * 0.3}`}
                fill="none"
                stroke={light}
                strokeWidth={1.5}
                strokeOpacity={0.8}
              />
            </g>
          ))}
        </g>
      )}

      {motif === "SEED" && (
        <g {...s} strokeWidth={1.8}>
          {[
            [34, 58, -30],
            [52, 50, 15],
            [70, 56, 50],
            [86, 64, -10],
            [28, 80, 40],
            [46, 76, -45],
            [64, 78, 10],
            [82, 86, 60],
            [40, 98, -15],
            [58, 98, 70],
            [76, 104, -35],
            [94, 98, 20],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`rotate(${r} ${x} ${y})`}>
              <ellipse cx={x} cy={y} rx="5" ry="12" fill={i % 3 === 0 ? dark : pigment} />
              <path d={`M${x} ${y - 8} L${x} ${y + 8}`} stroke={light} strokeWidth={1.3} />
            </g>
          ))}
        </g>
      )}

      {motif === "CINNAMON" && (
        <g {...s}>
          {[
            [20, 44, -16],
            [16, 64, -10],
            [24, 84, -4],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`rotate(${r} ${x} ${y})`}>
              <rect x={x} y={y - 8} width="84" height="16" rx="8" fill={i === 1 ? dark : pigment} />
              <path d={`M${x + 14} ${y - 2} H${x + 70}`} stroke={light} strokeWidth={1.6} strokeOpacity={0.8} />
              <path d={`M${x + 24} ${y + 4} H${x + 62}`} stroke={INK} strokeOpacity={0.4} strokeWidth={1.4} />
              <circle cx={x + 76} cy={y} r="7.4" fill={light} />
              <path
                d={`M${x + 76} ${y} m -1.8 0 a 1.8 1.8 0 1 1 3.6 0 a 3.6 3.6 0 1 1 -7.2 0`}
                fill="none"
                strokeWidth={1.4}
              />
            </g>
          ))}
        </g>
      )}

      {motif === "POD" && (
        <g {...s}>
          {[
            [44, 66, -28],
            [72, 58, 22],
            [60, 90, 78],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <path d="M0 -24 C 11 -15, 13 9, 0 24 C -13 9, -11 -15, 0 -24 Z" fill={i === 1 ? dark : pigment} />
              <path d="M0 -20 C 4 -8, 4 8, 0 20" fill="none" stroke={light} strokeWidth={1.4} />
              <path d="M-5 -14 C -6 -4, -6 6, -4 15" fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={1.2} />
              <path d="M0 -24 L0 -30" />
            </g>
          ))}
        </g>
      )}

      {motif === "LEAF" && (
        <g {...s}>
          {["M48 44 C 42 36, 54 30, 48 22", "M62 42 C 56 32, 70 28, 62 18", "M76 44 C 70 36, 82 30, 76 22"].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.8} />
          ))}
          <path d="M26 54 H94 L86 98 C 84 106, 36 106, 34 98 Z" fill={CLAY} />
          <ellipse cx="60" cy="54" rx="34" ry="7" fill={pigment} />
          <path d="M94 62 C 106 62, 108 80, 92 84" fill="none" strokeWidth={4} stroke={INK} />
          <path d="M94 62 C 106 62, 108 80, 92 84" fill="none" strokeWidth={2} stroke={CLAY} />
          <g transform="translate(18 92) rotate(-24)">
            <path d="M0 0 C 6 -10, 18 -10, 22 -2 C 18 6, 6 8, 0 0 Z" fill={LEAF} />
            <path d="M2 0 L20 -2" stroke={PLASTER} strokeWidth={1.1} />
          </g>
        </g>
      )}

      {motif === "FRUIT" && (
        <g {...s}>
          {[
            [30, 58, -20],
            [62, 50, 18],
            [44, 84, 40],
            [76, 82, -12],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <path d="M0 0 C 14 -6, 32 2, 36 18 C 24 25, 6 21, 0 0 Z" fill={i % 2 ? dark : pigment} />
              <path d="M5 4 C 14 6, 24 11, 31 17" fill="none" stroke={light} strokeWidth={1.4} />
              <path d="M3 9 C 10 13, 18 17, 26 20" fill="none" stroke={light} strokeOpacity={0.6} strokeWidth={1.2} />
            </g>
          ))}
        </g>
      )}
      </g>
    </svg>
  );
}

/**
 * Mural line: an ink contour around every shape, thin at the upper left and swelling to the
 * lower right, the way a loaded brush leaves it. Applied over flat fills with a fine inner line.
 */
function BrushFilter({ id, weight = 1.1 }: { id: string; weight?: number }) {
  return (
    <defs>
      <filter id={id} x="-10%" y="-10%" width="125%" height="125%" colorInterpolationFilters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" radius={weight} result="grown" />
        <feOffset in="grown" dx={weight * 0.35} dy={weight * 0.55} result="shifted" />
        <feFlood floodColor={INK} />
        <feComposite in2="shifted" operator="in" result="ink" />
        <feMerge>
          <feMergeNode in="ink" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * The hero niche's still life, composed as one painting: a clay bowl of roasted thunapaha,
 * cinnamon quills and dried chillies leaning behind it, a curry-leaf sprig, loose peppercorns.
 * viewBox 200 × 240, the niche's own proportion.
 */
export function HeroStillLife({ className }: { className?: string }) {
  const brush = useId().replace(/:/g, "");
  const line = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 200 240" aria-hidden="true" className={className}>
      <BrushFilter id={brush} weight={1.6} />
      <g filter={`url(#${brush})`} {...line}>
        {/* Cinnamon quills, leaning left */}
        <path d="M46 168 L82 58 C84 52 94 54 92 61 L58 170 Z" fill="#a8693a" />
        <path d="M62 170 L104 70 C106 64 116 67 113 73 L74 172 Z" fill="#c4834a" />
        <path d="M70 120 L90 64 M86 124 L106 76" fill="none" stroke="#f1dc9a" strokeOpacity={0.55} strokeWidth={1.4} />
        <ellipse cx="87" cy="57.5" rx="6" ry="4.6" transform="rotate(-68 87 57.5)" fill="#e2b98a" />
        <path d="M86.4 56 a1.6 1.6 0 1 1 1.4 2.6 a3.2 3.2 0 1 1 -2.6 -5" fill="none" strokeWidth={1.1} />
        <ellipse cx="108.5" cy="69.5" rx="6" ry="4.6" transform="rotate(-62 108.5 69.5)" fill="#e2b98a" />
        <path d="M107.9 68 a1.6 1.6 0 1 1 1.4 2.6 a3.2 3.2 0 1 1 -2.6 -5" fill="none" strokeWidth={1.1} />

        {/* Dried chillies, leaning right */}
        <path d="M136 168 C128 136 130 104 148 80 C152 75 159 78 156 84 C143 108 141 138 148 168 Z" fill="#8f2416" />
        <path d="M150 168 C146 132 152 96 174 70 C178 65 185 69 181 75 C164 100 160 134 162 168 Z" fill="#c3361f" />
        <path d="M157 140 C157 116 162 96 174 80" fill="none" stroke="#f3a48f" strokeOpacity={0.7} strokeWidth={1.8} />
        <path d="M150 82 C151 74 160 72 161 80 C158 86 152 87 150 82 Z" fill={LEAF} />
        <path d="M155 76 C154 68 158 63 164 62" fill="none" stroke={LEAF} strokeWidth={2} />
        <path d="M176 72 C177 64 186 63 186 71 C183 77 177 77 176 72 Z" fill={LEAF} />
        <path d="M182 65 C183 58 188 55 193 56" fill="none" stroke={LEAF} strokeWidth={2} />

        {/* Curry-leaf sprig rising from the mound */}
        <path d="M104 116 C100 96 98 80 104 60" fill="none" stroke={LEAF} strokeWidth={2.2} />
        {[
          [97, 100, -55],
          [111, 92, 50],
          [96, 84, -40],
          [110, 76, 42],
          [100, 68, -30],
          [106, 58, 10],
        ].map(([x, y, r], i) => (
          <path
            key={i}
            d={`M${x - 9} ${y} C${x - 4} ${y - 5} ${x + 4} ${y - 5} ${x + 9} ${y} C${x + 4} ${y + 5} ${x - 4} ${y + 5} ${x - 9} ${y} Z`}
            transform={`rotate(${r} ${x} ${y})`}
            fill={i % 2 ? "#5d6b42" : LEAF}
            strokeWidth={1.2}
          />
        ))}

        {/* The mound of roasted thunapaha */}
        <path d="M32 170 C44 136 72 114 100 112 C128 114 156 136 168 170 Z" fill="#5b2e1a" />
        <path
          d="M58 150 C70 136 84 128 98 126 M118 130 C132 136 144 146 150 158 M76 160 C88 150 102 146 116 148"
          fill="none"
          stroke="#8a5534"
          strokeWidth={2}
        />

        {/* Clay bowl with a painted ochre wave */}
        <path d="M20 170 H180 C178 204 148 228 100 228 C52 228 22 204 20 170 Z" fill={CLAY} />
        <path
          d="M14 170 C14 167 16 165.5 19 165.5 H181 C184 165.5 186 167 186 170 C186 173 184 174.5 181 174.5 H19 C16 174.5 14 173 14 170 Z"
          fill="#6b3620"
          strokeWidth={1.4}
        />
        <path
          d="M36 192 C46 185 56 199 66 192 S86 185 96 192 S116 199 126 192 S146 185 156 192 S162 196 166 193"
          fill="none"
          stroke="#d9a21b"
          strokeWidth={3}
        />
        <path d="M52 212 C70 220 130 220 148 212" fill="none" stroke="#6b3620" strokeWidth={2} />

        {/* Loose peppercorns in front */}
        {[
          [20, 224, 4.2],
          [30, 229, 3.8],
          [172, 226, 4.2],
          [182, 221, 3.6],
          [183, 230, 3.4],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? "#3a322b" : "#2d2723"} strokeWidth={1.1} />
        ))}
      </g>
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.14 6.43 2.14 11.9c0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.13-2.9-7A9.83 9.83 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.83.84-3.06-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.83 2.42 8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}
