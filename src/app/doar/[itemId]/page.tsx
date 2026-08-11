import Link from "next/link";
import { notFound } from "next/navigation";
import { DonateForm } from "@/components/DonateForm";
import { FiligreeCorner, FloralWash, Ornament } from "@/components/Ornament";
import { prisma } from "@/lib/db";
import { formatBRL, progressForItem } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DoarPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { itemId } = await params;
  const { erro } = await searchParams;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      donations: {
        where: { status: "paid" },
        select: { amount: true },
      },
    },
  });

  if (!item) notFound();

  const raisedCents = item.donations.reduce((s, d) => s + d.amount, 0);
  const progress = progressForItem(raisedCents, item.targetAmount);

  if (progress.percentRaised >= 100) {
    return (
      <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
        <FloralWash />
        <p className="script-title relative z-10">Este desejo já foi completo</p>
        <p className="section-lead relative z-10">
          Que tal escolher outro item da nossa lista?
        </p>
        <Link href="/#presentes" className="btn-primary relative z-10 mt-10">
          Ver presentes
        </Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden px-6 py-12 md:py-20">
      <FloralWash />
      <FiligreeCorner position="tl" className="top-4 left-4" />
      <FiligreeCorner position="tr" className="top-4 right-4" />

      <div className="relative z-10 mx-auto max-w-lg">
        <Link
          href="/#presentes"
          className="font-display text-base text-marsala/75 transition hover:text-marsala"
        >
          ← Voltar à lista
        </Link>

        <div className="mt-12 flex flex-col items-center text-center">
          <p className="eyebrow">Contribuir</p>
          <h1 className="section-title">{item.name}</h1>
          <Ornament className="mt-5" />
          {item.description && (
            <p className="section-lead">{item.description}</p>
          )}
          <p className="mt-4 font-display text-base text-ink-faint">
            Meta {formatBRL(item.targetAmount)}
            <span className="mx-2 text-marsala/25">·</span>
            Falta {formatBRL(progress.remainingCents)}
          </p>
        </div>

        {erro && (
          <p className="mt-8 text-center text-sm text-marsala" role="alert">
            O pagamento não foi concluído. Você pode tentar novamente.
          </p>
        )}

        <div className="mt-12">
          <DonateForm
            itemId={item.id}
            remainingCents={progress.remainingCents}
          />
        </div>
      </div>
    </main>
  );
}
