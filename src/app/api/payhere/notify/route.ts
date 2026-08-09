import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const merchant_id = formData.get("merchant_id") as string;
    const order_id = formData.get("order_id") as string;
    const payment_id = formData.get("payment_id") as string;
    const payhere_amount = formData.get("payhere_amount") as string;
    const payhere_currency = formData.get("payhere_currency") as string;
    const status_code = formData.get("status_code") as string;
    const md5sig = formData.get("md5sig") as string;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4MTYyNDQyMjYxMDI1OTgzMTI2NTkzMDQwODQ5OTYxMjM0MjYwMjM=";

    // Verify MD5 Signature
    const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
    const localMd5sig = crypto
      .createHash("md5")
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash)
      .digest("hex")
      .toUpperCase();

    if (localMd5sig !== md5sig) {
      console.warn("PayHere notification signature mismatch!", { localMd5sig, md5sig });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // status_code: "2" = Successful payment, "0" = Pending, "-1" = Canceled, "-2" = Failed
    if (status_code === "2") {
      const orderRef = doc(db, "orders", order_id);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        await updateDoc(orderRef, {
          status: "processing",
          paymentStatus: "paid",
          payherePaymentId: payment_id,
          updatedAt: new Date().toISOString(),
        });
        console.log(`Order ${order_id} marked as PAID via PayHere (Payment ID: ${payment_id})`);
      }
    } else if (status_code === "-2" || status_code === "-1") {
      const orderRef = doc(db, "orders", order_id);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        await updateDoc(orderRef, {
          paymentStatus: "failed",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Error processing PayHere notification:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
