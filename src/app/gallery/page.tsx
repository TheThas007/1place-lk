import Image from "next/image";

// Placeholder gallery data
const galleryImages = [
  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574887428131-01b34e405a76?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=800&auto=format&fit=crop",
];

export default function GalleryPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Our Gallery</h1>
          <p className="text-muted-foreground">Take a look inside our store and repair center.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryImages.map((src, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden break-inside-avoid border border-border group">
              <div className="aspect-[3/4] relative">
                <img 
                  src={src} 
                  alt={`Gallery image ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
