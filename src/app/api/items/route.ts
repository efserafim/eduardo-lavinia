import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseBRLToCents } from "@/lib/money";
import { saveUploadedImage } from "@/lib/upload";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const items = await prisma.item.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      donations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ items });
}

async function parseItemPayload(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim() || null;
    const targetAmount = parseBRLToCents(String(form.get("targetAmount") || ""));
    const id = String(form.get("id") || "").trim() || null;
    const file = form.get("image");
    const imageFile = file instanceof File && file.size > 0 ? file : null;
    return { id, name, description, targetAmount, imageFile };
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;
  const targetAmount =
    typeof body.targetAmountCents === "number"
      ? body.targetAmountCents
      : parseBRLToCents(String(body.targetAmount || ""));
  const id = String(body.id || "").trim() || null;
  return { id, name, description, targetAmount, imageFile: null as File | null };
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { name, description, targetAmount, imageFile } =
      await parseItemPayload(req);

    if (!name || !targetAmount || targetAmount < 100) {
      return NextResponse.json(
        { error: "Nome e valor-meta válidos são obrigatórios." },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await saveUploadedImage(imageFile, "item");
    }

    const item = await prisma.item.create({
      data: {
        name,
        description,
        targetAmount,
        imageUrl,
      },
    });

    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar item." },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const id = String(form.get("id") || "");
      if (!id) {
        return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
      }

      const data: {
        name?: string;
        description?: string | null;
        targetAmount?: number;
        imageUrl?: string | null;
      } = {};

      const name = String(form.get("name") || "").trim();
      if (name) data.name = name;

      if (form.has("description")) {
        data.description = String(form.get("description") || "").trim() || null;
      }

      if (form.has("targetAmount")) {
        const cents = parseBRLToCents(String(form.get("targetAmount") || ""));
        if (!cents || cents < 100) {
          return NextResponse.json(
            { error: "Valor-meta inválido." },
            { status: 400 }
          );
        }
        data.targetAmount = cents;
      }

      const file = form.get("image");
      if (file instanceof File && file.size > 0) {
        data.imageUrl = await saveUploadedImage(file, "item");
      }

      if (form.get("removeImage") === "1") {
        data.imageUrl = null;
      }

      const item = await prisma.item.update({ where: { id }, data });
      return NextResponse.json({ item });
    }

    const body = await req.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const data: {
      name?: string;
      description?: string | null;
      targetAmount?: number;
      imageUrl?: string | null;
    } = {};

    if (typeof body.name === "string" && body.name.trim()) {
      data.name = body.name.trim();
    }
    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }
    if (body.targetAmount !== undefined || body.targetAmountCents !== undefined) {
      const cents =
        typeof body.targetAmountCents === "number"
          ? body.targetAmountCents
          : parseBRLToCents(String(body.targetAmount || ""));
      if (!cents || cents < 100) {
        return NextResponse.json(
          { error: "Valor-meta inválido." },
          { status: 400 }
        );
      }
      data.targetAmount = cents;
    }
    if (body.imageUrl !== undefined) {
      data.imageUrl = body.imageUrl ? String(body.imageUrl) : null;
    }

    const item = await prisma.item.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar item." },
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

  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
