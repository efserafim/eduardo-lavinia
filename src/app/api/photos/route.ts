import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUploadedImage } from "@/lib/upload";

export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const caption = String(form.get("caption") || "").trim() || null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Arquivo obrigatório." },
        { status: 400 }
      );
    }

    const url = await saveUploadedImage(file, "gallery");
    const count = await prisma.photo.count();
    const photo = await prisma.photo.create({
      data: {
        url,
        caption,
        sortOrder: count,
      },
    });

    return NextResponse.json({ photo });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no upload." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
