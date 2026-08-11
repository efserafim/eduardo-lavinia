export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden>
      <span className="ornament-line" />
      <span className="ornament-diamond" />
      <span className="ornament-line" />
    </div>
  );
}

export function FiligreeCorner({
  position = "tl",
  className = "",
}: {
  position?: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  const rotate =
    position === "tr"
      ? "rotate-90"
      : position === "br"
        ? "rotate-180"
        : position === "bl"
          ? "-rotate-90"
          : "";

  return (
    <svg
      className={`pointer-events-none absolute h-16 w-16 text-marsala/25 md:h-24 md:w-24 ${rotate} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 72C8 40 28 12 62 8"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M18 78C22 52 42 28 72 22"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.7"
      />
      <path
        d="M62 8c6 2 10 8 8 14M62 8c-2 6 2 12 8 14"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <circle cx="72" cy="22" r="1.5" fill="currentColor" opacity="0.5" />
      <path
        d="M8 72c4-2 10 0 12 6"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function FloralWash({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="animate-bloom absolute -top-24 left-1/2 h-[28rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(226,180,188,0.35)_0%,transparent_68%)] blur-2xl" />
      <div
        className="animate-bloom absolute top-[40%] -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(138,154,123,0.18)_0%,transparent_70%)] blur-2xl"
        style={{ animationDelay: "0.3s" }}
      />
      <div
        className="animate-bloom absolute top-[30%] -right-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(138,167,181,0.16)_0%,transparent_70%)] blur-2xl"
        style={{ animationDelay: "0.5s" }}
      />
    </div>
  );
}
