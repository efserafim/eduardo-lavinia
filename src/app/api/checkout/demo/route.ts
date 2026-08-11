import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Modo demo: marca doação como paga e redireciona para /obrigado */
export async function GET(req: NextRequest) {
  const donationId = req.nextUrl.searchParams.get("donationId");
  if (!donationId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
  });

  if (donation && donation.status !== "paid") {
    await prisma.donation.update({
      where: { id: donationId },
      data: { status: "paid" },
    });
  }

  return NextResponse.redirect(
    new URL(`/obrigado?donationId=${donationId}`, req.url)
  );
}
