import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Webhook InfinitePay — pagamento aprovado.
 * Responda 200 rápido; 400 pede reenvio.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const orderNsu = String(payload?.order_nsu || "").trim();
    const transactionNsu = String(payload?.transaction_nsu || "").trim();
    const invoiceSlug = String(
      payload?.invoice_slug || payload?.slug || ""
    ).trim();
    const amount =
      typeof payload?.amount === "number"
        ? payload.amount
        : typeof payload?.paid_amount === "number"
          ? payload.paid_amount
          : null;

    if (!orderNsu) {
      return NextResponse.json(
        { success: false, message: "order_nsu ausente" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findUnique({
      where: { id: orderNsu },
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Pedido não encontrado" },
        { status: 400 }
      );
    }

    if (amount != null && amount > 0 && amount < donation.amount) {
      return NextResponse.json(
        { success: false, message: "Valor divergente" },
        { status: 400 }
      );
    }

    if (donation.status !== "paid") {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: "paid",
          externalId: transactionNsu || invoiceSlug || donation.externalId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("InfinitePay webhook error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid payload" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "infinitepay-webhook" });
}
