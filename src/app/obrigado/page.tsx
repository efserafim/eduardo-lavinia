import Link from "next/link";
import { FiligreeCorner, FloralWash, Ornament } from "@/components/Ornament";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ donationId?: string }>;
}) {
  const { donationId } = await searchParams;

  let itemName: string | null = null;
  let amount: number | null = null;
  let donorName: string | null = null;

  if (donationId) {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { item: true },
    });
    if (donation) {
      itemName = donation.item.name;
      amount = donation.amount;
      donorName = donation.donorName;
    }
  }

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <FloralWash />
      <FiligreeCorner position="tl" className="top-6 left-6" />
      <FiligreeCorner position="tr" className="top-6 right-6" />
      <FiligreeCorner position="bl" className="bottom-6 left-6" />
      <FiligreeCorner position="br" className="right-6 bottom-6" />

      <div className="relative z-10 flex max-w-lg flex-col items-center">
        <p className="eyebrow">Com gratidão</p>
        <h1 className="script-title mt-3">Seu carinho chegou</h1>
        <Ornament className="mt-7" />
        <p className="section-lead text-base md:text-lg">
          {donorName ? `${donorName}, ` : ""}
          agradecemos de coração
          {itemName ? (
            <>
              {" "}
              pela contribuição para{" "}
              <em className="font-display not-italic text-marsala">{itemName}</em>
            </>
          ) : (
            " pela sua contribuição"
          )}
          {amount ? <> de {formatBRL(amount)}</> : null}.
        </p>
        <p className="mt-4 text-sm text-ink-faint">
          Que o nosso lar seja sempre tão acolhedor quanto o seu gesto.
        </p>
        <p className="script-title mt-10 text-[2.25rem]">Eduardo & Lavínia</p>
        <Link href="/" className="btn-ghost mt-10">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
