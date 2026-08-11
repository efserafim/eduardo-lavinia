"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatBRL, progressForItem } from "@/lib/money";
import { FloralWash, Ornament } from "@/components/Ornament";
import { ProgressBar } from "@/components/ProgressBar";

type Donation = {
  id: string;
  donorName: string | null;
  amount: number;
  status: string;
  createdAt: string;
  itemId?: string;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  imageUrl: string | null;
  donations: Donation[];
};

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

type Tab = "resumo" | "presentes" | "galeria" | "doacoes";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "presentes", label: "Presentes" },
  { id: "galeria", label: "Galeria" },
  { id: "doacoes", label: "Doações" },
];

function centsToField(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statusLabel(status: string) {
  if (status === "paid") return "Pago";
  if (status === "pending") return "Pendente";
  if (status === "cancelled") return "Cancelada";
  return status;
}

export function AdminDashboard({
  items: initialItems,
  photos: initialPhotos,
}: {
  items: Item[];
  photos: Photo[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resumo");
  const [items, setItems] = useState(initialItems);
  const [photos, setPhotos] = useState(initialPhotos);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [showNewItem, setShowNewItem] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [donationFilter, setDonationFilter] = useState<
    "all" | "paid" | "pending" | "cancelled"
  >("all");
  const [editingDonationId, setEditingDonationId] = useState<string | null>(
    null
  );
  const [editDonorName, setEditDonorName] = useState("");
  const [editDonationAmount, setEditDonationAmount] = useState("");
  const [editDonationStatus, setEditDonationStatus] = useState("paid");
  const [donationSaving, setDonationSaving] = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4200);
    return () => clearTimeout(t);
  }, [message]);

  const stats = useMemo(() => {
    const allDonations = items.flatMap((item) =>
      item.donations.map((d) => ({ ...d, itemId: item.id, itemName: item.name }))
    );
    const paid = allDonations.filter((d) => d.status === "paid");
    const pending = allDonations.filter((d) => d.status === "pending");
    const cancelled = allDonations.filter((d) => d.status === "cancelled");
    const totalRaised = paid.reduce((s, d) => s + d.amount, 0);
    const totalTarget = items.reduce((s, i) => s + i.targetAmount, 0);
    const funded = items.filter((item) => {
      const raised = item.donations
        .filter((d) => d.status === "paid")
        .reduce((s, d) => s + d.amount, 0);
      return raised >= item.targetAmount;
    }).length;
    const overall = progressForItem(totalRaised, totalTarget || 1);

    return {
      allDonations: allDonations.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
      paidCount: paid.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      totalRaised,
      totalTarget,
      funded,
      itemCount: items.length,
      photoCount: photos.length,
      overall,
    };
  }, [items, photos]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const filteredDonations = useMemo(() => {
    if (donationFilter === "all") return stats.allDonations;
    return stats.allDonations.filter((d) => d.status === donationFilter);
  }, [stats.allDonations, donationFilter]);

  async function refresh() {
    const [itemsRes, photosRes] = await Promise.all([
      fetch("/api/items"),
      fetch("/api/photos"),
    ]);
    if (itemsRes.ok) {
      const data = await itemsRes.json();
      setItems(data.items);
    }
    if (photosRes.ok) {
      const data = await photosRes.json();
      setPhotos(data.photos);
    }
    router.refresh();
  }

  async function logout() {
    const { createBrowserSupabase } = await import("@/lib/supabase/client");
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    await fetch("/api/auth/login", { method: "DELETE" });
    router.refresh();
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("targetAmount", targetAmount);
    if (imageFile) fd.append("image", imageFile);

    const res = await fetch("/api/items", { method: "POST", body: fd });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Erro ao criar item.");
      return;
    }
    setName("");
    setDescription("");
    setTargetAmount("");
    setImageFile(null);
    setShowNewItem(false);
    setMessage("Presente adicionado.");
    setTab("presentes");
    await refresh();
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description || "");
    setEditTarget(centsToField(item.targetAmount));
    setExpandedItem(item.id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    setMessage("");
    const fd = new FormData();
    fd.append("id", id);
    fd.append("name", editName);
    fd.append("description", editDescription);
    fd.append("targetAmount", editTarget);
    const res = await fetch("/api/items", { method: "PUT", body: fd });
    const data = await res.json();
    setEditSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Erro ao salvar.");
      return;
    }
    setEditingId(null);
    setMessage("Presente atualizado.");
    await refresh();
  }

  async function updateItemImage(id: string, file: File | null) {
    if (!file) return;
    setMessage("");
    const fd = new FormData();
    fd.append("id", id);
    fd.append("image", file);
    const res = await fetch("/api/items", { method: "PUT", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Erro ao enviar foto do item.");
      return;
    }
    setMessage("Foto do presente atualizada.");
    await refresh();
  }

  async function removeItemImage(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("removeImage", "1");
    const res = await fetch("/api/items", { method: "PUT", body: fd });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Erro ao remover foto.");
      return;
    }
    setMessage("Foto removida.");
    await refresh();
  }

  async function deleteItem(id: string) {
    if (!confirm("Excluir este presente e suas doações?")) return;
    await fetch(`/api/items?id=${id}`, { method: "DELETE" });
    setMessage("Presente excluído.");
    if (editingId === id) setEditingId(null);
    await refresh();
  }

  async function uploadPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput.files?.[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", fileInput.files[0]);
    if (caption) fd.append("caption", caption);
    const res = await fetch("/api/photos", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Erro no upload.");
      return;
    }
    setCaption("");
    form.reset();
    setMessage("Foto da galeria adicionada.");
    await refresh();
  }

  async function deletePhoto(id: string) {
    if (!confirm("Remover esta foto?")) return;
    await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    setMessage("Foto removida.");
    await refresh();
  }

  function startEditDonation(d: Donation & { itemName?: string }) {
    setEditingDonationId(d.id);
    setEditDonorName(d.donorName || "");
    setEditDonationAmount(centsToField(d.amount));
    setEditDonationStatus(d.status);
    setTab("doacoes");
  }

  function cancelEditDonation() {
    setEditingDonationId(null);
  }

  async function saveDonation(id: string) {
    setDonationSaving(true);
    setMessage("");
    const res = await fetch("/api/donations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        donorName: editDonorName,
        amount: editDonationAmount,
        status: editDonationStatus,
      }),
    });
    const data = await res.json();
    setDonationSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Erro ao salvar doação.");
      return;
    }
    setEditingDonationId(null);
    setMessage("Doação atualizada.");
    await refresh();
  }

  async function setDonationStatus(id: string, status: string) {
    setMessage("");
    const res = await fetch("/api/donations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Erro ao atualizar status.");
      return;
    }
    setMessage(
      status === "paid"
        ? "Doação marcada como paga."
        : status === "pending"
          ? "Doação marcada como pendente."
          : "Doação cancelada."
    );
    await refresh();
  }

  async function deleteDonation(id: string) {
    if (!confirm("Excluir esta doação permanentemente?")) return;
    const res = await fetch(`/api/donations?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Erro ao excluir doação.");
      return;
    }
    if (editingDonationId === id) setEditingDonationId(null);
    setMessage("Doação excluída.");
    await refresh();
  }

  return (
    <div className="relative min-h-[100svh]">
      <FloralWash className="opacity-70" />

      <header className="admin-topbar sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="text-[0.65rem] tracking-[0.28em] text-sky-soft uppercase">
              Área do casal
            </p>
            <h1 className="font-script mt-0.5 truncate text-3xl text-marsala sm:text-4xl">
              Eduardo &amp; Lavínia
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="btn-ghost !min-h-10 !px-3 !text-[0.95rem]">
              Ver site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="btn-ghost !min-h-10 !px-3 !text-[0.95rem]"
            >
              Sair
            </button>
          </div>
        </div>

        <nav
          className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 pb-3 sm:px-8"
          aria-label="Seções do painel"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`admin-tab ${tab === t.id ? "is-active" : ""}`}
            >
              {t.label}
              {t.id === "doacoes" && stats.pendingCount > 0 && (
                <span className="admin-badge">{stats.pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
        {message && (
          <p
            role="status"
            className="animate-fade-up border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-marsala backdrop-blur-sm"
          >
            {message}
          </p>
        )}

        {tab === "resumo" && (
          <section className="animate-fade-up space-y-8">
            <div className="text-center">
              <p className="eyebrow">Visão geral</p>
              <h2 className="script-title mt-2">Chá de panela</h2>
              <Ornament className="mt-4" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="admin-stat">
                <p className="admin-stat-label">Arrecadado</p>
                <p className="admin-stat-value">{formatBRL(stats.totalRaised)}</p>
                <p className="admin-stat-meta">
                  meta {formatBRL(stats.totalTarget)}
                </p>
              </article>
              <article className="admin-stat">
                <p className="admin-stat-label">Progresso</p>
                <p className="admin-stat-value">{stats.overall.percentRaised}%</p>
                <p className="admin-stat-meta">
                  {stats.funded} de {stats.itemCount} presentes completos
                </p>
              </article>
              <article className="admin-stat">
                <p className="admin-stat-label">Doações pagas</p>
                <p className="admin-stat-value">{stats.paidCount}</p>
                <p className="admin-stat-meta">
                  {stats.pendingCount} pendente
                  {stats.pendingCount === 1 ? "" : "s"}
                </p>
              </article>
              <article className="admin-stat">
                <p className="admin-stat-label">Galeria</p>
                <p className="admin-stat-value">{stats.photoCount}</p>
                <p className="admin-stat-meta">fotos no site</p>
              </article>
            </div>

            <div className="admin-panel space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-marsala">
                    Progresso geral
                  </h3>
                  <p className="mt-1 text-sm text-ink-faint">
                    Soma de todos os presentes
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-chip"
                  onClick={() => setTab("presentes")}
                >
                  Gerenciar presentes
                </button>
              </div>
              <ProgressBar
                percentRaised={stats.overall.percentRaised}
                percentRemaining={stats.overall.percentRemaining}
              />
            </div>

            <div className="admin-panel">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl text-marsala">
                  Últimas doações
                </h3>
                <button
                  type="button"
                  className="font-display text-sm text-marsala/70 hover:text-marsala"
                  onClick={() => setTab("doacoes")}
                >
                  Ver todas
                </button>
              </div>
              {stats.allDonations.length === 0 ? (
                <p className="text-sm text-ink-faint">
                  Ainda não há doações registradas.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {stats.allDonations.slice(0, 6).map((d) => (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-ink">
                          {d.donorName || "Anônimo"}
                          <span className="text-ink-faint">
                            {" "}
                            · {d.itemName}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          {formatDate(d.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`admin-status ${
                            d.status === "paid" ? "is-paid" : "is-pending"
                          }`}
                        >
                          {statusLabel(d.status)}
                        </span>
                        <span className="font-display text-base text-marsala">
                          {formatBRL(d.amount)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setTab("presentes");
                  setShowNewItem(true);
                }}
              >
                Novo presente
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setTab("galeria")}
              >
                Adicionar foto
              </button>
            </div>
          </section>
        )}

        {tab === "presentes" && (
          <section className="animate-fade-up space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-marsala sm:text-3xl">
                  Presentes
                </h2>
                <p className="mt-1 text-sm text-ink-faint">
                  {items.length} item{items.length === 1 ? "" : "s"} na lista
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowNewItem((v) => !v)}
              >
                {showNewItem ? "Fechar" : "Novo presente"}
              </button>
            </div>

            {showNewItem && (
              <form onSubmit={createItem} className="admin-panel grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <h3 className="font-display text-lg text-marsala">
                    Adicionar presente
                  </h3>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="name">
                    Nome
                  </label>
                  <input
                    id="name"
                    className="field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="description">
                    Descrição
                  </label>
                  <input
                    id="description"
                    className="field"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="target">
                    Valor-meta (R$)
                  </label>
                  <input
                    id="target"
                    className="field"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="450,00"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="itemImage">
                    Foto
                  </label>
                  <input
                    id="itemImage"
                    type="file"
                    accept="image/*"
                    className="field"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Salvando…" : "Adicionar"}
                  </button>
                </div>
              </form>
            )}

            <div className="relative">
              <label className="sr-only" htmlFor="search-items">
                Buscar presentes
              </label>
              <input
                id="search-items"
                className="field !py-3"
                placeholder="Buscar por nome…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <ul className="space-y-4">
              {filteredItems.length === 0 && (
                <li className="admin-panel text-sm text-ink-faint">
                  Nenhum presente encontrado.
                </li>
              )}
              {filteredItems.map((item) => {
                const paid = item.donations.filter((d) => d.status === "paid");
                const raised = paid.reduce((s, d) => s + d.amount, 0);
                const prog = progressForItem(raised, item.targetAmount);
                const open = expandedItem === item.id;
                const editing = editingId === item.id;

                return (
                  <li key={item.id} className="admin-panel !p-0 overflow-hidden">
                    <div className="flex gap-4 p-4 sm:p-5">
                      <div className="h-20 w-20 shrink-0 overflow-hidden border border-[var(--line)] bg-cream sm:h-24 sm:w-24">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-script text-xl text-marsala/25">
                            E&amp;L
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {editing ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label className="label" htmlFor={`edit-name-${item.id}`}>
                                Nome
                              </label>
                              <input
                                id={`edit-name-${item.id}`}
                                className="field !py-2.5"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label
                                className="label"
                                htmlFor={`edit-desc-${item.id}`}
                              >
                                Descrição
                              </label>
                              <input
                                id={`edit-desc-${item.id}`}
                                className="field !py-2.5"
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label
                                className="label"
                                htmlFor={`edit-target-${item.id}`}
                              >
                                Meta (R$)
                              </label>
                              <input
                                id={`edit-target-${item.id}`}
                                className="field !py-2.5"
                                value={editTarget}
                                onChange={(e) => setEditTarget(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-wrap items-end gap-2">
                              <button
                                type="button"
                                className="btn-primary !min-h-10 !px-4"
                                disabled={editSaving}
                                onClick={() => saveEdit(item.id)}
                              >
                                {editSaving ? "Salvando…" : "Salvar"}
                              </button>
                              <button
                                type="button"
                                className="btn-ghost !min-h-10 !px-3"
                                onClick={cancelEdit}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-display text-xl text-marsala sm:text-2xl">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="mt-0.5 truncate text-sm text-ink-soft">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 font-display text-sm text-ink-faint">
                                {prog.percentRaised}%
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-ink-faint">
                              {formatBRL(raised)} de {formatBRL(item.targetAmount)}
                            </p>
                            <div className="mt-3 max-w-md">
                              <div className="relative h-px w-full bg-marsala/12">
                                <div
                                  className="absolute inset-y-0 left-0 bg-marsala/70"
                                  style={{
                                    width: `${Math.max(
                                      prog.percentRaised,
                                      prog.percentRaised > 0 ? 1 : 0
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {!editing && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-chip"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                            <label className="btn-chip cursor-pointer">
                              {item.imageUrl ? "Trocar foto" : "Foto"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  updateItemImage(
                                    item.id,
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                            </label>
                            {item.imageUrl && (
                              <button
                                type="button"
                                className="btn-chip"
                                onClick={() => removeItemImage(item.id)}
                              >
                                Remover foto
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-chip"
                              onClick={() =>
                                setExpandedItem(open ? null : item.id)
                              }
                            >
                              {open
                                ? "Ocultar doações"
                                : `Doações (${item.donations.length})`}
                            </button>
                            <button
                              type="button"
                              className="btn-chip !text-marsala/60 hover:!text-marsala"
                              onClick={() => deleteItem(item.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {open && !editing && (
                      <div className="border-t border-[var(--line)] bg-white/35 px-4 py-4 sm:px-5">
                        {item.donations.length === 0 ? (
                          <p className="text-sm text-ink-faint">
                            Nenhuma doação ainda.
                          </p>
                        ) : (
                          <ul className="space-y-3 text-sm">
                            {item.donations.map((d) => (
                              <li
                                key={d.id}
                                className="flex flex-wrap items-center justify-between gap-3"
                              >
                                <span className="text-ink-soft">
                                  {d.donorName || "Anônimo"}
                                  <span className="text-ink-faint">
                                    {" "}
                                    · {formatDate(d.createdAt)} ·{" "}
                                    {statusLabel(d.status)}
                                  </span>
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-marsala">
                                    {formatBRL(d.amount)}
                                  </span>
                                  <button
                                    type="button"
                                    className="font-display text-sm text-marsala/70 hover:text-marsala"
                                    onClick={() => startEditDonation(d)}
                                  >
                                    Editar
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {tab === "galeria" && (
          <section className="animate-fade-up space-y-6">
            <div>
              <h2 className="font-display text-2xl text-marsala sm:text-3xl">
                Galeria
              </h2>
              <p className="mt-1 text-sm text-ink-faint">
                Fotos exibidas na página inicial
              </p>
            </div>

            <form
              onSubmit={uploadPhoto}
              className="admin-panel grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <div>
                <label className="label" htmlFor="file">
                  Imagem
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  className="field"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="caption">
                  Legenda
                </label>
                <input
                  id="caption"
                  className="field"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto"
                disabled={uploading}
              >
                {uploading ? "Enviando…" : "Enviar"}
              </button>
            </form>

            {photos.length === 0 ? (
              <p className="admin-panel text-sm text-ink-faint">
                Nenhuma foto na galeria ainda.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {photos.map((photo) => (
                  <figure key={photo.id} className="photo-frame group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <figcaption className="relative z-10 mt-3 flex items-start justify-between gap-2 text-xs text-ink-faint">
                      <span className="line-clamp-2">
                        {photo.caption || "Sem legenda"}
                      </span>
                      <button
                        type="button"
                        onClick={() => deletePhoto(photo.id)}
                        className="shrink-0 font-display text-sm text-marsala opacity-80 transition group-hover:opacity-100"
                      >
                        Remover
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "doacoes" && (
          <section className="animate-fade-up space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-marsala sm:text-3xl">
                  Doações
                </h2>
                <p className="mt-1 text-sm text-ink-faint">
                  {stats.paidCount} pagas · {stats.pendingCount} pendentes
                  {stats.cancelledCount > 0
                    ? ` · ${stats.cancelledCount} canceladas`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "Todas"],
                    ["paid", "Pagas"],
                    ["pending", "Pendentes"],
                    ["cancelled", "Canceladas"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn-chip ${donationFilter === id ? "is-active" : ""}`}
                    onClick={() => setDonationFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-panel !p-0 overflow-hidden">
              {filteredDonations.length === 0 ? (
                <p className="p-5 text-sm text-ink-faint">
                  Nenhuma doação neste filtro.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {filteredDonations.map((d) => {
                    const editing = editingDonationId === d.id;
                    return (
                      <li key={d.id} className="px-4 py-4 sm:px-5">
                        {editing ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label
                                className="label"
                                htmlFor={`donor-${d.id}`}
                              >
                                Nome do doador
                              </label>
                              <input
                                id={`donor-${d.id}`}
                                className="field !py-2.5"
                                value={editDonorName}
                                onChange={(e) =>
                                  setEditDonorName(e.target.value)
                                }
                                placeholder="Anônimo"
                              />
                            </div>
                            <div>
                              <label
                                className="label"
                                htmlFor={`amount-${d.id}`}
                              >
                                Valor (R$)
                              </label>
                              <input
                                id={`amount-${d.id}`}
                                className="field !py-2.5"
                                value={editDonationAmount}
                                onChange={(e) =>
                                  setEditDonationAmount(e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label
                                className="label"
                                htmlFor={`status-${d.id}`}
                              >
                                Status
                              </label>
                              <select
                                id={`status-${d.id}`}
                                className="field !py-2.5"
                                value={editDonationStatus}
                                onChange={(e) =>
                                  setEditDonationStatus(e.target.value)
                                }
                              >
                                <option value="paid">Pago</option>
                                <option value="pending">Pendente</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
                            </div>
                            <div className="flex flex-wrap items-end gap-2">
                              <button
                                type="button"
                                className="btn-primary !min-h-10 !px-4"
                                disabled={donationSaving}
                                onClick={() => saveDonation(d.id)}
                              >
                                {donationSaving ? "Salvando…" : "Salvar"}
                              </button>
                              <button
                                type="button"
                                className="btn-ghost !min-h-10 !px-3"
                                onClick={cancelEditDonation}
                              >
                                Cancelar
                              </button>
                            </div>
                            <p className="sm:col-span-2 text-xs text-ink-faint">
                              Presente: {d.itemName} ·{" "}
                              {formatDate(d.createdAt)}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-display text-lg text-marsala">
                                {d.donorName || "Anônimo"}
                              </p>
                              <p className="mt-0.5 text-sm text-ink-soft">
                                {d.itemName}
                              </p>
                              <p className="mt-1 text-xs text-ink-faint">
                                {formatDate(d.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span
                                className={`admin-status ${
                                  d.status === "paid"
                                    ? "is-paid"
                                    : d.status === "cancelled"
                                      ? "is-cancelled"
                                      : "is-pending"
                                }`}
                              >
                                {statusLabel(d.status)}
                              </span>
                              <span className="font-display text-xl text-marsala">
                                {formatBRL(d.amount)}
                              </span>
                              {d.status !== "paid" && (
                                <button
                                  type="button"
                                  className="btn-chip"
                                  onClick={() =>
                                    setDonationStatus(d.id, "paid")
                                  }
                                >
                                  Marcar paga
                                </button>
                              )}
                              {d.status === "paid" && (
                                <button
                                  type="button"
                                  className="btn-chip"
                                  onClick={() =>
                                    setDonationStatus(d.id, "pending")
                                  }
                                >
                                  Desmarcar
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-chip"
                                onClick={() => startEditDonation(d)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="btn-chip !text-marsala/60 hover:!text-marsala"
                                onClick={() => deleteDonation(d.id)}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
