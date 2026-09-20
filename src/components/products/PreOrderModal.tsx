"use client";

import React, { useState } from "react";
import { X, Calendar, Check, MessageCircle, Smartphone, MapPin, User, Phone, ShieldCheck, Clock } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedColor?: string;
  selectedStorage?: string;
  selectedRam?: string;
  currentPrice: number;
  currentSku?: string;
  productImage?: string;
}

export default function PreOrderModal({
  isOpen,
  onClose,
  product,
  selectedColor,
  selectedStorage,
  selectedRam,
  currentPrice,
  currentSku,
  productImage,
}: PreOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const imageSrc = productImage || product.images?.[0] || "/placeholder-phone.webp";
  const skuText = currentSku || product.code || product.slug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !city.trim()) {
      alert("Please fill in your name, contact phone, and delivery city.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save Pre-Order to Firestore
      const preOrderData = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        selectedColor: selectedColor || "Standard",
        selectedStorage: selectedStorage || "Standard",
        selectedRam: selectedRam || "",
        sku: skuText,
        estimatedPrice: typeof currentPrice === "number" && !isNaN(currentPrice) && currentPrice > 0 ? currentPrice : null,
        customerName: customerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        notes: notes.trim(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, "pre_orders"), preOrderData);
      } catch (err) {
        console.warn("Firestore pre_orders save notice:", err);
      }

      // 2. Prepare WhatsApp message
      const variantDetails = [selectedColor, selectedStorage, selectedRam].filter(Boolean).join(" • ");
      const msg = 
`👋 Hello STREET MOBILE! I would like to PRE-BOOK the following out-of-stock device:

📱 *Device:* ${product.name}
${variantDetails ? `⚙️ *Variant:* ${variantDetails}` : ""}
🏷️ *SKU / Code:* ${skuText}
💰 *Estimated Price:* ${formatPrice(currentPrice)}

👤 *Customer Name:* ${customerName.trim()}
📞 *Phone / WhatsApp:* ${phone.trim()}
📍 *City / Town:* ${city.trim()}
${notes.trim() ? `📝 *Notes:* ${notes.trim()}\n` : ""}
Please reserve a unit for me from your next shipment and notify me once it arrives!`;

      const storeWhatsApp = "94777144143"; // Standard Street Mobile WhatsApp contact
      const waUrl = `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(msg)}`;

      setIsSuccess(true);
      window.open(waUrl, "_blank");
    } catch (error) {
      console.error("Pre-order error:", error);
      alert("An error occurred. Please contact us directly via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative bg-white text-neutral-900 border border-neutral-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-neutral-950 text-white p-5 sm:p-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" /> Device Pre-Booking
            </div>
            <h2 className="text-lg sm:text-xl font-black">Pre-Book / Reserve Device</h2>
            <p className="text-xs text-white/60 mt-0.5">
              Zero upfront payment required. Reserve unit from next shipment.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900">Pre-Booking Submitted!</h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Your reservation for <strong className="text-black font-bold">{product.name}</strong> has been received and WhatsApp confirmation window opened. Our team will contact you as soon as stock arrives!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-md mt-4"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Product Summary Preview */}
            <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={imageSrc} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">{product.name}</h4>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 font-medium">
                  {selectedColor && <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">{selectedColor}</span>}
                  {selectedStorage && <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">{selectedStorage}</span>}
                  {selectedRam && <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">{selectedRam} RAM</span>}
                </div>
                <p className="text-xs font-extrabold text-neutral-900 mt-1 font-mono">{formatPrice(currentPrice)}</p>
              </div>
            </div>

            {/* Notice Alert Banner */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                This mobile/laptop is temporarily out of stock. Pre-booking reserves priority allocation when the shipment arrives.
              </p>
            </div>

            {/* Input Fields */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" /> Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Kasun Perera / Mohamed Farzan"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" /> WhatsApp / Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="077 123 4567"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-semibold text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" /> City / District *
                  </label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Colombo, Jaffna, Kandy"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  Optional Note / Preferred Colour Alternative
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please let me know if Natural Titanium or Black is available..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 outline-none focus:border-blue-500 focus:bg-white resize-none font-medium transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4" />
                {submitting ? "Reserving..." : "Confirm Pre-Booking & Open WhatsApp"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
