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
    name: "São Luís e Santa Zélia",
    subtitle: "Pais de Santa Teresinha",
    wide: true,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="section-pad !pb-12 flex flex-col items-center text-center">
      <p className="eyebrow animate-fade-up">Sob a proteção de</p>

      <div className="mt-10 flex flex-wrap items-end justify-center gap-8 md:mt-12 md:gap-12">
        {patrons.map((patron, index) => (
          <figure
            key={patron.src}
            className="animate-fade-up flex max-w-[10.5rem] flex-col items-center md:max-w-[12rem]"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="relative mb-3">
              <div
                className="pointer-events-none absolute inset-5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(201,137,151,0.16),transparent_70%)] blur-md"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${patron.src}?v=3`}
                alt={patron.alt}
                className={`mx-auto h-auto w-auto bg-transparent object-contain ${
                  patron.wide
                    ? "max-h-[8rem] md:max-h-[9.25rem]"
                    : "max-h-[7.5rem] md:max-h-[8.75rem]"
                }`}
              />
            </div>
            <figcaption className="font-display text-[0.95rem] italic leading-snug text-marsala-mid md:text-base">
              {patron.name}
            </figcaption>
            {"subtitle" in patron && patron.subtitle ? (
              <p className="mt-1 text-[0.65rem] tracking-[0.14em] text-ink-faint uppercase">
                {patron.subtitle}
              </p>
            ) : null}
          </figure>
        ))}
      </div>

      <div className="animate-fade-up mt-14 max-w-md">
        <p className="eyebrow">Com a bênção de</p>
        <p className="section-title !mt-2 !text-[1.65rem] md:!text-[1.9rem]">
          Nossos pais
        </p>
        <p className="section-lead !mt-3">
          Em cujo amor aprendemos a amar, e sob cuja oração damos início à nossa
          casa.
        </p>
      </div>

      <p className="script-title mt-10">Eduardo &amp; Lavínia</p>
      <p className="section-lead mt-3 !max-w-sm">
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
