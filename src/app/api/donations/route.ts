import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseBRLToCents } from "@/lib/money";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const data: {
      donorName?: string | null;
      amount?: number;
      status?: string;
    } = {};

    if (body.donorName !== undefined) {
      data.donorName =
        typeof body.donorName === "string"
          ? body.donorName.trim() || null
          : null;
    }

    if (body.amount !== undefined || body.amountCents !== undefined) {
      const cents =
        typeof body.amountCents === "number"
          ? body.amountCents
          : parseBRLToCents(String(body.amount || ""));
      if (!cents || cents < 100) {
        return NextResponse.json(
          { error: "Valor inválido (mínimo R$ 1,00)." },
          { status: 400 }
        );
      }
      data.amount = cents;
    }

    if (typeof body.status === "string") {
      const status = body.status.trim().toLowerCase();
      if (!["paid", "pending", "cancelled"].includes(status)) {
        return NextResponse.json(
          { error: "Status inválido. Use paid, pending ou cancelled." },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar." },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.update({
      where: { id },
      data,
    });

    return NextResponse.json({ donation });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erro ao atualizar doação.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  try {
    await prisma.donation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erro ao excluir doação.",
      },
      { status: 400 }
    );
  }
}
