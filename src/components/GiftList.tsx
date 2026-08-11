"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { formatBRL } from "@/lib/money";

export type GiftItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  targetAmount: number;
  raisedCents: number;
  remainingCents: number;
  percentRaised: number;
  percentRemaining: number;
  isComplete: boolean;
};

const PAGE_SIZE = 6;

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function GiftList({ items }: { items: GiftItem[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    if (!q) return items;
    return items.filter((item) => {
      const haystack = normalize(`${item.name} ${item.description || ""}`);
      return haystack.includes(q);
    });
  }, [items, deferredQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function onSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(next);
    document.getElementById("presentes")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <section id="presentes" className="section-pad">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_top,rgba(240,228,230,0.2),transparent_72%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="animate-fade-up mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="eyebrow">Lista de desejos</p>
          <h2 className="section-title">Para o nosso lar</h2>
          <p className="section-lead">
            Escolha um desejo e contribua com o valor que quiser.
          </p>

          <div className="mt-6 w-full max-w-sm">
            <label className="sr-only" htmlFor="gift-search">
              Buscar presente
            </label>
            <input
              id="gift-search"
              className="field !py-3 text-center"
              type="search"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar presente…"
              autoComplete="off"
            />
            <p className="mt-2 font-display text-sm text-ink-faint">
              {filtered.length === 0
                ? "Nenhum item encontrado"
                : `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`}
              {totalPages > 1
                ? ` · página ${currentPage} de ${totalPages}`
                : ""}
            </p>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="mt-8 text-center font-display text-lg text-ink-soft">
            Tente outro termo de busca.
          </p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {visible.map((item, index) => (
              <li
                key={item.id}
                className="animate-fade-up gift-tile group"
                style={{ animationDelay: `${0.04 * index}s` }}
              >
                <div className="gift-tile-media">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-mist/50 to-cream">
                      <span className="font-script text-3xl text-marsala/25">
                        E&L
                      </span>
                    </div>
                  )}
                  {item.isComplete && (
                    <span className="absolute top-2 right-2 bg-pearl/90 px-2 py-0.5 font-display text-xs italic text-gold-soft">
                      completo
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <h3 className="font-display line-clamp-2 min-h-[2.4em] text-lg leading-snug text-marsala sm:text-xl">
                    {item.name}
                  </h3>

                  <div className="mt-2.5">
                    <div className="relative h-1 w-full overflow-hidden rounded-sm bg-marsala/10">
                      <div
                        className="absolute inset-y-0 left-0 bg-marsala/60"
                        style={{
                          width: `${Math.max(
                            item.percentRaised,
                            item.percentRaised > 0 ? 1 : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between gap-2 font-display text-sm text-ink-faint">
                      <span className="truncate">
                        {formatBRL(item.raisedCents)}
                      </span>
                      <span className="shrink-0">
                        meta {formatBRL(item.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    {item.isComplete ? (
                      <span className="btn-ghost w-full cursor-default opacity-50">
                        Obrigado
                      </span>
                    ) : (
                      <Link
                        href={`/doar/${item.id}`}
                        className="btn-primary w-full"
                      >
                        Contribuir
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
            aria-label="Paginação da lista"
          >
            <button
              type="button"
              className="btn-chip"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Página anterior"
            >
              ‹
            </button>

            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                className={`btn-chip min-w-10 ${
                  n === currentPage ? "is-active" : ""
                }`}
                onClick={() => goToPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              className="btn-chip"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Próxima página"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
