import { Hero } from "@/components/Hero";
import { Gallery } from "@/components/Gallery";
import { GiftList } from "@/components/GiftList";
import { SiteFooter } from "@/components/SiteFooter";
import { getGalleryPhotos, getItemsWithProgress } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [items, photos] = await Promise.all([
    getItemsWithProgress(),
    getGalleryPhotos(),
  ]);

  return (
    <main>
      <Hero />
      <Gallery photos={photos} />
      <GiftList items={items} />
      <SiteFooter />
    </main>
  );
}
