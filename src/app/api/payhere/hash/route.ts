import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId, amount, currency = "LKR" } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields: orderId and amount" }, { status: 400 });
    }

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || process.env.PAYHERE_MERCHANT_ID || "1228551";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4MTYyNDQyMjYxMDI1OTgzMTI2NTkzMDQwODQ5OTYxMjM0MjYwMjM=";

    const formattedAmount = Number(amount).toFixed(2);
    
    // PayHere Hash formula: MD5(merchant_id + order_id + amount_formatted + currency + strtoupper(MD5(merchant_secret)))
    const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
    const hash = crypto
      .createHash("md5")
      .update(merchantId + orderId + formattedAmount + currency + secretHash)
      .digest("hex")
      .toUpperCase();

    return NextResponse.json({
      hash,
      merchantId,
      amount: formattedAmount,
      currency,
      mode: process.env.PAYHERE_MODE || "sandbox",
    });
  } catch (error: any) {
    console.error("PayHere hash generation error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate PayHere hash" }, { status: 500 });
  }
}
