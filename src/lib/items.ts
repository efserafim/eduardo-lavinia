import { prisma } from "@/lib/db";
import { progressForItem } from "@/lib/money";
import {
  isOratoryItem,
  ORATORY_DESCRIPTION,
  ORATORY_NAME,
} from "@/lib/oratory";

async function ensureOratoryItem() {
  const oratory = await prisma.item.findFirst({
    where: {
      OR: [
        { name: { contains: "Oratório", mode: "insensitive" } },
        { name: { contains: "Oratorio", mode: "insensitive" } },
      ],
    },
  });

  const honeymoon = await prisma.item.findFirst({
    where: {
      OR: [
        { name: { contains: "Lua de Mel", mode: "insensitive" } },
        { name: { contains: "lua de mel", mode: "insensitive" } },
      ],
    },
  });

  if (oratory) {
    const nextData: {
      name?: string;
      description?: string;
      imageUrl?: string;
    } = {};
    if (oratory.name !== ORATORY_NAME) nextData.name = ORATORY_NAME;
    if (oratory.description !== ORATORY_DESCRIPTION) {
      nextData.description = ORATORY_DESCRIPTION;
    }
    if (!oratory.imageUrl || oratory.imageUrl.includes("lua-de-mel")) {
      nextData.imageUrl = "/oratorio.jpg";
    }
    if (Object.keys(nextData).length > 0) {
      return prisma.item.update({
        where: { id: oratory.id },
        data: nextData,
      });
    }
    return oratory;
  }

  if (honeymoon) {
    return prisma.item.update({
      where: { id: honeymoon.id },
      data: {
        name: ORATORY_NAME,
        description: ORATORY_DESCRIPTION,
        imageUrl: "/oratorio.jpg",
      },
    });
  }

  return prisma.item.create({
    data: {
      name: ORATORY_NAME,
      description: ORATORY_DESCRIPTION,
      targetAmount: 500000,
      imageUrl: "/oratorio.jpg",
    },
  });
}

export async function getItemsWithProgress() {
  await ensureOratoryItem();

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
      isOratory: isOratoryItem(item.name, item.description),
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
