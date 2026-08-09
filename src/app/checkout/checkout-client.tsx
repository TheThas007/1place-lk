"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  MessageCircle,
  Check,
  ChevronRight,
  Lock,
  Loader2,
  MapPin,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useCart, CartItem } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import { getSelectedCheckoutItems } from "@/lib/checkout-store";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc, getDoc } from "firebase/firestore";
import { siteSettings } from "@/lib/data";

const PROVINCES = [
  "Northern Province",
  "Eastern Province",
  "Western Province",
  "Central Province",
  "Southern Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
];

const DISTRICTS = [
  "Vavuniya", "Jaffna", "Kilinochchi", "Mullaitivu", "Mannar",
  "Trincomalee", "Batticaloa", "Ampara", "Anuradhapura", "Polonnaruwa",
  "Kurunegala", "Puttalam", "Gampaha", "Colombo", "Kalutara",
  "Kandy", "Matale", "Nuwara Eliya", "Kegalle", "Ratnapura",
  "Galle", "Matara", "Hambantota", "Badulla", "Monaragala"
];

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  // Load selected checkout items from store or fallback to entire cart
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const items = getSelectedCheckoutItems();
    if (items && items.length > 0) {
      setCheckoutItems(items);
    } else {
      setCheckoutItems(cart);
    }
  }, [cart]);

  // Form State
  const [firstName, setFirstName] = useState(user?.displayName?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.displayName?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");

  const [province, setProvince] = useState("Northern Province");
  const [district, setDistrict] = useState("Vavuniya");
  const [city, setCity] = useState("Vavuniya");
  const [postalCode, setPostalCode] = useState("43000");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");

  // Delivery & Payment selection
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "pickup">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"payhere" | "cod" | "whatsapp">("cod");

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Terms agreement
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic COD Fee state
  const [codFeeAmount, setCodFeeAmount] = useState<number>(250);

  useEffect(() => {
    async function fetchCodFee() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists() && snap.data().cod_fee !== undefined) {
          setCodFeeAmount(Number(snap.data().cod_fee));
        }
      } catch (e) {
        console.error("Error fetching COD fee:", e);
      }
    }
    fetchCodFee();
  }, []);

  // Computations
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  const deliveryFee = deliveryOption === "pickup" ? 0 : 450;
  const codFee = paymentMethod === "cod" ? codFeeAmount : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee + codFee - couponDiscount);

  // Phone Validation
  const isValidPhone = useMemo(() => {
    const cleaned = phone.replace(/[^0-9+]/g, "");
    return cleaned.length >= 9;
  }, [phone]);

  const isValidForm =
    firstName.trim() &&
    lastName.trim() &&
    isValidPhone &&
    email.trim() &&
    district &&
    city.trim() &&
    address.trim() &&
    agreedTerms &&
    checkoutItems.length > 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    if (couponCode.trim().toUpperCase() === "STREET10") {
      setCouponDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code. Try 'STREET10' for 10% off.");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm || submitting) return;

    setSubmitting(true);

    try {
      const orderData = {
        userId: user?.uid || "guest",
        customerName: `${firstName} ${lastName}`,
        email: email || "",
        phone: phone || "",
        altPhone: altPhone || "",
        deliveryAddress: {
          firstName: firstName || "",
          lastName: lastName || "",
          phone: phone || "",
          altPhone: altPhone || "",
          email: email || "",
          province: province || "",
          district: district || "",
          city: city || "",
          postalCode: postalCode || "",
          address: address || "",
          landmark: landmark || "",
          instructions: instructions || "",
        },
        items: checkoutItems.map((item) => ({
          productId: item.productId || "",
          name: item.name || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || "",
          color: item.color || "",
          ram: item.ram || "",
          storage: item.storage || "",
          variantId: item.variantId || "",
          warrantyTitle: item.warrantyTitle || "",
          warrantyPrice: item.warrantyPrice || 0,
        })),
        deliveryOption,
        deliveryFee,
        codFee,
        couponDiscount,
        subtotal,
        finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === "payhere" ? "Pending" : "Pending",
        orderStatus: "Processing",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const generatedOrderId = docRef.id;

      // Remove purchased items from cart
      checkoutItems.forEach((item) => removeFromCart(item.productId));

      if (paymentMethod === "whatsapp") {
        const lines = checkoutItems.map(
          (i) =>
            `• ${i.name}${i.ram ? ` (${i.ram}+${i.storage})` : i.storage ? ` (${i.storage})` : ""}${i.color ? ` - ${i.color}` : ""} × ${i.quantity}`
        );
        const msg = [
          `🛒 *Order #${generatedOrderId.slice(0, 8).toUpperCase()}*`,
          "",
          "*Customer Name:* " + firstName + " " + lastName,
          "*Phone:* " + phone,
          "*Address:* " + address + ", " + city + ", " + district,
          "",
          "*Items:*",
          ...lines,
          "",
          `*Total Amount:* ${formatPrice(finalTotal)}`,
          "*Payment Method:* Cash / WhatsApp Order",
        ].join("\n");

        window.open(`https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
        router.push(`/checkout/success?id=${generatedOrderId}`);
      } else if (paymentMethod === "payhere") {
        // Trigger PayHere gateway with server hash generation
        const hashRes = await fetch("/api/payhere/hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: generatedOrderId,
            amount: finalTotal,
            currency: "LKR",
          }),
        });
        const hashData = await hashRes.json();

        if (!hashData.hash) {
          alert("PayHere error: " + (hashData.error || "Could not generate payment hash."));
          setSubmitting(false);
          return;
        }

        if (typeof window !== "undefined" && (window as any).payhere) {
          const payhere = (window as any).payhere;

          const payment = {
            sandbox: hashData.mode !== "live",
            merchant_id: hashData.merchantId,
            return_url: `${window.location.origin}/checkout/success?id=${generatedOrderId}`,
            cancel_url: `${window.location.origin}/checkout`,
            notify_url: `${window.location.origin}/api/payhere/notify`,
            order_id: generatedOrderId,
            items: cart.map((i) => i.name).join(", ") || `Street Mobile Order #${generatedOrderId.slice(0, 8)}`,
            amount: hashData.amount,
            currency: "LKR",
            hash: hashData.hash,
            first_name: firstName,
            last_name: lastName || "",
            email: email,
            phone: phone,
            address: address,
            city: city || district,
            country: "Sri Lanka",
          };

          payhere.onCompleted = function onCompleted(completedOrderId: string) {
            console.log("PayHere payment completed:", completedOrderId);
            clearCart();
            router.push(`/checkout/success?id=${generatedOrderId}`);
          };

          payhere.onDismissed = function onDismissed() {
            setSubmitting(false);
          };

          payhere.onError = function onError(error: any) {
            console.error("PayHere Error:", error);
            alert("PayHere payment error: " + (typeof error === "string" ? error : JSON.stringify(error)));
            setSubmitting(false);
          };

          payhere.startPayment(payment);
          return;
        } else {
          clearCart();
          router.push(`/checkout/success?id=${generatedOrderId}`);
        }
      } else {
        // COD
        clearCart();
        router.push(`/checkout/success?id=${generatedOrderId}`);
      }
    } catch (err: any) {
      console.error("Order Creation Error:", err);
      alert("Could not create order. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[88px] sm:pt-[96px] pb-24 text-black">
      {/* ── Progress Bar Indicator ── */}
      <div className="border-b border-[#EAEAEA] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-bold">
            <span className="text-black flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">1</span>
              Delivery Details
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-black flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">2</span>
              Payment Options
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-400 flex items-center gap-1.5 font-normal">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">3</span>
              Confirmation
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 pt-8">
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* ── Left Column (65% width): Details & Payment ── */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Contact & Address Section */}
            <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAEAEA]">
                <MapPin className="w-5 h-5 text-black shrink-0" />
                <h2 className="text-lg sm:text-xl font-extrabold text-black">1. Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. Thasmilan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Last Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. Rasa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mobile Number (+94) *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all font-medium"
                    placeholder="e.g. +94 77 414 1118"
                  />
                  {!isValidPhone && phone && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Valid phone number required (+94 format)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Alternative Mobile (Optional)
                  </label>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. +94 77 123 4567"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Province *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    City / Town *
                  </label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. Vavuniya Town"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Postal Code *
                  </label>
                  <input
                    required
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. 43000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all resize-none"
                    placeholder="House / Building No, Street Name, Village / Area..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. Opposite Clock Tower"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. Call before delivery"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Method */}
            <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAEAEA]">
                <Truck className="w-5 h-5 text-black shrink-0" />
                <h2 className="text-lg sm:text-xl font-extrabold text-black">2. Delivery Option</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryOption("standard")}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    deliveryOption === "standard"
                      ? "border-black bg-[#FAFAFA] ring-1 ring-black"
                      : "border-[#EAEAEA] bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                    deliveryOption === "standard" ? "border-black bg-black text-white" : "border-gray-300"
                  }`}>
                    {deliveryOption === "standard" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-black">Standard Courier Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">1-3 Business Days • Rs. 450</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryOption("pickup")}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    deliveryOption === "pickup"
                      ? "border-black bg-[#FAFAFA] ring-1 ring-black"
                      : "border-[#EAEAEA] bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                    deliveryOption === "pickup" ? "border-black bg-black text-white" : "border-gray-300"
                  }`}>
                    {deliveryOption === "pickup" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-black">Store Pickup (Vavuniya)</p>
                    <p className="text-xs text-gray-500 mt-0.5">Ready Same Day • Free</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Payment Methods */}
            <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAEAEA]">
                <CreditCard className="w-5 h-5 text-black shrink-0" />
                <h2 className="text-lg sm:text-xl font-extrabold text-black">3. Payment Option</h2>
              </div>

              <div className="space-y-3">
                {/* PayHere */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("payhere")}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-4 transition-all ${
                    paymentMethod === "payhere"
                      ? "border-black bg-[#FAFAFA] ring-1 ring-black"
                      : "border-[#EAEAEA] bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                      paymentMethod === "payhere" ? "border-black bg-black text-white" : "border-gray-300"
                    }`}>
                      {paymentMethod === "payhere" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-black">Pay Online with PayHere</p>
                      <p className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, Genie, EzCash & Bank Cards</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-black bg-gray-100 px-2.5 py-1 rounded-md">PayHere</span>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-4 transition-all ${
                    paymentMethod === "cod"
                      ? "border-black bg-[#FAFAFA] ring-1 ring-black"
                      : "border-[#EAEAEA] bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                      paymentMethod === "cod" ? "border-black bg-black text-white" : "border-gray-300"
                    }`}>
                      {paymentMethod === "cod" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-black">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay in cash when your order arrives (+ Rs. {codFeeAmount} fee)</p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-black shrink-0" />
                </button>

                {/* WhatsApp Order */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("whatsapp")}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-4 transition-all ${
                    paymentMethod === "whatsapp"
                      ? "border-black bg-[#FAFAFA] ring-1 ring-black"
                      : "border-[#EAEAEA] bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                      paymentMethod === "whatsapp" ? "border-black bg-black text-white" : "border-gray-300"
                    }`}>
                      {paymentMethod === "whatsapp" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-black">Order via WhatsApp</p>
                      <p className="text-xs text-gray-500 mt-0.5">Send order direct to Street Mobile support desk</p>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-black shrink-0" />
                </button>
              </div>
            </div>

          </div>

          {/* ── Right Column (35% width): Sticky Order Summary ── */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="p-6 bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl space-y-6">
              <h2 className="text-lg font-bold text-black pb-3 border-b border-[#EAEAEA]">
                Order Items ({checkoutItems.length})
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {checkoutItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white rounded-lg border border-[#EAEAEA] p-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black truncate">{item.name}</p>
                      <p className="text-gray-500 text-[11px]">
                        {[item.color, item.storage, item.ram].filter(Boolean).join(" • ")} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-black shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-3 border-t border-[#EAEAEA]">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Promo / Coupon Code
                </label>
                {couponApplied ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <span className="font-bold text-emerald-800">Coupon ({couponCode.toUpperCase()}) Applied!</span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-red-500 font-bold hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. STREET10"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-xl text-xs focus:outline-none focus:border-black uppercase font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 pt-3 border-t border-[#EAEAEA]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">{deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}</span>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between">
                    <span>COD Fee</span>
                    <span className="font-bold text-black">{formatPrice(codFee)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-[#EAEAEA] flex items-baseline justify-between">
                <span className="font-extrabold text-black text-base">Total Amount</span>
                <span className="font-black text-2xl text-black">{formatPrice(finalTotal)}</span>
              </div>

              {/* Terms & Policy Consent Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer pt-2 leading-relaxed">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <span>
                  By placing this order, you agree to our{" "}
                  <Link href="/terms-and-conditions" target="_blank" className="underline text-black font-bold hover:text-gray-700">
                    Terms & Conditions
                  </Link>{" "}
                  and acknowledge our{" "}
                  <Link href="/privacy-policy" target="_blank" className="underline text-black font-bold hover:text-gray-700">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/return-policy" target="_blank" className="underline text-black font-bold hover:text-gray-700">
                    Return Policy
                  </Link>.
                </span>
              </label>

              {/* Final Submit Button */}
              <button
                type="submit"
                disabled={!isValidForm || submitting}
                className={`w-full py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                  !isValidForm || submitting
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === "payhere"
                        ? "Pay Securely with PayHere"
                        : paymentMethod === "cod"
                        ? "Place COD Order"
                        : "Continue with WhatsApp"}
                    </span>
                    <Lock className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
