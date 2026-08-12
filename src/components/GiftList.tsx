"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Ornament } from "@/components/Ornament";
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

type SortKey = "az" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "az", label: "A-Z" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
];

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sortItems(items: GiftItem[], sort: SortKey) {
  const next = [...items];
  if (sort === "az") {
    next.sort((a, b) =>
      normalize(a.name).localeCompare(normalize(b.name), "pt-BR")
    );
  } else if (sort === "price-asc") {
    next.sort((a, b) => a.targetAmount - b.targetAmount);
  } else {
    next.sort((a, b) => b.targetAmount - a.targetAmount);
  }
  return next;
}

export function GiftList({ items }: { items: GiftItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("az");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    const matched = !q
      ? items
      : items.filter((item) => {
          const haystack = normalize(`${item.name} ${item.description || ""}`);
          return haystack.includes(q);
        });
    return sortItems(matched, sort);
  }, [items, deferredQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function onSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function onSortChange(value: SortKey) {
    setSort(value);
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
          <Ornament className="mt-5" />
          <p className="section-lead">
            Escolha um desejo e contribua com o valor que quiser.
          </p>

          <div className="mt-8 w-full max-w-md">
            <label className="sr-only" htmlFor="gift-search">
              Buscar presente
            </label>
            <input
              id="gift-search"
              className="field !py-3.5 text-center tracking-[0.02em]"
              type="search"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar presente…"
              autoComplete="off"
            />

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <label
                htmlFor="gift-sort"
                className="font-display text-[0.9rem] tracking-[0.06em] text-ink-soft"
              >
                Ordenar lista por
              </label>
              <select
                id="gift-sort"
                className="field !w-auto !min-w-[10rem] !cursor-pointer !border-marsala/20 !py-2 !pr-9 font-display text-[0.95rem] tracking-[0.03em] text-marsala"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-3 font-display text-sm tracking-[0.03em] text-ink-faint">
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
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
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
                      className="h-full w-full object-contain p-4 transition duration-700 group-hover:scale-[1.02] sm:p-5"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-mist/45 to-cream">
                      <span className="font-script text-3xl text-marsala/22">
                        E&L
                      </span>
                    </div>
                  )}
                  {item.isComplete && (
                    <span className="absolute top-3 right-3 bg-pearl/92 px-2.5 py-0.5 font-display text-xs italic tracking-[0.04em] text-gold-soft">
                      completo
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
                  <h3 className="font-display line-clamp-2 min-h-[2.5em] text-lg leading-snug tracking-[0.01em] text-marsala sm:text-xl">
                    {item.name}
                  </h3>

                  <div className="mt-3.5">
                    <div className="relative h-px w-full overflow-visible bg-marsala/10">
                      <div
                        className="absolute inset-y-0 left-0 bg-marsala/55"
                        style={{
                          width: `${Math.max(
                            item.percentRaised,
                            item.percentRaised > 0 ? 1 : 0
                          )}%`,
                          height: "1px",
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between gap-2 font-display text-[0.9rem] tracking-[0.02em] text-ink-faint">
                      <span className="truncate">
                        {formatBRL(item.raisedCents)}
                      </span>
                      <span className="shrink-0">
                        meta {formatBRL(item.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
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
