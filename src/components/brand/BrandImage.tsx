import { useState } from "react";

interface BrandImageProps {
  /** Path inside `public/`, e.g. `/header.png`. */
  src: string;
  alt: string;
  className?: string;
  /** Rendered instead of nothing when the asset has not been added yet. */
  placeholderClassName?: string;
  loading?: "lazy" | "eager";
}

/**
 * Brand artwork (header banner, footer showcase, icon).
 *
 * Silently renders a neutral placeholder if the file is missing so the UI
 * never shows a broken-image glyph while assets are being swapped in.
 */
export default function BrandImage({
  src,
  alt,
  className = "",
  placeholderClassName = "bg-gradient-to-r from-navy via-card to-navy",
  loading = "lazy",
}: BrandImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${placeholderClassName} ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
