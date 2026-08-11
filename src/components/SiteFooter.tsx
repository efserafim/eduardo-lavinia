import Image from "next/image";
import Link from "next/link";

const patrons = [
  {
    src: "/nossa-senhora-fatima.png",
    alt: "Nossa Senhora de Fátima",
    name: "Nossa Senhora de Fátima",
  },
  {
    src: "/santa-teresinha.png",
    alt: "Santa Teresinha do Menino Jesus",
    name: "Santa Teresinha",
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="section-pad !pb-12 !pt-8 flex flex-col items-center text-center">
      <p className="eyebrow !text-[0.62rem]">Sob a proteção de</p>

      <div className="mt-5 flex flex-wrap items-end justify-center gap-8 md:gap-12">
        {patrons.map((patron) => (
          <div key={patron.src} className="animate-fade-up flex flex-col items-center">
            <div className="relative mb-3">
              <div
                className="pointer-events-none absolute inset-4 -z-10 rounded-full bg-[radial-gradient(circle,rgba(201,137,151,0.18),transparent_70%)] blur-md"
                aria-hidden
              />
              <Image
                src={patron.src}
                alt={patron.alt}
                width={280}
                height={360}
                className="mx-auto h-auto w-[5.75rem] opacity-95 md:w-[6.75rem]"
              />
            </div>
            <p className="font-display text-[0.95rem] tracking-[0.04em] text-marsala md:text-base">
              {patron.name}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-md">
        <p className="eyebrow !text-[0.62rem]">Com a bênção de</p>
        <p className="font-display mt-2 text-base tracking-[0.03em] text-marsala-mid md:text-lg">
          Nossos pais
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Que com amor e oração nos acompanham neste início de lar.
        </p>
      </div>

      <p className="script-title mt-8 text-[2.15rem] md:text-[2.4rem]">
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
