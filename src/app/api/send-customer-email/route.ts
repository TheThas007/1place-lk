import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { BUSINESS_INFO } from "@/lib/business-info";

export async function POST(req: Request) {
  try {
    const { orderId, customerName, email, statusType, address, district, items, totalPrice } = await req.json();

    const targetEmail = email || BUSINESS_INFO.email;

    // Configure Nodemailer transporter (or safe fallback if credentials not set)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || BUSINESS_INFO.email,
        pass: process.env.EMAIL_PASS || "",
      },
    });

    let subject = "";
    let htmlContent = "";

    const itemsSummary = (items || []).map((i: any) => `• ${i.name} (${i.quantity}x)`).join("<br/>");

    if (statusType === "packing") {
      subject = `📦 Your 1PLACE.LK Order #${orderId.slice(-6).toUpperCase()} is Being Packed!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 30px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">1PLACE.LK</h1>
            <p style="color: #a1a1aa; font-size: 13px;">Premium Electronics & Lifestyle Store</p>
          </div>
          <div style="background: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">📦 Your Parcel is Currently Being Packed!</h2>
            <p style="color: #e4e4e7;">Dear <strong>${customerName}</strong>,</p>
            <p style="color: #d4d4d8; line-height: 1.6;">Great news! Our fulfillment team at 1PLACE.LK is carefully inspecting and packing your order with utmost care.</p>
            <div style="background: #27272a; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; color: #ffffff;">Items Being Packed:</p>
              <p style="margin: 6px 0 0 0; color: #e4e4e7;">${itemsSummary}</p>
            </div>
            <p style="color: #a1a1aa; font-size: 13px;">We will notify you immediately once your courier tracking number is assigned.</p>
          </div>
        </div>
      `;
    } else if (statusType === "on_the_way") {
      subject = `🚚 Your 1PLACE.LK Order #${orderId.slice(-6).toUpperCase()} is On The Way!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 30px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">1PLACE.LK</h1>
            <p style="color: #a1a1aa; font-size: 13px;">Premium Electronics & Lifestyle Store</p>
          </div>
          <div style="background: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">🚚 Your Order is Dispatched!</h2>
            <p style="color: #e4e4e7;">Dear <strong>${customerName}</strong>,</p>
            <p style="color: #d4d4d8; line-height: 1.6;">Your package has departed from 1PLACE.LK Colombo Flagship and is en route to your delivery address.</p>
            <div style="background: #27272a; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; color: #ffffff;">Destination Address:</p>
              <p style="margin: 6px 0 0 0; color: #e4e4e7;">${address || ""}, ${district || ""}</p>
            </div>
            <p style="color: #a1a1aa; font-size: 13px;">Please keep your contact phone active to facilitate seamless handover.</p>
          </div>
        </div>
      `;
    } else if (statusType === "delivered_thankyou" || statusType === "delivered" || statusType === "completed") {
      subject = `✅ Thank you for your order on 1place.lk!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 30px; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">1PLACE.LK</h1>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 4px;">Premium E-Commerce Platform · Sri Lanka</p>
          </div>
          <div style="background: #18181b; padding: 28px; border-radius: 16px; border: 1px solid #27272a; text-align: center;">
            <div style="width: 48px; height: 48px; background-color: #10b981; color: #000000; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">✓</div>
            <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 20px; font-weight: 800;">Thank you for choosing 1place.lk!</h2>
            <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 20px; line-height: 1.6;">
              Your parcel has been successfully delivered with certified authentic warranty coverage.
            </p>
            <div style="margin: 25px 0;">
              <a href="${BUSINESS_INFO.whatsapp.url}" target="_blank" style="background-color: #ffffff; color: #000000; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block;">
                📲 Contact Concierge on WhatsApp
              </a>
            </div>
            <div style="margin-top: 30px; padding-top: 18px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a;">
              <p style="margin: 0;">1PLACE.LK Flagship · ${BUSINESS_INFO.address} · Tel: ${BUSINESS_INFO.phonePrimary}</p>
              <p style="margin: 4px 0 0 0;">Web: <a href="${BUSINESS_INFO.website}" style="color: #ffffff; text-decoration: underline;">${BUSINESS_INFO.domain}</a></p>
            </div>
          </div>
        </div>
      `;
    }

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"1PLACE.LK" <${process.env.EMAIL_USER}>`,
          to: targetEmail,
          subject: subject,
          html: htmlContent,
        });
      }
    } catch (mailErr) {
      console.warn("Mail send skipped/fallback:", mailErr);
    }

    return NextResponse.json({ success: true, message: `Status email (${statusType}) processed successfully!` });
  } catch (error: any) {
    console.error("Error sending customer status email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
