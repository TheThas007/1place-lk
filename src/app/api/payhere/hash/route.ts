import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, currency = "LKR" } = body;

    // Strict validation
    if (!orderId || typeof orderId !== "string" || orderId.trim() === "") {
      return NextResponse.json({ error: "A valid orderId is required." }, { status: 400 });
    }

    const cleanOrderId = orderId.trim();

    // Verify order against Firestore database to prevent client manipulation of amount
    let verifiedAmount = Number(amount);
    try {
      const orderSnap = await getDoc(doc(db, "orders", cleanOrderId));
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        if (!orderData.userId || orderData.userId === "guest") {
          return NextResponse.json({ error: "Authentication required for payment." }, { status: 401 });
        }
        const storedTotal = orderData.finalTotal ?? orderData.totalPrice;
        const dbTotal = Number(storedTotal);
        if (!isNaN(dbTotal) && Number.isFinite(dbTotal) && dbTotal > 0) {
          verifiedAmount = dbTotal;
        }
      }
    } catch (dbErr) {
      console.warn("[PayHere Hash] Order verification note:", dbErr);
    }

    if (isNaN(verifiedAmount) || !Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
      return NextResponse.json({ error: "A valid positive amount is required." }, { status: 400 });
    }

    const cleanCurrency = String(currency || "LKR").trim().toUpperCase();
    if (cleanCurrency !== "LKR") {
      return NextResponse.json({ error: "Only LKR currency is supported." }, { status: 400 });
    }

    // Read credentials securely strictly from server-side environment variables
    const merchantId = (process.env.PAYHERE_MERCHANT_ID || "").trim();
    const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || "").trim();

    if (!merchantId || !merchantSecret) {
      console.error("[PayHere Hash] Server error: PAYHERE_MERCHANT_ID or PAYHERE_MERCHANT_SECRET is missing.");
      return NextResponse.json(
        { error: "Payment gateway credentials are not configured on server." },
        { status: 500 }
      );
    }

    // PayHere requires amount formatted to strictly 2 decimal places (e.g. "1000.00")
    const amountInCents = Math.round(verifiedAmount * 100);
    const formattedAmount = (amountInCents / 100).toFixed(2);

    // Official PayHere Hash formula:
    // Hash = strtoupper(md5(merchant_id + order_id + formatted_amount + currency + strtoupper(md5(merchant_secret))))
    const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
    const hash = crypto
      .createHash("md5")
      .update(merchantId + cleanOrderId + formattedAmount + cleanCurrency + secretHash)
      .digest("hex")
      .toUpperCase();

    // Determine site base URL strictly from server environment or default to official domain
    const siteBaseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.streetmobile.lk"
    ).replace(/\/$/, "");

    const mode = (process.env.PAYHERE_MODE || "live").trim().toLowerCase();

    return NextResponse.json({
      hash,
      merchantId,
      amount: formattedAmount,
      currency: cleanCurrency,
      orderId: cleanOrderId,
      mode,
      sandbox: mode !== "live",
      returnUrl: `${siteBaseUrl}/payment/success`,
      cancelUrl: `${siteBaseUrl}/payment/cancel`,
      notifyUrl: `${siteBaseUrl}/api/payhere/notify`,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PayHere Hash] Error generating hash:", errMsg);
    return NextResponse.json(
      { error: "Failed to generate secure payment signature." },
      { status: 500 }
    );
  }
}
