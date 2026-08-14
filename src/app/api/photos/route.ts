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

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const id = String(form.get("id") || "").trim();
      const file = form.get("file");

      if (!id) {
        return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
      }
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "Arquivo obrigatório." },
          { status: 400 }
        );
      }

      const url = await saveUploadedImage(file, "gallery");
      const photo = await prisma.photo.update({
        where: { id },
        data: { url },
      });
      return NextResponse.json({ photo });
    }

    const body = await req.json();

    if (Array.isArray(body.orderedIds)) {
      const orderedIds = body.orderedIds
        .map((id: unknown) => String(id || "").trim())
        .filter(Boolean);

      if (orderedIds.length === 0) {
        return NextResponse.json(
          { error: "Lista de fotos inválida." },
          { status: 400 }
        );
      }

      await prisma.$transaction(
        orderedIds.map((id: string, index: number) =>
          prisma.photo.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );

      const photos = await prisma.photo.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return NextResponse.json({ photos });
    }

    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }

    const data: { caption?: string | null; url?: string } = {};

    if ("caption" in body) {
      data.caption =
        body.caption == null ? null : String(body.caption).trim() || null;
    }

    if ("url" in body) {
      if (body.url == null || body.url === "") {
        data.url = "";
      } else if (typeof body.url === "string" && body.url.trim()) {
        data.url = body.url.trim();
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nada para atualizar." },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.update({
      where: { id },
      data,
    });

    return NextResponse.json({ photo });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar." },
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

  const remaining = await prisma.photo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  if (remaining.length > 0) {
    await prisma.$transaction(
      remaining.map((photo, index) =>
        prisma.photo.update({
          where: { id: photo.id },
          data: { sortOrder: index },
        })
      )
    );
  }

  return NextResponse.json({ ok: true });
}
