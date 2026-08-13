"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Check, Upload, Sparkles, Sliders, Layers, Monitor, Smartphone, Calendar, Link as LinkIcon } from "lucide-react";
import { HeroSlide } from "@/lib/types";
import { uploadImageWithFallback } from "@/lib/upload-utils";

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: Partial<HeroSlide>) => Promise<void>;
  slide: HeroSlide | null;
}

const presets = [
  { url: "/hero-slide-1.png", label: "iPhone 16 Pro Flagship Showcase" },
  { url: "/hero-slide-2.png", label: "Smartwatches & Wearables Collection" },
  { url: "/hero-slide-3.png", label: "Premium Audio & ANC Headphones" },
  { url: "/hero-slide-4.png", label: "Fast Chargers & Power Solutions" },
];

export default function HeroModal({ isOpen, onClose, onSave, slide }: HeroModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [campaignLabel, setCampaignLabel] = useState("NEW ARRIVAL");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [promoText, setPromoText] = useState("");
  const [primaryButtonText, setPrimaryButtonText] = useState("Shop Now");
  const [primaryButtonUrl, setPrimaryButtonUrl] = useState("/products");
  const [showSecondaryButton, setShowSecondaryButton] = useState(false);
  const [secondaryButtonText, setSecondaryButtonText] = useState("View Product");
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);

  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slide) {
      setImageUrl(slide.desktop_image_url || slide.image_url || "");
      setMobileImageUrl(slide.mobile_image_url || "");
      setDesktopPreview(slide.desktop_image_url || slide.image_url || "");
      setMobilePreview(slide.mobile_image_url || "");
      setAlt(slide.alt || "");
      setCampaignLabel(slide.campaign_label || "NEW ARRIVAL");
      setHeading(slide.heading || slide.alt || "");
      setDescription(slide.description || "");
      setPromoText(slide.promo_text || "");
      setPrimaryButtonText(slide.primary_button_text || "Shop Now");
      setPrimaryButtonUrl(slide.primary_button_url || "/products");
      setShowSecondaryButton(slide.show_secondary_button ?? false);
      setSecondaryButtonText(slide.secondary_button_text || "View Product");
      setSecondaryButtonUrl(slide.secondary_button_url || "");
      setStartDate(slide.start_date || "");
      setExpiryDate(slide.expiry_date || "");
      setSortOrder(slide.sort_order ?? 1);
      setActive(slide.active ?? true);
    } else {
      setImageUrl("");
      setMobileImageUrl("");
      setDesktopPreview("");
      setMobilePreview("");
      setAlt("");
      setCampaignLabel("NEW ARRIVAL");
      setHeading("");
      setDescription("");
      setPromoText("");
      setPrimaryButtonText("Shop Now");
      setPrimaryButtonUrl("/products");
      setShowSecondaryButton(false);
      setSecondaryButtonText("View Product");
      setSecondaryButtonUrl("");
      setStartDate("");
      setExpiryDate("");
      setSortOrder(1);
      setActive(true);
    }
    setDesktopFile(null);
    setMobileFile(null);
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleDesktopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDesktopFile(file);
      const url = URL.createObjectURL(file);
      setDesktopPreview(url);
    }
  };

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMobileFile(file);
      const url = URL.createObjectURL(file);
      setMobilePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalDesktopUrl = imageUrl.trim();
      let finalMobileUrl = mobileImageUrl.trim();

      if (desktopFile) {
        finalDesktopUrl = await uploadImageWithFallback(desktopFile, "hero_slides");
      }
      if (mobileFile) {
        finalMobileUrl = await uploadImageWithFallback(mobileFile, "hero_slides");
      }

      const mainImg = finalDesktopUrl || desktopPreview || "/hero-slide-1.png";

      await onSave({
        image_url: mainImg,
        desktop_image_url: mainImg,
        mobile_image_url: finalMobileUrl || mainImg,
        alt: alt.trim() || heading.trim() || "Street Mobile Hero Banner",
        campaign_label: campaignLabel.trim(),
        heading: heading.trim(),
        description: description.trim(),
        promo_text: promoText.trim(),
        primary_button_text: primaryButtonText.trim() || "Shop Now",
        primary_button_url: primaryButtonUrl.trim() || "/products",
        show_secondary_button: showSecondaryButton,
        secondary_button_text: secondaryButtonText.trim() || "View Product",
        secondary_button_url: secondaryButtonUrl.trim(),
        start_date: startDate,
        expiry_date: expiryDate,
        sort_order: Number(sortOrder) || 1,
        active,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save hero banner: ${err?.message || "Please check your network."}`);
    } finally {
      setSaving(false);
    }
  };

  const currentPreviewImage = previewDevice === "mobile" 
    ? (mobilePreview || desktopPreview || imageUrl || "/hero-slide-1.png")
    : (desktopPreview || imageUrl || "/hero-slide-1.png");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {slide ? "Edit Hero Banner" : "Create Hero Banner"}
              </h3>
              <p className="text-xs text-white/50">Manage homepage hero slide details & campaigns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Live Device Preview Switch */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                Live Banner Preview
              </label>
              <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewDevice === "desktop" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewDevice === "mobile" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Live Banner Box (Minimal B&W Style) */}
            <div className={`relative w-full rounded-2xl overflow-hidden bg-white border border-white/20 shadow-xl transition-all ${
              previewDevice === "mobile" ? "aspect-[9/10] max-w-xs mx-auto" : "aspect-[16/7]"
            }`}>
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10 bg-gradient-to-r from-white via-white/90 to-transparent">
                <div className="max-w-md">
                  {campaignLabel && (
                    <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-md mb-3">
                      {campaignLabel}
                    </span>
                  )}
                  <h4 className="text-lg sm:text-2xl font-black text-black leading-tight tracking-tight mb-2">
                    {heading || "Banner Heading"}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 mb-3">
                    {description || "Supporting campaign text description goes here."}
                  </p>
                  {promoText && (
                    <span className="text-xs font-bold text-red-600 block mb-4">
                      {promoText}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl shadow-sm">
                      {primaryButtonText || "Shop Now"}
                    </span>
                    {showSecondaryButton && (
                      <span className="px-4 py-2 border border-neutral-300 text-black text-xs font-bold rounded-xl">
                        {secondaryButtonText || "View Product"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Background / Cutout Image */}
              <img
                src={currentPreviewImage}
                alt="Banner preview"
                className="absolute right-0 top-0 bottom-0 w-1/2 object-contain object-right p-4 mix-blend-multiply opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/hero-slide-1.png";
                }}
              />
            </div>
          </div>

          {/* Preset Images */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Quick Banner Image Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => {
                    setDesktopFile(null);
                    setImageUrl(p.url);
                    setDesktopPreview(p.url);
                  }}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    imageUrl === p.url ? "border-emerald-400 bg-emerald-500/10 text-emerald-300 font-bold" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <p className="truncate font-medium">{p.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop & Mobile Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white/70">
                Desktop Image (URL or File) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="desktopUpload"
                  accept="image/*"
                  onChange={handleDesktopFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="desktopUpload"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setDesktopPreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-white/70">
                Mobile Image (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="mobileUpload"
                  accept="image/*"
                  onChange={handleMobileFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="mobileUpload"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload
                </label>
                <input
                  type="text"
                  value={mobileImageUrl}
                  onChange={(e) => {
                    setMobileImageUrl(e.target.value);
                    setMobilePreview(e.target.value);
                  }}
                  placeholder="https://... (Leave blank for Desktop image)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">Campaign Label</label>
              <input
                type="text"
                value={campaignLabel}
                onChange={(e) => setCampaignLabel(e.target.value)}
                placeholder="e.g. NEW ARRIVAL, 5TH ANNIVERSARY"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Premium Mobile Experience"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">Offer / Promo Price Text</label>
              <input
                type="text"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                placeholder="e.g. From LKR 449,999 or 20% OFF"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1">Supporting Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short supporting description of the product or campaign."
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* CTA Buttons Config */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> CTA Button Configuration
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Primary Button Label</label>
                <input
                  type="text"
                  value={primaryButtonText}
                  onChange={(e) => setPrimaryButtonText(e.target.value)}
                  placeholder="Shop Now"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Primary Destination URL</label>
                <input
                  type="text"
                  value={primaryButtonUrl}
                  onChange={(e) => setPrimaryButtonUrl(e.target.value)}
                  placeholder="/products"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/80">Enable Secondary CTA Button</span>
                <input
                  type="checkbox"
                  checked={showSecondaryButton}
                  onChange={(e) => setShowSecondaryButton(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {showSecondaryButton && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Secondary Button Label</label>
                    <input
                      type="text"
                      value={secondaryButtonText}
                      onChange={(e) => setSecondaryButtonText(e.target.value)}
                      placeholder="View Product"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Secondary Destination URL</label>
                    <input
                      type="text"
                      value={secondaryButtonUrl}
                      onChange={(e) => setSecondaryButtonUrl(e.target.value)}
                      placeholder="/products/iphone-16-pro-max"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates & Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" /> Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">Sort Order #</label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <p className="text-xs font-bold text-white">Active Banner</p>
              <p className="text-[11px] text-white/40">Enable to display this hero banner slide on the homepage slider</p>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-slate-900 py-2 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {saving ? "Saving Banner..." : slide ? "Update Banner" : "Publish Banner"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
