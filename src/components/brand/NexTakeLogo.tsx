import { useState } from "react";
import BrandImage from "./BrandImage";

/**
 * NexTake logo lockup.
 *
 * Uses the supplied brand asset `/public/icon.png` (rounded corners and a
 * hover micro-animation, matching the main blog's Navbar treatment) and falls
 * back to the scalable vector mark `/public/icon.svg` when the PNG is absent.
 */

interface NexTakeWordmarkProps {
  className?: string;
  /** `mintSuffix` renders the trailing "AKE" in mint (mobile compact bar). */
  mintSuffix?: boolean;
}

export function NexTakeWordmark({
  className = "",
  mintSuffix = true,
}: NexTakeWordmarkProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-[-0.04em] ${className}`}
    >
      NEXT
      <span className={mintSuffix ? "text-mint" : undefined}>AKE</span>
    </span>
  );
}

interface NexTakeLogoProps {
  /** Rendered icon size in pixels. */
  size?: number;
  className?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  mintSuffix?: boolean;
  subtitle?: string;
}

export function NexTakeLogo({
  size = 36,
  className = "",
  wordmarkClassName = "text-[15px]",
  showWordmark = true,
  mintSuffix = true,
  subtitle,
}: NexTakeLogoProps) {
  const [iconSrc, setIconSrc] = useState("/icon.png");

  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-navy ring-1 ring-line"
        style={{ width: size, height: size }}
      >
        <img
          src={iconSrc}
          alt="NexTake"
          width={size}
          height={size}
          decoding="async"
          onError={() => setIconSrc("/icon.svg")}
          className="h-full w-full rounded-[10px] object-cover transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </span>

      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <NexTakeWordmark
            className={`text-ink-pure ${wordmarkClassName}`}
            mintSuffix={mintSuffix}
          />
          {subtitle ? (
            <span className="nt-mono mt-0.5 text-muted-deep">{subtitle}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Mobile header lockup: small square icon plus the compact NEXTAKE wordmark
 * with the AKE portion in mint, exactly as the main blog renders it.
 */
export function NexTakeMobileBar({ slogan }: { slogan?: string }) {
  return (
    <div className="sm:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <NexTakeLogo
          size={28}
          showWordmark
          wordmarkClassName="text-[13px]"
          mintSuffix
        />
      </div>
      {slogan ? (
        <p className="truncate border-t border-line px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-deep">
          {slogan}
        </p>
      ) : null}
    </div>
  );
}

export { BrandImage };
export default NexTakeLogo;
