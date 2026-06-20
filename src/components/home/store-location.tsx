import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { siteSettings } from "@/lib/data";

export default function StoreLocation() {
  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="bg-background rounded-3xl overflow-hidden shadow-sm border border-border">
          <div className="grid lg:grid-cols-2">
            
            {/* Map Area */}
            <div className="h-[400px] lg:h-auto bg-muted relative">
              <iframe 
                src={siteSettings.google_maps_embed}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-700"
              />
            </div>

            {/* Info Area */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-medium mb-6 w-fit">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Store Location
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-8">
                Visit Our Store in <br/>Vavuniya
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      {siteSettings.address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground text-sm">Mon-Sat: {siteSettings.business_hours.weekdays}</p>
                    <p className="text-muted-foreground text-sm">Sun: {siteSettings.business_hours.sunday}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Contact</h3>
                    <p className="text-muted-foreground text-sm">{siteSettings.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-border">
                <a 
                  href={siteSettings.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-foreground text-background px-8 py-4 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-[0.98]"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
