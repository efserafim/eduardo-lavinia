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
  isHoneymoon?: boolean;
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

function HoneymoonCard({ item }: { item: GiftItem }) {
  return (
    <article className="animate-fade-up honeymoon-card group">
      <div className="honeymoon-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl || "/lua-de-mel.jpg"}
          alt={item.name}
          className="transition duration-[1.4s] ease-out group-hover:scale-[1.03]"
        />
        <div className="honeymoon-card-veil" aria-hidden />
        <div className="honeymoon-card-copy">
          <p className="eyebrow !text-[0.58rem] !tracking-[0.3em] !text-pearl/80">
            Destaque
          </p>
          <h3 className="script-title mt-1 !text-[2.35rem] !text-pearl md:!text-[2.85rem]">
            Lua de Mel
          </h3>
          <p className="mx-auto mt-1.5 max-w-lg text-[0.9rem] font-light leading-relaxed text-pearl/90">
            {item.description ||
              "Uma contribuição para a nossa viagem dos sonhos."}
          </p>
        </div>
        {item.isComplete && (
          <span className="absolute top-4 right-4 z-[2] bg-pearl/90 px-3 py-1 font-display text-sm italic text-gold-soft">
            completo
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
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
            <span className="btn-ghost cursor-default opacity-50">Obrigado</span>
          ) : (
            <Link href={`/doar/${item.id}`} className="btn-primary">
              Presentear a viagem
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function GiftList({ items }: { items: GiftItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("az");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const honeymoon = useMemo(
    () => items.find((item) => item.isHoneymoon) || null,
    [items]
  );

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    const matched = items.filter((item) => {
      if (item.isHoneymoon) return false;
      if (!q) return true;
      const haystack = normalize(`${item.name} ${item.description || ""}`);
      return haystack.includes(q);
    });
    return sortItems(matched, sort);
  }, [items, deferredQuery, sort]);

  const showHoneymoon =
    honeymoon &&
    (!normalize(deferredQuery) ||
      normalize(`${honeymoon.name} ${honeymoon.description || ""}`).includes(
        normalize(deferredQuery)
      ));

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
  const listCount = filtered.length + (showHoneymoon ? 1 : 0);

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

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <label
                htmlFor="gift-sort"
                className="font-display text-sm tracking-[0.04em] text-ink-soft"
              >
                Ordenar lista por:
              </label>
              <select
                id="gift-sort"
                className="field !w-auto !min-w-[9.5rem] !cursor-pointer !py-2 !pr-8 font-display text-sm text-marsala"
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

            <p className="mt-2 font-display text-sm text-ink-faint">
              {listCount === 0
                ? "Nenhum item encontrado"
                : `${listCount} ${listCount === 1 ? "item" : "itens"}`}
              {totalPages > 1
                ? ` · página ${currentPage} de ${totalPages}`
                : ""}
            </p>
          </div>
        </div>

        {showHoneymoon && honeymoon ? (
          <div className="mt-10 md:mt-12">
            <HoneymoonCard item={honeymoon} />
          </div>
        ) : null}

        {visible.length === 0 && !showHoneymoon ? (
          <p className="mt-8 text-center font-display text-lg text-ink-soft">
            Tente outro termo de busca.
          </p>
        ) : visible.length > 0 ? (
          <ul
            className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 ${
              showHoneymoon ? "mt-6 md:mt-8" : "mt-8"
            }`}
          >
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
                      className="h-full w-full object-contain p-3 transition duration-700 group-hover:scale-[1.02] sm:p-4"
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
                    <div className="mt-2 flex items-baseline justify-between gap-2 font-display">
                      <span className="truncate text-sm text-ink-faint">
                        {formatBRL(item.raisedCents)}
                      </span>
                      <span className="shrink-0 text-base tracking-[0.02em] text-marsala sm:text-lg">
                        Meta {formatBRL(item.targetAmount)}
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
        ) : null}

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
