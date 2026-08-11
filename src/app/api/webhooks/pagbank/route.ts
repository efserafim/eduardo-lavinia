import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Webhook PagBank / PagSeguro.
 * Aceita payloads comuns com reference_id / id da doação.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const referenceId =
      payload?.reference_id ||
      payload?.referenceId ||
      payload?.data?.reference_id ||
      payload?.resource?.reference_id;

    const orderId =
      payload?.id ||
      payload?.order_id ||
      payload?.data?.id ||
      payload?.resource?.id;

    const statusRaw = String(
      payload?.status ||
        payload?.charges?.[0]?.status ||
        payload?.data?.status ||
        ""
    ).toUpperCase();

    const paidStatuses = [
      "PAID",
      "AVAILABLE",
      "AUTHORIZED",
      "COMPLETED",
      "PAGO",
    ];

    const isPaid =
      paidStatuses.includes(statusRaw) ||
      payload?.charges?.some(
        (c: { status?: string }) =>
          c.status && paidStatuses.includes(String(c.status).toUpperCase())
      );

    if (!isPaid) {
      return NextResponse.json({ received: true, updated: false });
    }

    let donation = null;

    if (referenceId) {
      donation = await prisma.donation.findUnique({
        where: { id: String(referenceId) },
      });
    }

    if (!donation && orderId) {
      donation = await prisma.donation.findFirst({
        where: { pagbankOrderId: String(orderId) },
      });
    }

    if (donation && donation.status !== "paid") {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: "paid",
          ...(orderId ? { pagbankOrderId: String(orderId) } : {}),
        },
      });
      return NextResponse.json({ received: true, updated: true });
    }

    return NextResponse.json({ received: true, updated: false });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "pagbank-webhook" });
}
