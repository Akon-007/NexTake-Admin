interface NexTakeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "header";
  lightMode?: boolean;
}

export default function NexTakeLogo({
  className = "",
  size = "md",
  lightMode = false,
}: NexTakeLogoProps) {
  const heightClasses = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-11 sm:h-12",
    xl: "h-14 sm:h-16",
    header: "h-10 sm:h-12 md:h-14",
  };

  const maxWidthClasses = {
    sm: "max-w-[200px]",
    md: "max-w-[260px] sm:max-w-[300px]",
    lg: "max-w-[320px] sm:max-w-[380px]",
    xl: "max-w-[400px] sm:max-w-[480px]",
    header: "max-w-[300px] sm:max-w-[420px] md:max-w-[520px]",
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Authentic user brand header image */}
      <img
        src="/header.svg"
        onError={(e) => {
          // Graceful fallback to PNG if needed
          const target = e.currentTarget;
          if (!target.src.endsWith("/header.png")) {
            target.src = "/header.png";
          }
        }}
        alt="NexTake - Technology News. Intelligently Curated."
        className={`${heightClasses[size]} ${maxWidthClasses[size]} w-auto object-contain transition-transform hover:opacity-95 ${
          lightMode ? "brightness-0 invert-0 contrast-125" : ""
        }`}
      />
    </div>
  );
}


