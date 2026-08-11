import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="section-pad !pb-12 !pt-8 flex flex-col items-center text-center">
      <div className="animate-fade-up relative mb-5">
        <div
          className="pointer-events-none absolute inset-4 -z-10 rounded-full bg-[radial-gradient(circle,rgba(201,137,151,0.18),transparent_70%)] blur-md"
          aria-hidden
        />
        <Image
          src="/nossa-senhora-fatima.png"
          alt="Nossa Senhora de Fátima"
          width={280}
          height={360}
          className="mx-auto h-auto w-[6.5rem] opacity-95 md:w-[7.5rem]"
        />
      </div>

      <p className="eyebrow !text-[0.62rem]">Sob a proteção de</p>
      <p className="font-display mt-1.5 text-base tracking-[0.04em] text-marsala md:text-lg">
        Nossa Senhora de Fátima
      </p>

      <p className="script-title mt-5 text-[2.15rem] md:text-[2.4rem]">
        Eduardo &amp; Lavínia
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        Com carinho, celebramos o início da nossa casa.
      </p>
      <Link
        href="/admin"
        className="mt-6 font-display text-sm tracking-[0.06em] text-ink-faint/70 transition hover:text-marsala"
      >
        Área do casal
      </Link>
    </footer>
  );
}
