export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function parseBRLToCents(value: string): number | null {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100);
}

export function progressForItem(raisedCents: number, targetCents: number) {
  if (targetCents <= 0) {
    return { percentRaised: 0, percentRemaining: 100, raisedCents: 0, remainingCents: 0 };
  }
  const raised = Math.min(raisedCents, targetCents);
  const percentRaised = Math.min(100, Math.round((raised / targetCents) * 100));
  const percentRemaining = Math.max(0, 100 - percentRaised);
  const remainingCents = Math.max(0, targetCents - raisedCents);
  return { percentRaised, percentRemaining, raisedCents: raised, remainingCents };
}
