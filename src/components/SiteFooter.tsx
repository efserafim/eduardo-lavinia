import Link from "next/link";

const patrons = [
  {
    src: "/nossa-senhora-fatima.png",
    alt: "Nossa Senhora de Fátima",
    name: "Nossa Senhora de Fátima",
    wide: false,
  },
  {
    src: "/santa-teresinha.png",
    alt: "Santa Teresinha do Menino Jesus",
    name: "Santa Teresinha",
    wide: false,
  },
  {
    src: "/sao-luis-santa-zelia.png",
    alt: "São Luís Martin e Santa Zélia Martin",
    name: "São Luís & Santa Zélia",
    subtitle: "Pais de Santa Teresinha",
    wide: true,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="section-pad !pb-12 !pt-8 flex flex-col items-center text-center">
      <p className="eyebrow !text-[0.62rem]">Sob a proteção de</p>

      <div className="mt-5 flex flex-wrap items-end justify-center gap-8 md:gap-10">
        {patrons.map((patron) => (
          <div
            key={patron.src}
            className="animate-fade-up flex max-w-[11rem] flex-col items-center md:max-w-[13rem]"
          >
            <div className="relative mb-3">
              <div
                className="pointer-events-none absolute inset-4 -z-10 rounded-full bg-[radial-gradient(circle,rgba(201,137,151,0.18),transparent_70%)] blur-md"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${patron.src}?v=3`}
                alt={patron.alt}
                className={`mx-auto h-auto w-auto bg-transparent object-contain ${
                  patron.wide
                    ? "max-h-[9.5rem] md:max-h-[11rem]"
                    : "max-h-[8.5rem] md:max-h-[10rem]"
                }`}
              />
            </div>
            <p className="font-display text-[0.95rem] tracking-[0.04em] text-marsala md:text-base">
              {patron.name}
            </p>
            {"subtitle" in patron && patron.subtitle ? (
              <p className="mt-1 text-[0.7rem] tracking-[0.06em] text-ink-faint uppercase">
                {patron.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <p className="eyebrow mt-10 !text-[0.62rem]">Com a bênção de</p>
      <p className="font-display mt-2 text-base tracking-[0.04em] text-marsala-mid md:text-lg">
        Nossos pais
      </p>

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
