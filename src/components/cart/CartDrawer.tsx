"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, Package, 
  ArrowLeft, CreditCard, CheckCircle2, Truck, Lock, Loader2, Store 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { siteSettings } from "@/lib/data";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { launchPayHerePayment } from "@/lib/payhere";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

const DISTRICTS = [
  "Vavuniya", "Jaffna", "Kilinochchi", "Mullaitivu", "Mannar", 
  "Trincomalee", "Batticaloa", "Ampara", "Anuradhapura", "Polonnaruwa", 
  "Kurunegala", "Puttalam", "Gampaha", "Colombo", "Kalutara", 
  "Kandy", "Matale", "Nuwara Eliya", "Kegalle", "Ratnapura", 
  "Galle", "Matara", "Hambantota", "Badulla", "Monaragala"
];

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<"cart" | "checkout-options" | "cod-form" | "card-form" | "success">("cart");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  // COD Form State
  const [codName, setCodName] = useState(user?.displayName || "");
  const [codAddress, setCodAddress] = useState("");
  const [codDistrict, setCodDistrict] = useState("Vavuniya");
  const [codPhone1, setCodPhone1] = useState(user?.phoneNumber || "");
  const [codPhone2, setCodPhone2] = useState("");
  const [codPostal, setCodPostal] = useState("");

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const lines = cart.map(
      (i) =>
        `• ${i.name}${i.storage ? ` (${i.storage})` : ""}${i.color ? ` - ${i.color}` : ""} × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`
    );
    const msg = [
      "🛍️ *New Order from Street Mobile Website*",
      "",
      ...lines,
      "",
      `*Total: ${formatPrice(total)}*`,
      "",
      "Please confirm my order. Thank you!",
    ].join("\n");
    const url = `https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleCodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codName || !codAddress || !codPhone1 || !codPostal) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Sanitize cart items to remove undefined fields which crash Firestore
      const sanitizedItems = cart.map(item => {
        const itemObj: any = {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        };
        if (item.storage !== undefined) itemObj.storage = item.storage;
        if (item.color !== undefined) itemObj.color = item.color;
        return itemObj;
      });

      const orderData = {
        userId: user?.uid || "guest",
        customerName: codName || user?.displayName || "COD Customer",
        address: codAddress || "",
        district: codDistrict || "Vavuniya",
        primaryPhone: codPhone1 || "",
        secondaryPhone: codPhone2 || "",
        postalCode: codPostal || "",
        items: sanitizedItems,
        totalPrice: total,
        paymentMethod: "COD",
        status: "pending",
        createdAt: new Date().toISOString()
      };

      let finalOrderId = `SM-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (data.orderId) finalOrderId = data.orderId;
      } catch (e) {
        console.warn("API order save warning:", e);
      }

      setOrderId(finalOrderId);

      try {
        const stored = JSON.parse(localStorage.getItem("sm_recent_orders") || "[]");
        if (!stored.includes(finalOrderId)) {
          localStorage.setItem("sm_recent_orders", JSON.stringify([finalOrderId, ...stored]));
        }
      } catch (e) {
        console.warn("Could not save order to local storage", e);
      }

      // Trigger order alert email
      fetch("/api/order-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: finalOrderId,
          customerName: orderData.customerName,
          paymentMethod: orderData.paymentMethod,
          totalPrice: orderData.totalPrice,
          items: orderData.items,
          district: orderData.district,
          address: orderData.address,
          primaryPhone: orderData.primaryPhone
        })
      }).catch(e => console.error(e));

      clearCart();
      setStep("success");
    } catch (err) {
      console.error(err);
      alert("Failed to submit COD order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayHereCheckout = async () => {
    setLoading(true);
    try {
      const sanitizedItems = cart.map(item => {
        const itemObj: any = {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        };
        if (item.storage !== undefined) itemObj.storage = item.storage;
        if (item.color !== undefined) itemObj.color = item.color;
        return itemObj;
      });

      const finalOrderId = `SM-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(finalOrderId);

      const orderData = {
        userId: user?.uid || "guest_authenticated",
        customerName: cardName || codName || user?.displayName || "Customer",
        items: sanitizedItems,
        totalPrice: total,
        paymentMethod: "Card (PayHere)",
        status: "pending",
        paymentStatus: "Pending",
        orderStatus: "Payment Pending",
        payhereVerified: false,
        payhereStatusCode: "0",
        createdAt: new Date().toISOString(),
        district: codDistrict || "Vavuniya",
        address: codAddress || "PayHere Payment Gateway",
        primaryPhone: codPhone1 || "0774141118"
      };

      // 1. Pre-create order as Pending in Database
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderData,
            id: finalOrderId,
          })
        });
      } catch (err) {
        console.warn("Pre-order creation note:", err);
      }

      // Store in user's recent orders in local storage
      try {
        const stored = JSON.parse(localStorage.getItem("sm_recent_orders") || "[]");
        if (!stored.includes(finalOrderId)) {
          localStorage.setItem("sm_recent_orders", JSON.stringify([finalOrderId, ...stored]));
        }
      } catch {}

      // 2. Launch PayHere
      await launchPayHerePayment({
        orderId: finalOrderId,
        amount: total,
        currency: "LKR",
        customerFirstName: orderData.customerName,
        customerLastName: "",
        email: user?.email || "customer@streetmobile.lk",
        phone: orderData.primaryPhone,
        address: orderData.address,
        city: orderData.district,
        items: cart.map((i) => i.name).join(", "),
        onCompleted: async (completedOrderId) => {
          console.log("[Cart] PayHere payment modal returned for order:", completedOrderId || finalOrderId);
          try {
            await updateDoc(doc(db, "orders", finalOrderId), {
              payherePaymentId: completedOrderId || finalOrderId,
              updatedAt: new Date().toISOString(),
            });
          } catch {}
          clearCart();
          onClose();
          router.push(`/payment/success?order_id=${finalOrderId}`);
        },
        onDismissed: async () => {
          console.log("[Cart] PayHere payment dismissed by customer.");
          try {
            await updateDoc(doc(db, "orders", finalOrderId), {
              paymentStatus: "Cancelled",
              orderStatus: "Cancelled",
              payhereStatusCode: "-1",
              updatedAt: new Date().toISOString(),
            });
          } catch {}
          setLoading(false);
        },
        onError: async (error: any) => {
          console.error("[Cart] PayHere Error:", error);
          try {
            await updateDoc(doc(db, "orders", finalOrderId), {
              paymentStatus: "Failed",
              orderStatus: "Cancelled",
              payhereStatusCode: "-2",
              updatedAt: new Date().toISOString(),
            });
          } catch {}
          alert("PayHere payment error: " + (error?.message || error || "Transaction could not be completed"));
          setLoading(false);
        },
      });
    } catch (e: any) {
      console.error("PayHere Error:", e);
      alert(e?.message || "Failed to launch PayHere payment gateway.");
      setLoading(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardName) {
      alert("Please enter valid card details.");
      return;
    }
    await handlePayHereCheckout();
  };

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[90] w-full max-w-[440px] bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-7 pb-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                {step !== "cart" && step !== "success" ? (
                  <button 
                    onClick={() => setStep(step === "checkout-options" ? "cart" : "checkout-options")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <ShoppingBag className="w-5 h-5 text-white" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {step === "cart" && "Your Bag"}
                    {step === "checkout-options" && "Checkout"}
                    {step === "cod-form" && "Cash on Delivery"}
                    {step === "card-form" && "Card Payment"}
                    {step === "success" && "Order Placed"}
                  </h2>
                  <p className="text-xs text-white/40">
                    {step === "cart" && (itemCount === 0 ? "Empty" : `${itemCount} item${itemCount !== 1 ? "s" : ""}`)}
                    {step === "checkout-options" && "Select payment method"}
                    {(step === "cod-form" || step === "card-form") && "Enter details"}
                    {step === "success" && "Thank you for shopping"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step === "cart" && cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="px-3 py-1.5 text-xs text-white/30 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition-all"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              
              {/* STEP 1: CART LIST */}
              {step === "cart" && (
                <div className="space-y-4 h-full flex flex-col">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center my-auto text-center py-20">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-2xl">
                        <Package className="w-9 h-9 text-white/20" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">Your bag is empty</h3>
                      <p className="text-white/40 text-sm mb-7 max-w-[200px]">
                        Add some products to get started!
                      </p>
                      <Link
                        href="/products"
                        onClick={handleClose}
                        className="px-6 py-3 bg-white text-black font-semibold text-sm rounded-2xl hover:bg-white/90 transition-all shadow-lg"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {cart.map((item) => (
                        <motion.div
                          key={`${item.productId}-${item.color}-${item.storage}`}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 60 }}
                          className="flex gap-4 p-4 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] hover:border-white/20 rounded-2xl transition-all shadow-lg"
                        >
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold leading-tight line-clamp-2 mb-1">
                              {item.name}
                            </p>
                            {(item.color || item.storage) && (
                              <p className="text-white/40 text-xs mb-2">
                                {[item.storage, item.color].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            <p className="text-white font-bold text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Controls & Remove option */}
                          <div className="flex flex-col items-end justify-between shrink-0">
                            <button
                              onClick={() => removeFromCart(item.productId, item.variantId, item.color, item.storage)}
                              className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                              title="Remove Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                            <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-1 py-1 mt-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.color, item.storage)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-white text-sm font-bold w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.color, item.storage)}
                                disabled={typeof item.maxStock === "number" && item.maxStock > 0 && item.quantity >= item.maxStock}
                                title={typeof item.maxStock === "number" && item.maxStock > 0 && item.quantity >= item.maxStock ? `Maximum available stock is ${item.maxStock}` : "Increase quantity"}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            {typeof item.maxStock === "number" && item.maxStock > 0 && item.quantity >= item.maxStock && (
                              <span className="text-[10px] text-amber-400 font-semibold mt-1">
                                Max stock ({item.maxStock})
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: CHECKOUT OPTIONS */}
              {step === "checkout-options" && (() => {
                const isCodAllowed = cart.every(item => item.allow_cod !== false);
                const isCardAllowed = cart.every(item => item.allow_card !== false);
                const isWhatsappAllowed = cart.every(item => item.allow_whatsapp !== false);

                return (
                  <div className="space-y-5 pt-2 pb-6">
                    {/* Order Summary Card */}
                    <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Order Summary</p>
                          <p className="text-3xl font-black text-white tracking-tight mt-1">{formatPrice(total)}</p>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white shadow-inner">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-col gap-2 text-xs">
                        <div className="flex items-center justify-between text-white/80 font-medium">
                          <span className="flex items-center gap-2 text-white/70">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Delivery Charge
                          </span>
                          <span className="px-2 py-0.5 bg-white text-black rounded-md font-black text-[9.5px] tracking-wider uppercase">
                            FREE DELIVERY
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-white/80 font-medium">
                          <span className="flex items-center gap-2 text-white/70">
                            <Truck className="w-3.5 h-3.5 text-white" /> Estimated Delivery
                          </span>
                          <span className="font-bold text-white">3 – 7 Working Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Options (Monochrome Black & White) */}
                    <div className="space-y-3">
                      {/* Cash on Delivery Option */}
                      {isCodAllowed && (
                        <button
                          onClick={() => setStep("cod-form")}
                          className="w-full relative overflow-hidden p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/30 transition-all duration-200 group text-left shadow-lg cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                              <Truck className="w-5 h-5" />
                            </div>
                            <span className="px-2.5 py-0.5 bg-white/10 border border-white/15 text-white text-[9.5px] font-bold uppercase tracking-wider rounded-full">
                              Pay on Delivery
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-white transition-colors">
                              Cash on Delivery (COD)
                            </p>
                            <p className="text-xs text-white/45 mt-0.5">
                              Pay with cash when your parcel arrives
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Card Payment Option */}
                      {isCardAllowed && (
                        <button
                          onClick={() => {
                            handleClose();
                            router.push("/checkout");
                          }}
                          className="w-full relative overflow-hidden p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/30 transition-all duration-200 group text-left shadow-lg cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="px-2.5 py-0.5 bg-white/10 border border-white/15 text-white text-[9.5px] font-bold uppercase tracking-wider rounded-full">
                              Instant &amp; Secure
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-white transition-colors">
                              Credit / Debit Card (PayHere)
                            </p>
                            <p className="text-xs text-white/45 mt-0.5">
                              Visa, MasterCard, Amex via PayHere Gateway
                            </p>
                          </div>
                        </button>
                      )}

                      {/* WhatsApp Option */}
                      {isWhatsappAllowed && (
                        <button
                          onClick={handleWhatsAppCheckout}
                          className="w-full relative overflow-hidden p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/30 transition-all duration-200 group text-left shadow-lg cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                              <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="px-2.5 py-0.5 bg-white/10 border border-white/15 text-white text-[9.5px] font-bold uppercase tracking-wider rounded-full">
                              Direct Chat
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-white transition-colors">
                              Order via WhatsApp
                            </p>
                            <p className="text-xs text-white/45 mt-0.5">
                              Instant live chat with store representative
                            </p>
                          </div>
                        </button>
                      )}

                      {!isCodAllowed && (
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 text-xs flex items-start gap-2.5">
                          <span className="text-white text-sm leading-none mt-0.5">ℹ️</span>
                          <span className="leading-relaxed">Cash on Delivery is disabled for high-value items in your bag. Please select Card Payment or WhatsApp Order.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* STEP 3: COD FORM */}
              {step === "cod-form" && (
                <form onSubmit={handleCodSubmit} className="space-y-5 pt-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={codName}
                        onChange={(e) => setCodName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">District *</label>
                        <select
                          value={codDistrict}
                          onChange={(e) => setCodDistrict(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        >
                          {DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={codPostal}
                          onChange={(e) => setCodPostal(e.target.value)}
                          placeholder="e.g. 43000"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Delivery Address *</label>
                      <textarea
                        required
                        rows={3}
                        value={codAddress}
                        onChange={(e) => setCodAddress(e.target.value)}
                        placeholder="House number, street name, town"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Mobile No 1 *</label>
                        <input
                          type="tel"
                          required
                          value={codPhone1}
                          onChange={(e) => setCodPhone1(e.target.value)}
                          placeholder="Primary contact"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Mobile No 2</label>
                        <input
                          type="tel"
                          value={codPhone2}
                          onChange={(e) => setCodPhone2(e.target.value)}
                          placeholder="Alternative contact"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-4 mt-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm COD Order"}
                  </button>
                </form>
              )}

              {/* STEP 4: CARD FORM */}
              {step === "card-form" && (
                <form onSubmit={handleCardSubmit} className="space-y-6 pt-2">
                  {/* Sleek Luxury Pure Dark Credit Card Preview */}
                  <div className="w-full aspect-[1.78/1] rounded-2xl bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border border-white/20 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md">
                    <div className="flex justify-between items-start">
                      <span className="text-white font-bold tracking-widest text-sm uppercase">Street Pay</span>
                      <CreditCard className="w-8 h-8 text-white/90" />
                    </div>
                    <div className="space-y-4">
                      <div className="text-white text-lg tracking-[0.25em] font-semibold font-mono">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                      </div>
                      <div className="flex justify-between text-xs text-white/80">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Card Holder</p>
                          <p className="font-semibold tracking-wide uppercase truncate max-w-[180px]">
                            {cardName || "Your Name"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Expires</p>
                          <p className="font-semibold">{cardExpiry || "MM/YY"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                            setCardExpiry(val);
                          }}
                          placeholder="MM/YY"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          placeholder="•••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay {formatPrice(total)}
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 5: SUCCESS SCREEN */}
              {step === "success" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-white font-extrabold text-2xl mb-2">Order Confirmed!</h3>
                  <p className="text-white/60 text-sm max-w-[280px] mb-4">
                    Your order has been placed successfully. Thank you for buying from Street Mobile.
                  </p>
                  {orderId && (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 font-mono mb-8 select-all">
                      Order ID: {orderId}
                    </div>
                  )}
                  <button
                    onClick={handleClose}
                    className="px-8 py-3.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-neutral-200 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

            </div>

            {/* Footer */}
            {step === "cart" && cart.length > 0 && (
              <div className="px-6 pb-8 pt-4 border-t border-white/10 shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Subtotal</span>
                  <span className="text-white font-bold text-lg">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-white/30 -mt-2">
                  Shipping and taxes calculated at checkout
                </p>
                <button
                  onClick={() => {
                    if (!user) {
                      handleClose();
                      router.push("/login?redirect=/checkout");
                      return;
                    }
                    setStep("checkout-options");
                  }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold text-sm transition-all active:scale-[0.98] relative overflow-hidden cursor-pointer"
                >
                  Proceed to Checkout
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-[-20deg] pointer-events-none"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                  />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
