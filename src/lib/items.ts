import { prisma } from "@/lib/db";
import { progressForItem } from "@/lib/money";

export async function getItemsWithProgress() {
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
