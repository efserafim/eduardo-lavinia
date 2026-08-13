import Link from "next/link";
import { formatBRL } from "@/lib/money";
import { ORATORY_DESCRIPTION, ORATORY_TEACHING } from "@/lib/oratory";

type OratoryItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  targetAmount: number;
  raisedCents: number;
  percentRaised: number;
  isComplete: boolean;
};

export function OratorySection({ item }: { item: OratoryItem | null }) {
  if (!item) return null;

  const description = item.description || ORATORY_DESCRIPTION;

  return (
    <section id="oratorio" className="section-pad">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[65%] bg-[radial-gradient(ellipse_at_center,rgba(212,165,176,0.16),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl">
        <div className="animate-fade-up mx-auto flex max-w-xl flex-col items-center text-center">
          <p className="eyebrow">Igreja doméstica</p>
          <h2 className="script-title !text-[2.4rem] text-marsala md:!text-[2.85rem]">
            Oratório
          </h2>
          <p className="section-lead mt-2 !text-base">
            Um espaço sagrado no lar, para a oração do casal e a presença de
            Deus na vida conjugal.
          </p>
        </div>

        <article className="animate-fade-up featured-card group mt-7 md:mt-8">
          <div className="featured-card-layout">
            <div className="featured-card-media">
              <div className="featured-card-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl || "/oratorio.jpg"}
                  alt={item.name}
                />
              </div>
              {item.isComplete && (
                <span className="absolute top-4 right-4 z-[2] bg-pearl/90 px-3 py-1 font-display text-sm italic text-gold-soft">
                  completo
                </span>
              )}
            </div>

            <div className="featured-card-body">
              <div className="featured-card-text">
                <p className="font-display text-[0.9rem] leading-relaxed text-ink-soft sm:text-[0.95rem]">
                  {description}
                </p>
                <p className="mt-2.5 text-[0.8rem] font-light leading-relaxed text-ink-faint italic">
                  {ORATORY_TEACHING}
                </p>
              </div>

              <div className="featured-card-footer">
                <div className="min-w-0 flex-1">
                  <div className="relative h-1 w-full overflow-hidden bg-marsala/10">
                    <div
                      className="absolute inset-y-0 left-0 bg-marsala/65"
                      style={{
                        width: `${Math.max(
                          item.percentRaised,
                          item.percentRaised > 0 ? 1 : 0
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 font-display">
                    <span className="text-sm text-ink-faint sm:text-base">
                      {formatBRL(item.raisedCents)} arrecadados
                    </span>
                    <span className="text-base tracking-[0.02em] text-marsala sm:text-lg">
                      Meta {formatBRL(item.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 sm:pl-6">
                  {item.isComplete ? (
                    <span className="btn-ghost cursor-default opacity-50">
                      Obrigado
                    </span>
                  ) : (
                    <Link href={`/doar/${item.id}`} className="btn-primary">
                      Presentear o oratório
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
