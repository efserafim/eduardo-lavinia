import { prisma } from "@/lib/db";
import { progressForItem } from "@/lib/money";

const HONEYMOON_NAME = "Lua de Mel";

function isHoneymoonItem(name: string, description?: string | null) {
  const haystack = `${name} ${description || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return haystack.includes("lua de mel");
}

async function ensureHoneymoonItem() {
  const existing = await prisma.item.findFirst({
    where: {
      OR: [
        { name: { contains: "Lua de Mel", mode: "insensitive" } },
        { name: { contains: "lua de mel", mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    if (!existing.imageUrl) {
      return prisma.item.update({
        where: { id: existing.id },
        data: { imageUrl: "/lua-de-mel.jpg" },
      });
    }
    return existing;
  }

  return prisma.item.create({
    data: {
      name: HONEYMOON_NAME,
      description:
        "Uma contribuição para a nossa viagem dos sonhos — o começo da vida a dois em algum lugar especial.",
      targetAmount: 500000,
      imageUrl: "/lua-de-mel.jpg",
    },
  });
}

export async function getItemsWithProgress() {
  await ensureHoneymoonItem();

  const items = await prisma.item.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      donations: {
        where: { status: "paid" },
        select: { amount: true },
      },
    },
  });

  return items.map((item) => {
    const raisedCents = item.donations.reduce((sum, d) => sum + d.amount, 0);
    const progress = progressForItem(raisedCents, item.targetAmount);
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      targetAmount: item.targetAmount,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt,
      isHoneymoon: isHoneymoonItem(item.name, item.description),
      ...progress,
      isComplete: progress.percentRaised >= 100,
    };
  });
}

export async function getGalleryPhotos() {
  return prisma.photo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
