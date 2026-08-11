import type { Metadata } from "next";
import Link from "next/link";
import { FiligreeCorner, FloralWash, Ornament } from "@/components/Ornament";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { checkInfinitePayPayment } from "@/lib/infinitepay";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Obrigado",
  description: "Recebemos o seu carinho. Obrigado por celebrar conosco.",
  robots: { index: false, follow: false },
};

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{
    donationId?: string;
    order_nsu?: string;
    transaction_nsu?: string;
    slug?: string;
    receipt_url?: string;
  }>;
}) {
  const params = await searchParams;
  const donationId = params.donationId || params.order_nsu;

  let itemName: string | null = null;
  let amount: number | null = null;
  let donorName: string | null = null;
  let receiptUrl: string | null = params.receipt_url || null;

  if (donationId) {
    if (
      params.transaction_nsu &&
      params.slug &&
      (params.order_nsu || params.donationId)
    ) {
      try {
        const check = await checkInfinitePayPayment({
          orderNsu: params.order_nsu || donationId,
          transactionNsu: params.transaction_nsu,
          slug: params.slug,
        });
        if (check.paid) {
          await prisma.donation.updateMany({
            where: { id: donationId, status: { not: "paid" } },
            data: {
              status: "paid",
              externalId: params.transaction_nsu,
            },
          });
        }
      } catch (err) {
        console.error("payment_check on obrigado:", err);
      }
    }

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
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-6"
          >
            Ver comprovante
          </a>
        )}
        <p className="script-title mt-10 text-[2.25rem]">Eduardo & Lavínia</p>
        <Link href="/" className="btn-ghost mt-10">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
