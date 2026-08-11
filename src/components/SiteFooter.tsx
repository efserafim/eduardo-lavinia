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
    <footer className="section-pad !pb-12 !pt-10 flex flex-col items-center text-center">
      <p className="eyebrow !text-[0.58rem] !tracking-[0.32em] text-sky-soft/90">
        Sob a proteção de
      </p>

      <div className="mt-7 flex flex-wrap items-end justify-center gap-10 md:gap-14">
        {patrons.map((patron) => (
          <div
            key={patron.src}
            className="animate-fade-up flex max-w-[9.5rem] flex-col items-center md:max-w-[11rem]"
          >
            <div className="relative mb-3.5">
              <div
                className="pointer-events-none absolute inset-6 -z-10 rounded-full bg-[radial-gradient(circle,rgba(201,137,151,0.12),transparent_72%)] blur-lg"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${patron.src}?v=3`}
                alt={patron.alt}
                className={`mx-auto h-auto w-auto bg-transparent object-contain opacity-[0.92] ${
                  patron.wide
                    ? "max-h-[7.25rem] md:max-h-[8.5rem]"
                    : "max-h-[6.75rem] md:max-h-[8rem]"
                }`}
              />
            </div>
            <p className="font-display text-[0.82rem] font-normal tracking-[0.06em] text-marsala/80 md:text-[0.9rem]">
              {patron.name}
            </p>
            {"subtitle" in patron && patron.subtitle ? (
              <p className="mt-1.5 text-[0.58rem] font-light tracking-[0.18em] text-ink-faint/80 uppercase">
                {patron.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div
        className="mt-11 h-px w-16 bg-gradient-to-r from-transparent via-rose-petal/35 to-transparent"
        aria-hidden
      />

      <div className="mt-8 max-w-sm">
        <p className="eyebrow !text-[0.58rem] !tracking-[0.32em] text-sky-soft/90">
          Com a bênção de
        </p>
        <p className="font-display mt-2.5 text-lg font-normal tracking-[0.06em] text-marsala/85 md:text-xl">
          Nossos pais
        </p>
        <p className="mt-3 text-[0.88rem] font-light leading-[1.65] text-ink-soft/90">
          Em cujo amor aprendemos a amar, e sob cuja oração damos início à nossa
          casa.
        </p>
      </div>

      <p className="script-title mt-9 text-[2rem] md:text-[2.25rem]">
        Eduardo &amp; Lavínia
      </p>
      <p className="mt-2.5 max-w-xs text-[0.88rem] font-light leading-relaxed text-ink-soft/85">
        Com carinho, celebramos o início da nossa casa.
      </p>
      <Link
        href="/admin"
        className="mt-7 font-display text-xs tracking-[0.12em] text-ink-faint/55 transition hover:text-marsala/80"
      >
        Área do casal
      </Link>
    </footer>
  );
}
