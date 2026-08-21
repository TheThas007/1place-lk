"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Loader2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  HelpCircle,
} from "lucide-react";
import { useCart, CartItem } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import { getSelectedCheckoutItems } from "@/lib/checkout-store";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { siteSettings } from "@/lib/data";
import CheckoutProgress, { CheckoutStep } from "@/components/checkout/CheckoutProgress";
import DeliveryMethodCard, { DeliveryMethod } from "@/components/checkout/DeliveryMethodCard";
import PaymentMethodCard, { PaymentMethod } from "@/components/checkout/PaymentMethodCard";
import SavedAddressSelector, { SavedAddress } from "@/components/checkout/SavedAddressSelector";
import {
  SRI_LANKA_PROVINCES,
  getDistrictsForProvince,
  getDefaultPostalCodeForDistrict,
  isValidSriLankanPhone,
} from "@/lib/sri-lanka-geo";

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  // Selected checkout items from store or fallback to cart
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const items = getSelectedCheckoutItems();
    if (items && items.length > 0) {
      setCheckoutItems(items);
    } else {
      setCheckoutItems(cart);
    }
  }, [cart]);

  const itemsToUse = useMemo(() => {
    return checkoutItems.length > 0 ? checkoutItems : cart;
  }, [checkoutItems, cart]);

  // ── Contact Details State ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");

  // ── Delivery Address State ──
  const [province, setProvince] = useState("Northern Province");
  const [district, setDistrict] = useState("Vavuniya");
  const [city, setCity] = useState("Vavuniya");
  const [postalCode, setPostalCode] = useState("43000");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");

  // Save profile opt-in
  const [saveProfile, setSaveProfile] = useState(true);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [isFormUsingSaved, setIsFormUsingSaved] = useState(false);

  // ── Delivery & Payment Methods ──
  const [deliveryOption, setDeliveryOption] = useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // ── Promo Code ──
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Terms & Submission ──
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formSubmittedAttempt, setFormSubmittedAttempt] = useState(false);

  // Dynamic COD & Delivery fee
  const [codFeeAmount, setCodFeeAmount] = useState<number>(250);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(450);

  // Load initial user details
  useEffect(() => {
    if (user) {
      const parts = (user.displayName || "").split(" ");
      if (parts[0] && !firstName) setFirstName(parts[0]);
      if (parts.slice(1).join(" ") && !lastName) setLastName(parts.slice(1).join(" "));
      if (user.email && !email) setEmail(user.email);
      if (user.phoneNumber && !phone) setPhone(user.phoneNumber);
    } else {
      // Check if guest has remembered profile
      async function fetchGuestRemembered() {
        try {
          const res = await fetch("/api/checkout/remember-me");
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setFirstName(p.firstName || "");
            setLastName(p.lastName || "");
            setPhone(p.phone || "");
            setAltPhone(p.altPhone || "");
            setEmail(p.email || "");
            if (p.province) setProvince(p.province);
            if (p.district) setDistrict(p.district);
            if (p.city) setCity(p.city);
            if (p.postalCode) setPostalCode(p.postalCode);
            if (p.address) setAddress(p.address);
            if (p.landmark) setLandmark(p.landmark);
            if (p.instructions) setInstructions(p.instructions);
            setIsFormUsingSaved(true);
          }
        } catch (e) {
          console.warn("Guest remember-me fetch warning:", e);
        }
      }
      fetchGuestRemembered();
    }
  }, [user]);

  // Load store settings (fees)
  useEffect(() => {
    async function fetchFees() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.cod_fee !== undefined) setCodFeeAmount(Number(data.cod_fee));
          if (data.delivery_charge !== undefined) setStandardDeliveryFee(Number(data.delivery_charge));
        }
      } catch (e) {
        console.warn("Error fetching store fee settings:", e);
      }
    }
    fetchFees();
  }, []);

  // Update district list when province changes
  const availableDistricts = useMemo(() => {
    return getDistrictsForProvince(province);
  }, [province]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const districts = getDistrictsForProvince(newProvince);
    if (districts.length > 0) {
      setDistrict(districts[0].name);
      setPostalCode(districts[0].postalCode);
      if (!city || city === "Vavuniya") {
        setCity(districts[0].name);
      }
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const code = getDefaultPostalCodeForDistrict(newDistrict);
    setPostalCode(code);
    if (!city || availableDistricts.some((d) => d.name === city)) {
      setCity(newDistrict);
    }
  };

  // Handle saved address selection
  const handleSelectSavedAddress = (addr: SavedAddress | null) => {
    if (!addr) {
      setSelectedSavedAddressId(null);
      setIsFormUsingSaved(false);
      return;
    }
    setSelectedSavedAddressId(addr.id);
    setIsFormUsingSaved(true);
    setFirstName(addr.firstName || "");
    setLastName(addr.lastName || "");
    setPhone(addr.phone || "");
    setAltPhone(addr.altPhone || "");
    setEmail(addr.email || "");
    setProvince(addr.province || "Northern Province");
    setDistrict(addr.district || "Vavuniya");
    setCity(addr.city || "");
    setPostalCode(addr.postalCode || "");
    setAddress(addr.address || "");
    setLandmark(addr.landmark || "");
    setInstructions(addr.instructions || "");
  };

  const handleAddNewAddress = () => {
    setSelectedSavedAddressId(null);
    setIsFormUsingSaved(false);
    setAddress("");
    setLandmark("");
    setInstructions("");
  };

  // Payment Allowed Computations
  const isCodAllowed = useMemo(() => {
    if (!itemsToUse || itemsToUse.length === 0) return true;
    return itemsToUse.every((item) => item.allow_cod !== false);
  }, [itemsToUse]);

  const isCardAllowed = useMemo(() => {
    if (!itemsToUse || itemsToUse.length === 0) return true;
    return itemsToUse.every((item) => item.allow_card !== false);
  }, [itemsToUse]);

  // Price Calculations
  const subtotal = useMemo(() => {
    return itemsToUse.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [itemsToUse]);

  const deliveryFee = deliveryOption === "pickup" ? 0 : standardDeliveryFee;
  const codFee = paymentMethod === "cod" ? codFeeAmount : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee + codFee - couponDiscount);

  // Field Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!phone.trim()) {
      errs.phone = "Mobile number is required.";
    } else if (!isValidSriLankanPhone(phone)) {
      errs.phone = "Enter a valid Sri Lankan phone number (e.g. 077 123 4567).";
    }

    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (deliveryOption === "standard") {
      if (!city.trim()) errs.city = "City / Town is required.";
      if (!address.trim()) errs.address = "Full delivery address is required.";
      if (!postalCode.trim()) errs.postalCode = "Postal code is required.";
    }

    if (!paymentMethod) {
      errs.paymentMethod = "Please select a payment method.";
    }

    if (!agreedTerms) {
      errs.agreedTerms = "You must agree to the Terms and Policies to complete your order.";
    }

    return errs;
  }, [
    firstName,
    lastName,
    phone,
    email,
    deliveryOption,
    city,
    address,
    postalCode,
    paymentMethod,
    agreedTerms,
  ]);

  const isValidForm = Object.keys(errors).length === 0 && itemsToUse.length > 0;

  const markTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const getFieldError = (fieldName: string) => {
    if (formSubmittedAttempt || touchedFields[fieldName]) {
      return errors[fieldName];
    }
    return undefined;
  };

  // Promo code handlers
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);

    setTimeout(() => {
      const code = couponInput.trim().toUpperCase();
      if (code === "WELCOME10" || code === "STREET10") {
        const discountAmount = Math.round(subtotal * 0.1);
        setCouponDiscount(discountAmount);
        setAppliedCoupon(code);
        setCouponMessage({
          type: "success",
          text: `Coupon applied: 10% off (Saved ${formatPrice(discountAmount)})`,
        });
      } else if (code === "FREESHIP") {
        setCouponDiscount(standardDeliveryFee);
        setAppliedCoupon(code);
        setCouponMessage({
          type: "success",
          text: `Free Shipping coupon applied (Saved ${formatPrice(standardDeliveryFee)})`,
        });
      } else {
        setCouponMessage({
          type: "error",
          text: "Invalid promo code. Try WELCOME10 for 10% off.",
        });
      }
      setCouponLoading(false);
    }, 400);
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  // Determine current progress step
  const currentProgressStep: CheckoutStep = useMemo(() => {
    if (!paymentMethod) return "delivery";
    return "payment";
  }, [paymentMethod]);

  // Order Submission Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmittedAttempt(true);

    if (!isValidForm || submitting) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.uid || "guest",
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim() || "",
        deliveryOption,
        deliveryAddress: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          altPhone: altPhone.trim() || "",
          email: email.trim(),
          province: deliveryOption === "pickup" ? "Northern Province" : province,
          district: deliveryOption === "pickup" ? "Vavuniya" : district,
          city: deliveryOption === "pickup" ? "Vavuniya" : city.trim(),
          postalCode: deliveryOption === "pickup" ? "43000" : postalCode.trim(),
          address:
            deliveryOption === "pickup"
              ? "Store Pickup at 163, Kandaswamy Kovil Road, Vavuniya"
              : address.trim(),
          landmark: landmark.trim() || "",
          instructions: instructions.trim() || "",
        },
        items: itemsToUse.map((item) => ({
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
        deliveryFee,
        codFee,
        couponDiscount,
        couponCode: appliedCoupon || "",
        subtotal,
        finalTotal,
        paymentMethod: paymentMethod === "card" ? "Card (PayHere)" : "COD",
        paymentStatus: paymentMethod === "card" ? "Pending Payment" : "Pending COD",
        orderStatus: "Processing",
        createdAt: new Date().toISOString(),
      };

      // 1. Create order in Firestore
      const docRef = await addDoc(collection(db, "orders"), orderPayload);
      const generatedOrderId = docRef.id;

      // 2. Handle saving address profile if opted in
      if (saveProfile) {
        const addressData = {
          label: addressLabel || "Home",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          altPhone: altPhone.trim() || "",
          email: email.trim(),
          province,
          district,
          city: city.trim(),
          postalCode: postalCode.trim(),
          address: address.trim(),
          landmark: landmark.trim() || "",
          instructions: instructions.trim() || "",
        };

        if (user) {
          // Save in user addresses collection
          await addDoc(collection(db, "users", user.uid, "addresses"), addressData);
        } else {
          // Save in guest cookie session
          await fetch("/api/checkout/remember-me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addressData),
          });
        }
      }

      // 3. Process payment flow
      if (paymentMethod === "card") {
        // Trigger PayHere gateway with secure server hash
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
          alert("PayHere error: " + (hashData.error || "Could not initialize payment."));
          setSubmitting(false);
          return;
        }

        if (typeof window !== "undefined" && (window as any).payhere) {
          const payhere = (window as any).payhere;

          const paymentObj = {
            sandbox: hashData.mode !== "live",
            merchant_id: hashData.merchantId,
            return_url: `${window.location.origin}/checkout/success?id=${generatedOrderId}`,
            cancel_url: `${window.location.origin}/checkout`,
            notify_url: `${window.location.origin}/api/payhere/notify`,
            order_id: generatedOrderId,
            items:
              itemsToUse.map((i) => i.name).join(", ") ||
              `Street Mobile Order #${generatedOrderId.slice(0, 8)}`,
            amount: hashData.amount,
            currency: "LKR",
            hash: hashData.hash,
            first_name: firstName.trim(),
            last_name: lastName.trim() || "",
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim() || "Street Mobile Pickup",
            city: city.trim() || district,
            country: "Sri Lanka",
          };

          payhere.onCompleted = function onCompleted(completedOrderId: string) {
            console.log("PayHere payment completed successfully:", completedOrderId);
            clearCart();
            router.push(`/checkout/success?id=${generatedOrderId}`);
          };

          payhere.onDismissed = function onDismissed() {
            setSubmitting(false);
          };

          payhere.onError = function onError(error: any) {
            console.error("PayHere Error:", error);
            alert(
              "Payment could not be processed. Please verify your card details or choose Cash on Delivery."
            );
            setSubmitting(false);
          };

          payhere.startPayment(paymentObj);
          return;
        } else {
          // Fallback if PayHere script not loaded
          clearCart();
          router.push(`/checkout/success?id=${generatedOrderId}`);
        }
      } else {
        // Cash on Delivery
        clearCart();
        router.push(`/checkout/success?id=${generatedOrderId}`);
      }
    } catch (err: any) {
      console.error("Checkout order submission error:", err);
      alert("Could not process order. Please check your network connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Empty Cart Screen
  if (itemsToUse.length === 0) {
    return (
      <div className="bg-white min-h-screen pt-[100px] pb-24 text-black flex items-center justify-center font-sans">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-950 tracking-tight mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-sm text-neutral-500">
              Add some genuine smartphones or premium accessories to start checkout.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-all shadow-md active:scale-95"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-[80px] sm:pt-[92px] pb-28 sm:pb-32 text-neutral-950 font-sans">
      {/* ── 1. Compact Responsive Progress Indicator ── */}
      <CheckoutProgress currentStep={currentProgressStep} />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ════════════════════════════════════════════════════════════════
                LEFT COLUMN (~65%): Form Details & Method Selectors
            ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
              
              {/* ── Section 1: Saved Addresses (If Logged In) ── */}
              <SavedAddressSelector
                user={user}
                selectedAddressId={selectedSavedAddressId}
                onSelectAddress={handleSelectSavedAddress}
                onAddNewClick={handleAddNewAddress}
                isFormUsingSaved={isFormUsingSaved}
              />

              {/* ── Section 2: Contact Details ── */}
              <div
                id="field-contact"
                className="bg-white p-6 sm:p-8 rounded-[24px] border border-neutral-200/90 shadow-2xs space-y-6"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight">
                      Contact Details
                    </h2>
                  </div>
                  {!user && (
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-xs font-bold text-neutral-600 hover:text-black transition-colors"
                    >
                      Already have an account? <span className="underline">Sign in</span>
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* First Name */}
                  <div id="field-firstName">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="given-name"
                      autoComplete="given-name"
                      placeholder="e.g. Thas"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => markTouched("firstName")}
                      className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border transition-all outline-none ${
                        getFieldError("firstName")
                          ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                          : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                      }`}
                    />
                    {getFieldError("firstName") && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {getFieldError("firstName")}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div id="field-lastName">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="family-name"
                      autoComplete="family-name"
                      placeholder="e.g. Milan"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => markTouched("lastName")}
                      className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border transition-all outline-none ${
                        getFieldError("lastName")
                          ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                          : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                      }`}
                    />
                    {getFieldError("lastName") && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {getFieldError("lastName")}
                      </p>
                    )}
                  </div>

                  {/* Primary Mobile Number */}
                  <div id="field-phone">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="tel"
                      autoComplete="tel"
                      placeholder="077 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => markTouched("phone")}
                      className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border transition-all outline-none ${
                        getFieldError("phone")
                          ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                          : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                      }`}
                    />
                    {getFieldError("phone") && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {getFieldError("phone")}
                      </p>
                    )}
                  </div>

                  {/* Alternative Phone (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Alternative Phone <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="075 454 1118"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2" id="field-email">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => markTouched("email")}
                      className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border transition-all outline-none ${
                        getFieldError("email")
                          ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                          : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                      }`}
                    />
                    {getFieldError("email") && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {getFieldError("email")}
                      </p>
                    )}
                    <span className="text-[11px] text-neutral-400 mt-1 block">
                      We will send your order confirmation and official receipt to this email.
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Delivery Method ── */}
              <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-neutral-200/90 shadow-2xs space-y-5">
                <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                  <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight">
                    Delivery Method
                  </h2>
                </div>

                <DeliveryMethodCard
                  selected={deliveryOption}
                  onChange={setDeliveryOption}
                  deliveryFee={standardDeliveryFee}
                />
              </div>

              {/* ── Section 4: Delivery Address (Only when Courier Delivery is selected) ── */}
              {deliveryOption === "standard" && (
                <div
                  id="field-address"
                  className="bg-white p-6 sm:p-8 rounded-[24px] border border-neutral-200/90 shadow-2xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight">
                        Delivery Address
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Province Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full min-h-[48px] px-3.5 rounded-xl text-sm font-medium border border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none cursor-pointer"
                      >
                        {SRI_LANKA_PROVINCES.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Dropdown (Cascades from Province) */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full min-h-[48px] px-3.5 rounded-xl text-sm font-medium border border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none cursor-pointer"
                      >
                        {availableDistricts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City / Town */}
                    <div id="field-city">
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        City / Town <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address-level2"
                        autoComplete="address-level2"
                        placeholder="e.g. Vavuniya Town"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onBlur={() => markTouched("city")}
                        className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border transition-all outline-none ${
                          getFieldError("city")
                            ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                            : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                        }`}
                      />
                      {getFieldError("city") && (
                        <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {getFieldError("city")}
                        </p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div id="field-postalCode">
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postal-code"
                        autoComplete="postal-code"
                        placeholder="43000"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        onBlur={() => markTouched("postalCode")}
                        className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border transition-all outline-none ${
                          getFieldError("postalCode")
                            ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                            : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                        }`}
                      />
                      {getFieldError("postalCode") && (
                        <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {getFieldError("postalCode")}
                        </p>
                      )}
                    </div>

                    {/* Full Delivery Address */}
                    <div className="sm:col-span-2" id="field-address">
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Full Street Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        name="address-line1"
                        autoComplete="address-line1"
                        placeholder="House No, Building Name, Street Name"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onBlur={() => markTouched("address")}
                        className={`w-full p-3.5 rounded-xl text-sm font-medium border transition-all outline-none resize-none ${
                          getFieldError("address")
                            ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                            : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                        }`}
                      />
                      {getFieldError("address") && (
                        <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {getFieldError("address")}
                        </p>
                      )}
                    </div>

                    {/* Nearby Landmark (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Nearby Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Kandaswamy Kovil"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none"
                      />
                    </div>

                    {/* Delivery Instructions (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Delivery Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Call before delivery"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full min-h-[48px] px-4 rounded-xl text-sm font-medium border border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Opt-in to Save Details */}
                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveProfile}
                        onChange={(e) => setSaveProfile(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded-md border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-medium text-neutral-800 leading-snug">
                        Save these details for faster checkout next time
                      </span>
                    </label>

                    {saveProfile && user && (
                      <div className="flex items-center gap-2 pl-7">
                        <span className="text-xs text-neutral-500 font-medium">Save as:</span>
                        {["Home", "Work", "Other"].map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setAddressLabel(lbl)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              addressLabel === lbl
                                ? "bg-black text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section 5: Payment Method ── */}
              <div
                id="field-paymentMethod"
                className="bg-white p-6 sm:p-8 rounded-[24px] border border-neutral-200/90 shadow-2xs space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                  <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                    {deliveryOption === "standard" ? "4" : "3"}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight">
                    Payment Method
                  </h2>
                </div>

                <PaymentMethodCard
                  selected={paymentMethod}
                  onChange={(m) => {
                    setPaymentMethod(m);
                    markTouched("paymentMethod");
                  }}
                  codFee={codFeeAmount}
                  isCodAllowed={isCodAllowed}
                  isCardAllowed={isCardAllowed}
                />

                {getFieldError("paymentMethod") && (
                  <p className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {getFieldError("paymentMethod")}
                  </p>
                )}
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════════
                RIGHT COLUMN (~35%): Sticky Order Summary & Checkout Action
            ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white p-6 sm:p-7 rounded-[24px] border border-neutral-200/90 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 tracking-tight">
                    Order Summary
                  </h3>
                  <span className="text-xs font-bold text-neutral-500">
                    {itemsToUse.reduce((s, i) => s + i.quantity, 0)} Items
                  </span>
                </div>

                {/* Product Items List */}
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {itemsToUse.map((item) => (
                    <div
                      key={item.productId + (item.variantId || "")}
                      className="flex items-center gap-3.5 pb-3 border-b border-neutral-100 last:border-0 last:pb-0"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-neutral-50 border border-neutral-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate leading-tight">
                          {item.name}
                        </h4>

                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mt-0.5">
                          {item.color && <span>{item.color}</span>}
                          {item.storage && (
                            <>
                              <span>•</span>
                              <span>{item.storage}</span>
                            </>
                          )}
                          {item.warrantyTitle && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">{item.warrantyTitle}</span>
                            </>
                          )}
                        </div>

                        {/* Price & Quantity Adjuster */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.productId, item.quantity - 1);
                                } else {
                                  removeFromCart(item.productId);
                                }
                              }}
                              className="px-2 py-0.5 hover:bg-neutral-200 transition-colors text-neutral-700"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-neutral-200 transition-colors text-neutral-700"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-extrabold text-neutral-950">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-2 border-t border-neutral-100">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={Boolean(appliedCoupon)}
                      className="flex-1 min-h-[42px] px-3.5 rounded-xl text-xs font-mono font-bold uppercase border border-neutral-200 bg-neutral-50/40 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none disabled:opacity-60"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-4 min-h-[42px] rounded-xl text-xs font-bold bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-700 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 min-h-[42px] rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        {couponLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Apply</span>
                      </button>
                    )}
                  </div>

                  {couponMessage && (
                    <p
                      className={`mt-2 text-xs font-semibold flex items-center gap-1.5 ${
                        couponMessage.type === "success" ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {couponMessage.type === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{couponMessage.text}</span>
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-neutral-100 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-neutral-900">
                      {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                    </span>
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-neutral-600">
                      <span>COD Handling Fee</span>
                      <span className="font-semibold text-neutral-900">
                        +{formatPrice(codFeeAmount)}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  {/* Prominent Total Amount */}
                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                    <span className="text-base font-bold text-neutral-950">Total Amount</span>
                    <span className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="pt-2 border-t border-neutral-100" id="field-agreedTerms">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => {
                        setAgreedTerms(e.target.checked);
                        markTouched("agreedTerms");
                      }}
                      className="w-4 h-4 mt-0.5 rounded-md border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <span className="text-xs text-neutral-600 leading-snug">
                      I agree to the{" "}
                      <Link
                        href="/terms-and-conditions"
                        target="_blank"
                        className="text-neutral-950 font-bold underline hover:text-black"
                      >
                        Terms &amp; Conditions
                      </Link>
                      ,{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-neutral-950 font-bold underline hover:text-black"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/return-policy"
                        target="_blank"
                        className="text-neutral-950 font-bold underline hover:text-black"
                      >
                        Return Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {getFieldError("agreedTerms") && (
                    <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {getFieldError("agreedTerms")}
                    </p>
                  )}
                </div>

                {/* Desktop Final Checkout Action Button */}
                <div className="hidden lg:block pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-[54px] px-6 rounded-full bg-black text-white font-extrabold text-sm sm:text-base hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : paymentMethod === "card" ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay {formatPrice(finalTotal)}</span>
                      </>
                    ) : (
                      <>
                        <span>Place COD Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted &amp; Verified</span>
                </div>
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════
              MOBILE & TABLET STICKY BOTTOM BAR
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200/90 p-4 shadow-xl backdrop-blur-md">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase tracking-wider">
                  Total Amount
                </span>
                <span className="text-xl font-black text-neutral-950">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 min-h-[48px] px-6 rounded-full bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : paymentMethod === "card" ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {formatPrice(finalTotal)}</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
