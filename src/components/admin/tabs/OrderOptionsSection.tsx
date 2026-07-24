"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Truck,
  CreditCard,
  MessageCircle,
  Package,
  MapPin,
  Store,
  Plus,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Info,
  CheckCircle,
} from "lucide-react";
import { ProductOrderSettings, DeliveryZone, DEFAULT_ORDER_SETTINGS } from "@/lib/types";

// ── Sri Lanka Districts ──────────────────────────────
const SL_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CARD_METHODS = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "amex", label: "American Express" },
  { id: "bank", label: "Bank Card" },
  { id: "gateway", label: "Online Payment Gateway" },
];

const WHATSAPP_VARS = [
  { label: "Product Name", token: "{{productName}}" },
  { label: "Price", token: "{{productPrice}}" },
  { label: "SKU", token: "{{productSku}}" },
  { label: "Variation", token: "{{variation}}" },
  { label: "Quantity", token: "{{quantity}}" },
  { label: "Customer Name", token: "{{customerName}}" },
  { label: "Phone", token: "{{customerPhone}}" },
  { label: "Address", token: "{{deliveryAddress}}" },
  { label: "Product Link", token: "{{productUrl}}" },
];

interface Props {
  settings: ProductOrderSettings;
  onChange: (settings: ProductOrderSettings) => void;
}

// ── Small Toggle Switch ───────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
  labelOn = "Available",
  labelOff = "Not Available",
  colorOn = "bg-emerald-500",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  labelOn?: string;
  labelOff?: string;
  colorOn?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-xs font-semibold text-white/70">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? colorOn : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`text-xs font-bold ${checked ? "text-emerald-400" : "text-white/30"}`}>
        {checked ? labelOn : labelOff}
      </span>
    </div>
  );
}

// ── Accordion Section ─────────────────────────────────
function AccordionSection({
  icon,
  title,
  badge,
  badgeColor,
  enabled,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
  enabled?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-200 ${
      enabled === false
        ? "border-white/5 bg-white/[0.02] opacity-60"
        : "border-white/10 bg-slate-800/50"
    }`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-400">{icon}</span>
          <span className="text-sm font-bold text-white">{title}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor || "bg-emerald-500/20 text-emerald-300"}`}>
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1 border-t border-white/[0.06] space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Tag input for areas / restricted areas ────────────
function TagInput({
  value,
  onChange,
  placeholder,
  presets,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  presets?: string[];
}) {
  const [input, setInput] = useState("");
  const add = (v: string) => {
    const trimmed = v.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      {presets && (
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => add(p)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                value.includes(p)
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-blue-400/50 hover:text-white/80"
              }`}
            >
              {value.includes(p) ? "✓ " : "+ "}{p}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }}
          placeholder={placeholder || "Type and press Enter…"}
          className="field-input flex-1 text-sm"
        />
        <button
          type="button"
          onClick={() => add(input)}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
              {v}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Field helpers ──────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-white/60">
        {label}
        {hint && <span className="ml-2 text-white/30 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  prefix = "Rs.",
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  prefix?: string;
  min?: number;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">{prefix}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className="field-input pl-10"
      />
    </div>
  );
}

// ── Main OrderOptionsSection ───────────────────────────
export default function OrderOptionsSection({ settings, onChange }: Props) {
  const s = { ...DEFAULT_ORDER_SETTINGS, ...settings };
  const upd = (patch: Partial<ProductOrderSettings>) => onChange({ ...s, ...patch });

  // ── Zone helpers ──────────────────────────────────
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const newZoneId = () => `zone_${Date.now()}`;

  const addZone = () => {
    const zone: DeliveryZone = {
      id: newZoneId(),
      name: "",
      deliveryFee: 350,
      minimumOrderAmount: 0,
      estimatedDeliveryTime: "3-5 business days",
      codEnabled: true,
      expressDeliveryEnabled: false,
      isActive: true,
    };
    upd({ deliveryZones: [...s.deliveryZones, zone] });
    setEditingZone(zone.id);
  };

  const updateZone = (id: string, patch: Partial<DeliveryZone>) => {
    upd({
      deliveryZones: s.deliveryZones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
    });
  };

  const removeZone = (id: string) => {
    upd({ deliveryZones: s.deliveryZones.filter((z) => z.id !== id) });
    if (editingZone === id) setEditingZone(null);
  };

  const duplicateZone = (zone: DeliveryZone) => {
    const dup: DeliveryZone = { ...zone, id: newZoneId(), name: zone.name + " (Copy)" };
    upd({ deliveryZones: [...s.deliveryZones, dup] });
  };

  return (
    <div className="space-y-3">
      {/* ─── 1. Cash on Delivery ─────────────────────── */}
      <AccordionSection
        icon={<Truck className="w-4 h-4" />}
        title="Cash on Delivery"
        badge={s.codEnabled ? "Available" : "Disabled"}
        badgeColor={s.codEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}
      >
        <Toggle
          checked={s.codEnabled}
          onChange={(v) => upd({ codEnabled: v })}
          labelOn="COD Available"
          labelOff="COD Not Available"
        />

        {s.codEnabled && (
          <div className="space-y-4 mt-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="COD Fee (LKR)" hint="0 = free">
                <NumberInput value={s.codFee} onChange={(v) => upd({ codFee: v })} placeholder="0" />
              </Field>
              <Field label="Min Order Amount (LKR)" hint="optional">
                <NumberInput
                  value={s.codMinimumAmount ?? 0}
                  onChange={(v) => upd({ codMinimumAmount: v || null })}
                  placeholder="No minimum"
                />
              </Field>
              <Field label="Max Order Amount (LKR)" hint="optional">
                <NumberInput
                  value={s.codMaximumAmount ?? 0}
                  onChange={(v) => upd({ codMaximumAmount: v || null })}
                  placeholder="No maximum"
                />
              </Field>
            </div>

            <Field label="Available Districts / Areas" hint="leave empty = all areas">
              <TagInput
                value={s.codAvailableAreas}
                onChange={(v) => upd({ codAvailableAreas: v })}
                presets={SL_DISTRICTS}
                placeholder="Select or type district…"
              />
            </Field>

            <Field label="COD Instructions" hint="shown to customer">
              <textarea
                rows={2}
                value={s.codInstructions}
                onChange={(e) => upd({ codInstructions: e.target.value })}
                placeholder="e.g. Please have exact change ready for the delivery person."
                className="field-input resize-none text-sm"
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={s.codConfirmationRequired}
                onChange={(e) => upd({ codConfirmationRequired: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 text-blue-600 bg-white/10 cursor-pointer"
              />
              <span className="text-xs text-white/70">Require customer phone confirmation before shipping</span>
            </label>
          </div>
        )}
      </AccordionSection>

      {/* ─── 2. Card Payment ─────────────────────────── */}
      <AccordionSection
        icon={<CreditCard className="w-4 h-4" />}
        title="Card Payment"
        badge={s.cardEnabled ? "Available" : "Disabled"}
        badgeColor={s.cardEnabled ? "bg-purple-500/20 text-purple-300" : "bg-red-500/20 text-red-300"}
      >
        <Toggle
          checked={s.cardEnabled}
          onChange={(v) => upd({ cardEnabled: v })}
          labelOn="Card Payment Available"
          labelOff="Card Payment Not Available"
          colorOn="bg-purple-500"
        />

        {s.cardEnabled && (
          <div className="space-y-4 mt-3 pl-1">
            <Field label="Supported Card Methods">
              <div className="flex flex-wrap gap-2">
                {CARD_METHODS.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={s.cardMethods.includes(m.id)}
                      onChange={(e) =>
                        upd({
                          cardMethods: e.target.checked
                            ? [...s.cardMethods, m.id]
                            : s.cardMethods.filter((x) => x !== m.id),
                        })
                      }
                      className="w-3.5 h-3.5 text-purple-600 bg-white/10 rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-white/80">{m.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment Gateway Name">
                <input
                  type="text"
                  value={s.paymentGatewayName}
                  onChange={(e) => upd({ paymentGatewayName: e.target.value })}
                  placeholder="e.g. PayHere, Stripe, Genie"
                  className="field-input text-sm"
                />
              </Field>
              <Field label="Processing Fee (LKR)" hint="0 = none">
                <NumberInput value={s.cardProcessingFee} onChange={(v) => upd({ cardProcessingFee: v })} placeholder="0" />
              </Field>
            </div>

            <Field label="Payment Redirect URL / Link">
              <input
                type="url"
                value={s.paymentRedirectUrl}
                onChange={(e) => upd({ paymentRedirectUrl: e.target.value })}
                placeholder="https://pay.example.com/checkout"
                className="field-input text-sm"
              />
            </Field>

            <Field label="Payment Instructions" hint="shown to customer">
              <textarea
                rows={2}
                value={s.cardInstructions}
                onChange={(e) => upd({ cardInstructions: e.target.value })}
                placeholder="e.g. You will be redirected to a secure payment gateway."
                className="field-input resize-none text-sm"
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={s.cardConfirmationRequired}
                onChange={(e) => upd({ cardConfirmationRequired: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 text-purple-600 bg-white/10 cursor-pointer"
              />
              <span className="text-xs text-white/70">Require payment confirmation before processing order</span>
            </label>
          </div>
        )}
      </AccordionSection>

      {/* ─── 3. WhatsApp Order ───────────────────────── */}
      <AccordionSection
        icon={<MessageCircle className="w-4 h-4" />}
        title="WhatsApp Order"
        badge={s.whatsappEnabled ? "Available" : "Disabled"}
        badgeColor={s.whatsappEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}
      >
        <Toggle
          checked={s.whatsappEnabled}
          onChange={(v) => upd({ whatsappEnabled: v })}
          labelOn="WhatsApp Order Available"
          labelOff="WhatsApp Order Not Available"
        />

        {s.whatsappEnabled && (
          <div className="space-y-4 mt-3 pl-1">
            <Field label="WhatsApp Number" hint="include country code">
              <input
                type="tel"
                value={s.whatsappNumber}
                onChange={(e) => upd({ whatsappNumber: e.target.value })}
                placeholder="+94754541118"
                className="field-input text-sm font-mono"
              />
            </Field>

            <Field label="WhatsApp Message Template">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {WHATSAPP_VARS.map((v) => (
                    <button
                      key={v.token}
                      type="button"
                      onClick={() => upd({ whatsappTemplate: s.whatsappTemplate + "\n" + v.label + ": " + v.token })}
                      className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-semibold text-blue-300 hover:bg-blue-600/40 transition-all"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={6}
                  value={s.whatsappTemplate}
                  onChange={(e) => upd({ whatsappTemplate: e.target.value })}
                  className="field-input resize-none text-xs font-mono leading-relaxed"
                />
                <p className="text-[10px] text-white/30">Click variable chips above to insert them into the template.</p>
              </div>
            </Field>

            <Field label="Include in WhatsApp Message">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "includeProductName", label: "Product Name" },
                  { key: "includeProductPrice", label: "Product Price" },
                  { key: "includeProductSku", label: "Product SKU" },
                  { key: "includeVariation", label: "Selected Variation" },
                  { key: "includeQuantity", label: "Quantity" },
                  { key: "includeCustomerDetails", label: "Customer Name & Phone" },
                  { key: "includeDeliveryAddress", label: "Delivery Address" },
                  { key: "includeProductUrl", label: "Product Page Link" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={(s as any)[key]}
                      onChange={(e) => upd({ [key]: e.target.checked } as any)}
                      className="w-3.5 h-3.5 text-emerald-600 bg-white/10 rounded cursor-pointer"
                    />
                    <span className="text-xs text-white/70">{label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        )}
      </AccordionSection>

      {/* ─── 4. Delivery Availability ────────────────── */}
      <AccordionSection
        icon={<Package className="w-4 h-4" />}
        title="Delivery Availability"
        badge={s.deliveryType === "delivery" ? "Delivery" : s.deliveryType === "pickup" ? "Pickup Only" : s.deliveryType === "delivery_and_pickup" ? "Delivery + Pickup" : s.deliveryType === "digital" ? "Digital" : "No Delivery"}
        badgeColor="bg-amber-500/20 text-amber-300"
      >
        <Field label="Delivery Type">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: "delivery", label: "🚚 Home Delivery Available" },
              { id: "pickup", label: "🏪 Store Pickup Only" },
              { id: "delivery_and_pickup", label: "🚚🏪 Delivery + Pickup" },
              { id: "no_delivery", label: "🚫 No Delivery" },
              { id: "digital", label: "💻 Digital Product" },
            ].map(({ id, label }) => (
              <label key={id} className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl cursor-pointer transition-all ${
                s.deliveryType === id
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              }`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value={id}
                  checked={s.deliveryType === id}
                  onChange={() => upd({ deliveryType: id as any })}
                  className="text-amber-500"
                />
                <span className="text-xs font-semibold">{label}</span>
              </label>
            ))}
          </div>
        </Field>

        {(s.deliveryType === "delivery" || s.deliveryType === "delivery_and_pickup") && (
          <div className="space-y-4 mt-2 pl-1">
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <span className="text-xs font-bold text-white block">Free Delivery</span>
                <span className="text-[10px] text-white/40">When enabled, flat fee is ignored</span>
              </div>
              <Toggle
                checked={s.freeDeliveryEnabled}
                onChange={(v) => upd({ freeDeliveryEnabled: v })}
                labelOn="Free"
                labelOff="Paid"
              />
            </div>

            {!s.freeDeliveryEnabled && (
              <Field label="Flat Delivery Fee (LKR)">
                <NumberInput value={s.flatDeliveryFee} onChange={(v) => upd({ flatDeliveryFee: v })} placeholder="350" />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Min Delivery Days">
                <input
                  type="number"
                  min={1}
                  value={s.estimatedDeliveryMinDays}
                  onChange={(e) => upd({ estimatedDeliveryMinDays: Number(e.target.value) })}
                  className="field-input"
                />
              </Field>
              <Field label="Max Delivery Days">
                <input
                  type="number"
                  min={1}
                  value={s.estimatedDeliveryMaxDays}
                  onChange={(e) => upd({ estimatedDeliveryMaxDays: Number(e.target.value) })}
                  className="field-input"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">⚡ Same-Day Delivery</span>
                  <Toggle checked={s.sameDayDeliveryEnabled} onChange={(v) => upd({ sameDayDeliveryEnabled: v })} labelOn="" labelOff="" />
                </div>
                {s.sameDayDeliveryEnabled && (
                  <NumberInput value={s.sameDayDeliveryFee} onChange={(v) => upd({ sameDayDeliveryFee: v })} placeholder="Fee" />
                )}
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">🚀 Express Delivery</span>
                  <Toggle checked={s.expressDeliveryEnabled} onChange={(v) => upd({ expressDeliveryEnabled: v })} labelOn="" labelOff="" />
                </div>
                {s.expressDeliveryEnabled && (
                  <NumberInput value={s.expressDeliveryFee} onChange={(v) => upd({ expressDeliveryFee: v })} placeholder="Fee" />
                )}
              </div>
            </div>

            <Field label="Delivery Instructions" hint="shown at checkout">
              <textarea
                rows={2}
                value={s.deliveryInstructions}
                onChange={(e) => upd({ deliveryInstructions: e.target.value })}
                placeholder="e.g. Delivery is available islandwide via courier service."
                className="field-input resize-none text-sm"
              />
            </Field>

            <Field label="Restricted Delivery Areas" hint="areas where delivery is NOT available">
              <TagInput
                value={s.restrictedDeliveryAreas}
                onChange={(v) => upd({ restrictedDeliveryAreas: v })}
                presets={SL_DISTRICTS}
                placeholder="Select restricted district…"
              />
            </Field>
          </div>
        )}
      </AccordionSection>

      {/* ─── 5. Delivery Zones ───────────────────────── */}
      <AccordionSection
        icon={<MapPin className="w-4 h-4" />}
        title="District-Based Delivery Zones"
        badge={`${s.deliveryZones.filter((z) => z.isActive).length} Active`}
        badgeColor="bg-blue-500/20 text-blue-300"
      >
        <div className="space-y-2">
          {s.deliveryZones.length === 0 && (
            <div className="text-center py-6 text-white/20 text-xs border border-dashed border-white/10 rounded-xl">
              No delivery zones added. Click below to add Sri Lanka districts with custom fees.
            </div>
          )}

          {s.deliveryZones.map((zone) => (
            <div
              key={zone.id}
              className={`border rounded-xl transition-all ${
                zone.isActive ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-50"
              }`}
            >
              {/* Zone header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateZone(zone.id, { isActive: !zone.isActive })}
                    className={`text-xs ${zone.isActive ? "text-emerald-400" : "text-white/30"}`}
                  >
                    {zone.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <span className="text-sm font-bold text-white">{zone.name || "New Zone"}</span>
                  <span className="text-xs text-white/40">— Rs. {zone.deliveryFee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingZone(editingZone === zone.id ? null : zone.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all text-xs"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateZone(zone)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeZone(zone.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Zone edit form */}
              {editingZone === zone.id && (
                <div className="px-3 pb-3 pt-1 border-t border-white/[0.06] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="District / Zone Name">
                      <select
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        className="field-select text-sm"
                      >
                        <option value="">Select district…</option>
                        {SL_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                        <option value={zone.name && !SL_DISTRICTS.includes(zone.name) ? zone.name : ""}>Custom…</option>
                      </select>
                    </Field>
                    <Field label="Or custom name">
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        placeholder="Custom area name"
                        className="field-input text-sm"
                      />
                    </Field>
                    <Field label="Delivery Fee (LKR)">
                      <NumberInput
                        value={zone.deliveryFee}
                        onChange={(v) => updateZone(zone.id, { deliveryFee: v })}
                        placeholder="350"
                      />
                    </Field>
                    <Field label="Min Order Amount (LKR)">
                      <NumberInput
                        value={zone.minimumOrderAmount}
                        onChange={(v) => updateZone(zone.id, { minimumOrderAmount: v })}
                        placeholder="0"
                      />
                    </Field>
                    <Field label="Est. Delivery Time">
                      <input
                        type="text"
                        value={zone.estimatedDeliveryTime}
                        onChange={(e) => updateZone(zone.id, { estimatedDeliveryTime: e.target.value })}
                        placeholder="e.g. 1-2 business days"
                        className="field-input text-sm"
                      />
                    </Field>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={zone.codEnabled}
                        onChange={(e) => updateZone(zone.id, { codEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 text-blue-600 bg-white/10 rounded cursor-pointer"
                      />
                      <span className="text-xs text-white/70">COD Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={zone.expressDeliveryEnabled}
                        onChange={(e) => updateZone(zone.id, { expressDeliveryEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 text-blue-600 bg-white/10 rounded cursor-pointer"
                      />
                      <span className="text-xs text-white/70">Express Delivery</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Preset district quick-add */}
          <div className="pt-2">
            <p className="text-[10px] text-white/30 mb-2">Quick-add Sri Lanka districts:</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
              {SL_DISTRICTS.map((district) => {
                const exists = s.deliveryZones.some((z) => z.name === district);
                return (
                  <button
                    key={district}
                    type="button"
                    disabled={exists}
                    onClick={() => {
                      if (!exists) {
                        const zone: DeliveryZone = {
                          id: newZoneId(),
                          name: district,
                          deliveryFee: 350,
                          minimumOrderAmount: 0,
                          estimatedDeliveryTime: "3-5 business days",
                          codEnabled: true,
                          expressDeliveryEnabled: false,
                          isActive: true,
                        };
                        upd({ deliveryZones: [...s.deliveryZones, zone] });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                      exists
                        ? "bg-emerald-600/20 border-emerald-600/30 text-emerald-400 cursor-default"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-blue-400/50 hover:text-white/80 cursor-pointer"
                    }`}
                  >
                    {exists ? "✓ " : "+ "}{district}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={addZone}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-blue-400/80 hover:text-blue-400 hover:bg-blue-500/10 border border-dashed border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom Zone
          </button>
        </div>
      </AccordionSection>

      {/* ─── 6. Store Pickup ─────────────────────────── */}
      <AccordionSection
        icon={<Store className="w-4 h-4" />}
        title="Store Pickup"
        badge={s.pickupEnabled ? "Enabled" : "Disabled"}
        badgeColor={s.pickupEnabled ? "bg-blue-500/20 text-blue-300" : "bg-white/10 text-white/30"}
        enabled={s.pickupEnabled}
      >
        <Toggle
          checked={s.pickupEnabled}
          onChange={(v) => upd({ pickupEnabled: v })}
          labelOn="Pickup Available"
          labelOff="Pickup Not Available"
          colorOn="bg-blue-500"
        />

        {s.pickupEnabled && (
          <div className="space-y-4 mt-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pickup Location Name">
                <input
                  type="text"
                  value={s.pickupLocationName}
                  onChange={(e) => upd({ pickupLocationName: e.target.value })}
                  placeholder="STREET MOBILE"
                  className="field-input text-sm"
                />
              </Field>
              <Field label="Contact Number">
                <input
                  type="tel"
                  value={s.pickupContactNumber}
                  onChange={(e) => upd({ pickupContactNumber: e.target.value })}
                  placeholder="+94754541118"
                  className="field-input text-sm font-mono"
                />
              </Field>
            </div>

            <Field label="Store Address">
              <input
                type="text"
                value={s.pickupAddress}
                onChange={(e) => upd({ pickupAddress: e.target.value })}
                placeholder="163, Kandaswamy Kovil Road, Vavuniya Town"
                className="field-input text-sm"
              />
            </Field>

            <Field label="Google Maps Link" hint="optional">
              <input
                type="url"
                value={s.pickupMapUrl}
                onChange={(e) => upd({ pickupMapUrl: e.target.value })}
                placeholder="https://maps.google.com/…"
                className="field-input text-sm"
              />
            </Field>

            <Field label="Available Days">
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                      s.pickupAvailableDays.includes(day)
                        ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={s.pickupAvailableDays.includes(day)}
                      onChange={(e) =>
                        upd({
                          pickupAvailableDays: e.target.checked
                            ? [...s.pickupAvailableDays, day]
                            : s.pickupAvailableDays.filter((d) => d !== day),
                        })
                      }
                      className="sr-only"
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Time">
                <input
                  type="time"
                  value={s.pickupStartTime}
                  onChange={(e) => upd({ pickupStartTime: e.target.value })}
                  className="field-input text-sm"
                />
              </Field>
              <Field label="Closing Time">
                <input
                  type="time"
                  value={s.pickupEndTime}
                  onChange={(e) => upd({ pickupEndTime: e.target.value })}
                  className="field-input text-sm"
                />
              </Field>
            </div>

            <Field label="Preparation Time">
              <input
                type="text"
                value={s.pickupPreparationTime}
                onChange={(e) => upd({ pickupPreparationTime: e.target.value })}
                placeholder="e.g. 30 minutes, 1 hour"
                className="field-input text-sm"
              />
            </Field>

            <Field label="Pickup Instructions" hint="shown to customer">
              <textarea
                rows={2}
                value={s.pickupInstructions}
                onChange={(e) => upd({ pickupInstructions: e.target.value })}
                placeholder="e.g. Please bring your order confirmation when you arrive."
                className="field-input resize-none text-sm"
              />
            </Field>
          </div>
        )}
      </AccordionSection>

      {/* Validation hint */}
      {!s.codEnabled && !s.cardEnabled && !s.whatsappEnabled && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>⚠️ At least one payment method must be enabled. Customers will have no way to purchase this product.</span>
        </div>
      )}
    </div>
  );
}
