import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { fallbackOfferBanners } from "@/lib/data";
import { OfferBanner } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal = 0, userId = "guest" } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { valid: false, message: "Please enter a valid coupon code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Math.max(0, Number(subtotal) || 0);

    // 1. Fetch active offer banners from Firestore
    let allBanners: OfferBanner[] = [];
    try {
      const snap = await getDocs(collection(db, "offer_banners"));
      allBanners = snap.docs.map((d) => ({ ...d.data(), id: d.id } as OfferBanner));
    } catch (err) {
      console.warn("Firestore coupon fetch error (using fallback offer banners):", err);
      allBanners = fallbackOfferBanners;
    }

    if (!allBanners || allBanners.length === 0) {
      allBanners = fallbackOfferBanners;
    }

    // 2. Find coupon matching code
    const matchedBanner = allBanners.find(
      (b) =>
        b.couponCode &&
        b.couponCode.trim().toUpperCase() === cleanCode &&
        (b.status === "active" || !b.status)
    );

    if (!matchedBanner) {
      return NextResponse.json(
        { valid: false, message: "Invalid or unrecognized coupon code." },
        { status: 404 }
      );
    }

    const now = new Date();

    // 3. Validate Start Date
    if (matchedBanner.startAt) {
      const startDate = new Date(matchedBanner.startAt);
      if (!isNaN(startDate.getTime()) && now < startDate) {
        return NextResponse.json(
          { valid: false, message: "This coupon is not active yet." },
          { status: 400 }
        );
      }
    }

    // 4. Validate End Date
    if (matchedBanner.endAt && !matchedBanner.noExpiry) {
      const endDate = new Date(matchedBanner.endAt);
      if (!isNaN(endDate.getTime()) && now > endDate) {
        return NextResponse.json(
          { valid: false, message: "This coupon has expired." },
          { status: 400 }
        );
      }
    }

    // 5. Validate Target Audience (Logged-in vs Guest)
    if (matchedBanner.targetAudience === "logged_in" && (!userId || userId === "guest")) {
      return NextResponse.json(
        { valid: false, message: "This coupon is exclusively for registered members. Please sign in to apply." },
        { status: 403 }
      );
    }

    // 6. Calculate Dynamic Discount Amount
    let discountAmount = 0;
    const headline = (matchedBanner.headline || "").toLowerCase();
    const desc = (matchedBanner.description || "").toLowerCase();
    const highlight = (matchedBanner.highlightText || "").toLowerCase();
    const combinedText = `${headline} ${desc} ${highlight}`;

    // Check if free shipping coupon
    if (cleanCode.includes("SHIP") || combinedText.includes("free delivery") || combinedText.includes("free shipping")) {
      const standardDeliveryFee = 450;
      discountAmount = standardDeliveryFee;
    } else if (combinedText.includes("%") || cleanCode.includes("10") || cleanCode.includes("15") || cleanCode.includes("20")) {
      // Extract percentage if available, default to 10%
      const match = combinedText.match(/(\d+)\s*%/);
      const percent = match ? Math.min(50, Math.max(1, parseInt(match[1], 10))) : 10;
      discountAmount = Math.round(orderSubtotal * (percent / 100));
    } else {
      // Fixed LKR discount
      const match = combinedText.match(/lkr\s*([\d,]+)/) || combinedText.match(/rs\.?\s*([\d,]+)/);
      if (match) {
        discountAmount = parseInt(match[1].replace(/,/g, ""), 10) || 500;
      } else {
        discountAmount = Math.min(orderSubtotal, 500);
      }
    }

    // Cap discount to order subtotal
    discountAmount = Math.min(discountAmount, orderSubtotal);

    return NextResponse.json({
      valid: true,
      code: cleanCode,
      discountAmount,
      bannerId: matchedBanner.id,
      headline: matchedBanner.headline || "Coupon Applied",
      message: `Coupon '${cleanCode}' applied successfully!`,
    });
  } catch (err: any) {
    console.error("POST /api/coupons/validate error:", err);
    return NextResponse.json(
      { valid: false, message: "An error occurred while validating the coupon." },
      { status: 500 }
    );
  }
}
