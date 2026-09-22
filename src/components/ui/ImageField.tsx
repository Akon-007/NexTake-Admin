import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, UploadCloud, X } from "lucide-react";
import { backend } from "../../lib/backend";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "../../lib/config";

interface ImageFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  hint?: string;
  /** Preview aspect, e.g. `aspect-[16/9]` or a square logo box. */
  previewClassName?: string;
  roundPreview?: boolean;
}

export default function ImageField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  previewClassName = "aspect-[16/9]",
  roundPreview = false,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as never)) {
      setUploadError("Use a JPG, PNG, WebP, AVIF or SVG image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Images must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    const result = await backend.storage.upload(file, "covers");
    setUploading(false);

    if (result.error || !result.data) {
      setUploadError(result.error ?? "Upload failed. Try again.");
      return;
    }

    setBroken(false);
    onChange(result.data.url);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
        >
          {label}
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setBroken(false);
            }}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep transition-colors hover:text-rose-400"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-surface ${
            roundPreview
              ? "h-16 w-16 rounded-xl"
              : `w-full sm:w-44 ${previewClassName}`
          }`}
        >
          {value && !broken ? (
            <img
              src={value}
              alt={`${label} preview`}
              onError={() => setBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-deep">
              <ImagePlus className="h-5 w-5" />
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
                No image
              </span>
            </div>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/70">
              <Loader2 className="h-4 w-4 animate-spin text-mint" />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-deep" />
            <input
              id={id}
              type="url"
              value={value}
              onChange={(event) => {
                setBroken(false);
                onChange(event.target.value);
              }}
              placeholder="https://… or upload a file"
              className={`w-full rounded-xl border bg-surface py-2.5 pl-9 pr-3 font-mono text-[12px] text-ink placeholder:text-muted-deep focus:outline-none focus:ring-2 focus:ring-mint/30 ${
                error || uploadError
                  ? "border-rose-500/60"
                  : "border-line hover:border-line-strong"
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-[11px] font-semibold text-ink transition-colors hover:border-mint/50 hover:text-mint disabled:opacity-60"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
              JPG · PNG · WebP · SVG · max 5 MB
            </span>
          </div>
        </div>
      </div>

      {uploadError || error ? (
        <p className="text-[11px] font-medium text-rose-400">
          {uploadError ?? error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-muted-deep">{hint}</p>
      ) : null}
    </div>
  );
}
