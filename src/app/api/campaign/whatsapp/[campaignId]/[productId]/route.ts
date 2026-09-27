import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string; productId: string }> }
) {
  try {
    const params = await context.params;
    const { campaignId, productId } = params;

    if (!campaignId || !productId) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 1. Increment click count in the campaign document
    try {
      const campaignRef = doc(db, "whatsapp_campaigns", campaignId);
      await updateDoc(campaignRef, {
        clickCount: increment(1)
      });
    } catch (err) {
      console.warn("Failed to increment WhatsApp campaign click count", err);
    }

    // 2. Look up the product slug to redirect properly
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const slug = productData.slug || productId;
        return NextResponse.redirect(new URL(`/product/${slug}?ref=wa_${campaignId}`, request.url));
      }
    } catch (err) {
      console.warn("Failed to fetch product for WhatsApp redirect", err);
    }

    // Fallback if product not found
    return NextResponse.redirect(new URL(`/product/${productId}?ref=wa_${campaignId}`, request.url));
    
  } catch (error) {
    console.error("WhatsApp Campaign Tracking Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
