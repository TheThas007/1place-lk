import Image from "next/image";
import { getGalleryImages } from "@/lib/firestore-client";
import { GalleryImage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function GalleryPage() {
  const galleryImages = await getGalleryImages() as GalleryImage[];

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Our Gallery</h1>
          <p className="text-muted-foreground">Take a look inside our store and repair center.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        {galleryImages.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-foreground mb-2">No Images Yet</h3>
            <p className="text-muted-foreground">We are updating our gallery. Please check back later!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryImages.map((img, idx) => (
              <div key={img.id || idx} className="relative rounded-2xl overflow-hidden break-inside-avoid border border-border group">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={img.image_url} 
                    alt={img.caption || `Gallery image ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {img.category && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-medium text-foreground uppercase tracking-wider">
                      {img.category}
                    </div>
                  )}
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
