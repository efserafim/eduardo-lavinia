import Link from "next/link";
import { Ornament } from "./Ornament";

export function SiteFooter() {
  return (
    <footer className="relative flex flex-col items-center px-6 pt-10 pb-14 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marsala/15 to-transparent" />

      <p className="script-title text-[2.5rem]">Eduardo & Lavínia</p>
      <Ornament className="mt-4" />
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
        Com carinho, celebramos o início da nossa casa.
      </p>
      <Link
        href="/admin"
        className="mt-8 font-display text-sm tracking-[0.06em] text-ink-faint/70 transition hover:text-marsala"
      >
        Área do casal
      </Link>
    </footer>
  );
}
