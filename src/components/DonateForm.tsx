"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DonateForm({
  itemId,
  itemName,
  remainingCents,
}: {
  itemId: string;
  itemName: string;
  remainingCents: number;
}) {
  const router = useRouter();
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestions = [50, 100, 150, 200].filter(
    (v) => v * 100 <= remainingCents || remainingCents === 0
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          donorName: donorName.trim() || undefined,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível iniciar o pagamento.");
        setLoading(false);
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      router.push("/obrigado");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-6">
      <div>
        <label className="label" htmlFor="donorName">
          Seu nome (opcional)
        </label>
        <input
          id="donorName"
          className="field"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Como gostaria de ser lembrado(a)"
          maxLength={80}
        />
      </div>

      <div>
        <label className="label" htmlFor="amount">
          Valor da contribuição
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-display text-lg leading-none text-ink-faint">
            R$
          </span>
          <input
            id="amount"
            className="field pl-12 font-display text-2xl leading-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </div>
        {suggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {suggestions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`btn-chip ${amount === String(v) ? "is-active" : ""}`}
              >
                R$ {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-marsala" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-center pt-1">
        <button type="submit" className="btn-primary min-w-[12rem]" disabled={loading}>
          {loading ? "Abrindo pagamento…" : "Contribuir"}
        </button>
      </div>

      <p className="text-center text-sm leading-relaxed text-ink-faint">
        Pagamento seguro via InfinitePay — cartão ou PIX.
        {itemName ? ` Presente: ${itemName}.` : ""}
      </p>
    </form>
  );
}
