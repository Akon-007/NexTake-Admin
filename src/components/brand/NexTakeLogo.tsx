/**
 * NexTake "NT" mark — vector geometric logo.
 *
 * Geometry (unchanged from the original brand asset):
 *  - dark navy vertical pillar (the N stem)
 *  - wide 95px lower diagonal mint ribbon stroke
 *  - angled negative-space channel between the N and the T
 *  - mint accent polygon folded over the upper horizontal crossbar of the T
 */

interface NexTakeMarkProps {
  size?: number;
  className?: string;
  /** Fill used for the angled negative-space channel (defaults to canvas navy). */
  channelClassName?: string;
  title?: string;
}

export function NexTakeMark({
  size = 32,
  className = "",
  channelClassName = "fill-canvas",
  title,
}: NexTakeMarkProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}

      {/* N — vertical pillar */}
      <polygon points="12,8 30,8 30,120 12,120" fill="#040A12" />
      {/* N — diagonal */}
      <polygon points="30,8 48,8 76,120 58,120" fill="#040A12" />
      {/* N — right pillar */}
      <polygon points="58,8 76,8 76,120 58,120" fill="#040A12" />

      {/* T — upper horizontal crossbar */}
      <polygon points="88,8 126,8 126,27 88,27" fill="#040A12" />
      {/* T — stem */}
      <polygon points="99,27 115,27 115,120 99,120" fill="#040A12" />

      {/* Mint accent polygon folded over the upper crossbar */}
      <polygon points="88,8 126,8 115,27 99,27" fill="#3DF2AC" />

      {/* Wide 95px lower diagonal ribbon stroke */}
      <polygon points="12,97 107,97 119,118 24,118" fill="#00F2AA" />

      {/* Angled negative-space channel */}
      <polygon points="76,8 88,8 80,120 68,120" className={channelClassName} />
    </svg>
  );
}

interface NexTakeWordmarkProps {
  className?: string;
  /** `mintSuffix` renders the trailing "AKE" in mint (used on the mobile bar). */
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
  size?: number;
  className?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  mintSuffix?: boolean;
  subtitle?: string;
}

export function NexTakeLogo({
  size = 34,
  className = "",
  wordmarkClassName = "text-[15px]",
  showWordmark = true,
  mintSuffix = true,
  subtitle,
}: NexTakeLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-navy ring-1 ring-line">
        <NexTakeMark size={size * 0.62} className="rounded-[6px]" />
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

export default NexTakeLogo;
