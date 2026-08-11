import { Ornament } from "./Ornament";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

export function Gallery({ photos }: { photos: Photo[] }) {
  const slots =
    photos.length > 0
      ? photos.slice(0, 3)
      : [
          { id: "p1", url: "", caption: "Nosso encontro" },
          { id: "p2", url: "", caption: "O pedido" },
          { id: "p3", url: "", caption: "Preparando o lar" },
        ];

  return (
    <section id="galeria" className="section-pad">
      <div className="section-rule" aria-hidden />

      <div className="mx-auto max-w-5xl">
        <div className="animate-fade-up flex flex-col items-center text-center">
          <p className="eyebrow">Nossa história</p>
          <h2 className="section-title">Eduardo & Lavínia</h2>
          <Ornament className="mt-5" />
          <p className="section-lead">
            Memórias que nos trouxeram até aqui — e as que ainda vamos escrever.
          </p>
        </div>

        <div className="mt-16 grid items-end gap-6 sm:grid-cols-3 sm:gap-5">
          {slots.map((photo, index) => (
            <figure
              key={photo.id}
              className={`animate-fade-up photo-frame group ${
                index === 1 ? "sm:-translate-y-6" : ""
              }`}
              style={{ animationDelay: `${0.12 * index}s` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-sand/40">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={photo.caption || "Foto do casal"}
                    className="h-full w-full object-cover transition duration-[1.1s] ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-blush-mist/60 to-cream px-4 text-center">
                    <span className="font-script text-5xl leading-none text-marsala/20">
                      E&L
                    </span>
                    <span className="mt-4 font-display text-sm tracking-[0.12em] text-ink-faint">
                      Em breve
                    </span>
                  </div>
                )}
              </div>
              {photo.caption && (
                <figcaption className="relative z-10 mt-3 text-center font-display text-base italic leading-snug text-marsala-mid">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
