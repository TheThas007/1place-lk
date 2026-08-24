import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const merchant_id = (formData.get("merchant_id") as string || "").trim();
    const order_id = (formData.get("order_id") as string || "").trim();
    const payment_id = (formData.get("payment_id") as string || "").trim();
    const payhere_amount = (formData.get("payhere_amount") as string || "").trim();
    const payhere_currency = (formData.get("payhere_currency") as string || "").trim().toUpperCase();
    const status_code = (formData.get("status_code") as string || "").trim();
    const md5sig = (formData.get("md5sig") as string || "").trim().toUpperCase();
    const method = (formData.get("method") as string || "").trim();
    const status_message = (formData.get("status_message") as string || "").trim();

    console.log(`[PayHere Webhook] Notification received for Order: ${order_id}, Status: ${status_code}, Payment ID: ${payment_id}`);

    // Read merchant secret strictly on the server
    const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || "").trim();

    if (!merchantSecret) {
      console.error("[PayHere Webhook] Server error: PAYHERE_MERCHANT_SECRET is not configured.");
      return NextResponse.json({ error: "Gateway secret missing on server." }, { status: 500 });
    }

    if (!order_id || !payment_id || !payhere_amount || !status_code || !md5sig) {
      console.warn("[PayHere Webhook] Missing required parameters from PayHere.");
      return NextResponse.json({ error: "Missing required notification parameters." }, { status: 400 });
    }

    // Official PayHere Webhook MD5 Signature Verification:
    // local_md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
    const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
    const localMd5sig = crypto
      .createHash("md5")
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash)
      .digest("hex")
      .toUpperCase();

    if (localMd5sig !== md5sig) {
      console.error(`[PayHere Webhook] Security Alert: Invalid MD5 signature mismatch for Order ${order_id}!`);
      return NextResponse.json({ error: "Invalid signature verification failed." }, { status: 400 });
    }

    // Locate the order in Firestore
    const orderRef = doc(db, "orders", order_id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.warn(`[PayHere Webhook] Order document not found in Firestore: ${order_id}`);
      return NextResponse.json({ status: "order_not_found" }, { status: 200 });
    }

    const orderData = orderSnap.data();
    const nowIso = new Date().toISOString();

    // Prevent duplicate webhook processing (Idempotency check)
    if (orderData.paymentStatus === "paid" && orderData.payherePaymentId === payment_id) {
      console.log(`[PayHere Webhook] Duplicate notification ignored for already PAID order: ${order_id}`);
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    // ── Exact Minor-Unit (Integer Cents) Verification ──
    const storedTotal = orderData.finalTotal ?? orderData.totalPrice;
    if (storedTotal === undefined || storedTotal === null || storedTotal === "") {
      console.error(`[PayHere Webhook] Security Alert: Missing order total in Firestore for Order ${order_id}!`);
      return NextResponse.json({ error: "Order total missing in database records." }, { status: 400 });
    }

    const rawExpectedAmount = Number(storedTotal);
    const rawReceivedAmount = Number(payhere_amount);

    if (
      isNaN(rawExpectedAmount) ||
      !Number.isFinite(rawExpectedAmount) ||
      rawExpectedAmount <= 0 ||
      isNaN(rawReceivedAmount) ||
      !Number.isFinite(rawReceivedAmount) ||
      rawReceivedAmount <= 0
    ) {
      console.error(
        `[PayHere Webhook] Security Alert: Invalid or non-positive amount value for Order ${order_id}! Expected: ${rawExpectedAmount}, Received: ${payhere_amount}`
      );
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    // Convert both amounts to integer cents (minor units) to prevent floating-point precision errors
    const expectedCents = Math.round(rawExpectedAmount * 100);
    const receivedCents = Math.round(rawReceivedAmount * 100);

    if (
      !Number.isInteger(expectedCents) ||
      !Number.isInteger(receivedCents) ||
      expectedCents <= 0 ||
      receivedCents <= 0
    ) {
      console.error(
        `[PayHere Webhook] Security Alert: Minor-unit calculation failed for Order ${order_id}!`
      );
      return NextResponse.json({ error: "Invalid minor-unit calculation." }, { status: 400 });
    }

    // Require both integer cents amounts to match exactly
    if (expectedCents !== receivedCents) {
      console.error(
        `[PayHere Webhook] Security Alert: Amount mismatch for Order ${order_id}! Expected cents: ${expectedCents} (LKR ${rawExpectedAmount.toFixed(2)}), Received cents: ${receivedCents} (LKR ${rawReceivedAmount.toFixed(2)})`
      );
      await updateDoc(orderRef, {
        paymentStatus: "amount_mismatch",
        payhereStatusCode: status_code,
        payhereStatusMessage: `Amount mismatch: expected ${rawExpectedAmount.toFixed(2)}, received ${rawReceivedAmount.toFixed(2)}`,
        updatedAt: nowIso,
      });
      return NextResponse.json({ error: "Amount mismatch detected." }, { status: 400 });
    }

    // Require currency to be strictly LKR
    if (payhere_currency !== "LKR") {
      console.error(`[PayHere Webhook] Currency mismatch for Order ${order_id}: ${payhere_currency}`);
      return NextResponse.json({ error: "Invalid currency detected. Only LKR is supported." }, { status: 400 });
    }

    // PayHere Status Codes:
    // 2  = Successful payment
    // 0  = Pending payment
    // -1 = Canceled payment
    // -2 = Failed payment
    // -3 = Chargedback payment
    switch (status_code) {
      case "2": {
        await updateDoc(orderRef, {
          paymentStatus: "paid",
          status: orderData.status === "cancelled" ? "cancelled" : "processing",
          payherePaymentId: payment_id,
          paidAmount: rawReceivedAmount,
          currency: payhere_currency,
          paymentMethod: `PayHere (${method || "Online Card"})`,
          payhereStatusCode: "2",
          payhereStatusMessage: status_message || "Payment completed successfully",
          paidAt: nowIso,
          updatedAt: nowIso,
        });

        console.log(`[PayHere Webhook] SUCCESS: Order ${order_id} marked as PAID (LKR ${payhere_amount}, Payment ID: ${payment_id})`);
        break;
      }

      case "0": {
        await updateDoc(orderRef, {
          paymentStatus: "pending",
          payherePaymentId: payment_id,
          payhereStatusCode: "0",
          payhereStatusMessage: status_message || "Payment is pending authorization",
          updatedAt: nowIso,
        });
        console.log(`[PayHere Webhook] PENDING: Order ${order_id} marked as pending.`);
        break;
      }

      case "-1": {
        await updateDoc(orderRef, {
          paymentStatus: "cancelled",
          payhereStatusCode: "-1",
          payhereStatusMessage: status_message || "Payment was cancelled by user",
          updatedAt: nowIso,
        });
        console.log(`[PayHere Webhook] CANCELLED: Order ${order_id} marked as cancelled.`);
        break;
      }

      case "-2": {
        await updateDoc(orderRef, {
          paymentStatus: "failed",
          payhereStatusCode: "-2",
          payhereStatusMessage: status_message || "Payment failed or declined by issuing bank",
          updatedAt: nowIso,
        });
        console.warn(`[PayHere Webhook] FAILED: Order ${order_id} payment failed.`);
        break;
      }

      case "-3": {
        await updateDoc(orderRef, {
          paymentStatus: "charged_back",
          payhereStatusCode: "-3",
          payhereStatusMessage: status_message || "Payment charged back",
          updatedAt: nowIso,
        });
        console.warn(`[PayHere Webhook] CHARGED BACK: Order ${order_id}`);
        break;
      }

      default: {
        console.warn(`[PayHere Webhook] Unhandled status code: ${status_code} for order ${order_id}`);
        await updateDoc(orderRef, {
          payhereStatusCode: status_code,
          payhereStatusMessage: status_message || `Status: ${status_code}`,
          updatedAt: nowIso,
        });
        break;
      }
    }

    return NextResponse.json({ status: "success", orderId: order_id, statusCode: status_code });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("[PayHere Webhook] Internal server error handling webhook:", errMsg);
    return NextResponse.json(
      { error: "Internal server error processing notification." },
      { status: 500 }
    );
  }
}
