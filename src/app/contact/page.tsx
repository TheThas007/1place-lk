import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { siteSettings } from "@/lib/data";

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a question or need assistance? Our team is here to help you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Details */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Our Location</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    {siteSettings.address}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone & WhatsApp</h3>
                  <p className="text-muted-foreground text-sm">{siteSettings.phone}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-muted-foreground text-sm">Mon-Sat: {siteSettings.business_hours.weekdays}</p>
                  <p className="text-muted-foreground text-sm">Sun: {siteSettings.business_hours.sunday}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form / Message */}
          <div className="bg-card p-8 rounded-3xl border border-border">
            <h3 className="text-xl font-bold mb-6">Send us a message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email / Phone</label>
                <input type="text" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-foreground/10 outline-none transition-all resize-none" placeholder="How can we help you?" />
              </div>
              <button type="button" className="w-full bg-foreground text-background py-4 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-[0.98]">
                Send Message
              </button>
            </form>
          </div>

        </div>

        {/* Full width map */}
        <div className="mt-16 h-[400px] rounded-3xl overflow-hidden border border-border relative">
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
      </div>
    </div>
  );
}
