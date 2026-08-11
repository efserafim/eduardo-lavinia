"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatBRL } from "@/lib/money";
import { Ornament } from "@/components/Ornament";

type Donation = {
  id: string;
  donorName: string | null;
  amount: number;
  status: string;
  createdAt: string;
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

export function AdminDashboard({
  items: initialItems,
  photos: initialPhotos,
}: {
  items: Item[];
  photos: Photo[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [photos, setPhotos] = useState(initialPhotos);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setMessage("Item adicionado.");
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
    setMessage("Foto do item atualizada.");
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
    if (!confirm("Excluir este item e suas doações?")) return;
    await fetch(`/api/items?id=${id}`, { method: "DELETE" });
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
    await refresh();
  }

  const totalRaised = items.reduce(
    (sum, item) =>
      sum +
      item.donations
        .filter((d) => d.status === "paid")
        .reduce((s, d) => s + d.amount, 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl space-y-16 px-6 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-left">Área do casal</p>
          <h1 className="font-script mt-2 text-4xl text-marsala">
            Chá de Panela
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Total arrecadado:{" "}
            <span className="font-display text-lg text-marsala">
              {formatBRL(totalRaised)}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/" className="btn-ghost">
            Ver site
          </a>
          <button type="button" onClick={logout} className="btn-ghost">
            Sair
          </button>
        </div>
      </header>

      {message && (
        <p className="border border-[var(--line)] bg-white/50 px-4 py-3 text-sm text-marsala">
          {message}
        </p>
      )}

      <section>
        <h2 className="font-display text-2xl text-marsala">Novo item</h2>
        <Ornament className="mt-4 mb-8 justify-start" />
        <form onSubmit={createItem} className="grid gap-4 sm:grid-cols-2">
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
              Foto do item
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
      </section>

      <section>
        <h2 className="font-display text-2xl text-marsala">Itens e doações</h2>
        <Ornament className="mt-4 mb-8 justify-start" />
        <ul className="space-y-6">
          {items.map((item) => {
            const paid = item.donations.filter((d) => d.status === "paid");
            const raised = paid.reduce((s, d) => s + d.amount, 0);
            const pct = Math.min(
              100,
              Math.round((raised / item.targetAmount) * 100)
            );
            return (
              <li
                key={item.id}
                className="border-b border-[var(--line)] pb-6 last:border-0"
              >
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden border border-[var(--line)] bg-cream">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-script text-xl text-marsala/25">
                        E&L
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl text-marsala">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-ink-faint">
                          Meta {formatBRL(item.targetAmount)} · {pct}% ·{" "}
                          {formatBRL(raised)} arrecadados
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="font-display text-sm text-marsala/70 hover:text-marsala"
                      >
                        Excluir
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="btn-chip cursor-pointer">
                        {item.imageUrl ? "Trocar foto" : "Adicionar foto"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            updateItemImage(item.id, e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {item.imageUrl && (
                        <button
                          type="button"
                          onClick={() => removeItemImage(item.id)}
                          className="font-display text-sm text-ink-faint hover:text-marsala"
                        >
                          Remover foto
                        </button>
                      )}
                    </div>

                    {paid.length === 0 ? (
                      <p className="mt-3 text-sm text-ink-faint">
                        Nenhuma doação paga ainda.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-1 text-sm">
                        {paid.map((d) => (
                          <li key={d.id} className="flex justify-between gap-4">
                            <span className="text-ink-soft">
                              {d.donorName || "Anônimo"}
                            </span>
                            <span className="text-marsala">
                              {formatBRL(d.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-marsala">Fotos da galeria</h2>
        <Ornament className="mt-4 mb-8 justify-start" />
        <form onSubmit={uploadPhoto} className="grid gap-4 sm:grid-cols-2">
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
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Enviando…" : "Enviar foto"}
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || ""}
                className="aspect-[3/4] w-full object-cover"
              />
              <figcaption className="relative z-10 mt-3 flex items-center justify-between gap-2 text-xs text-ink-faint">
                <span>{photo.caption || "Sem legenda"}</span>
                <button
                  type="button"
                  onClick={() => deletePhoto(photo.id)}
                  className="font-display text-sm text-marsala"
                >
                  Remover
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
