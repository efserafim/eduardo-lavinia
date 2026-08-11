import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseBRLToCents } from "@/lib/money";
import { createInfinitePayCheckout } from "@/lib/infinitepay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = String(body.itemId || "");
    const donorName =
      typeof body.donorName === "string"
        ? body.donorName.trim().slice(0, 80)
        : null;
    const amountRaw = String(body.amount || "");

    const amountCents = parseBRLToCents(amountRaw);
    if (!itemId || !amountCents) {
      return NextResponse.json(
        { error: "Informe um valor válido para contribuir." },
        { status: 400 }
      );
    }

    if (amountCents < 100) {
      return NextResponse.json(
        { error: "O valor mínimo é R$ 1,00." },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        donations: { where: { status: "paid" }, select: { amount: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    const raised = item.donations.reduce((s, d) => s + d.amount, 0);
    if (raised >= item.targetAmount) {
      return NextResponse.json(
        { error: "Este item já foi completo." },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        itemId: item.id,
        donorName,
        amount: amountCents,
        status: "pending",
      },
    });

    const checkout = await createInfinitePayCheckout({
      donationId: donation.id,
      itemName: item.name,
      amountCents,
      donorName,
    });

    await prisma.donation.update({
      where: { id: donation.id },
      data: { externalId: checkout.orderNsu },
    });

    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      donationId: donation.id,
      demo: checkout.demo,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao iniciar o pagamento.",
      },
      { status: 500 }
    );
  }
}
