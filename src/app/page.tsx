import { Hero } from "@/components/Hero";
import { Gallery } from "@/components/Gallery";
import { OratorySection } from "@/components/OratorySection";
import { GiftList } from "@/components/GiftList";
import { SiteFooter } from "@/components/SiteFooter";
import { getGalleryPhotos, getItemsWithProgress } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [items, photos] = await Promise.all([
    getItemsWithProgress(),
    getGalleryPhotos(),
  ]);

  const oratory = items.find((item) => item.isOratory) || null;
  const gifts = items.filter((item) => !item.isOratory);

  return (
    <main>
      <Hero />
      <Gallery photos={photos} />
      <OratorySection item={oratory} />
      <GiftList items={gifts} />
      <SiteFooter />
    </main>
  );
}
