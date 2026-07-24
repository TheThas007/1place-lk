import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { orderId, customerName, email, statusType, address, district, items, totalPrice } = await req.json();

    const targetEmail = email || "streetmobilevavuniya@gmail.com";

    // Configure Nodemailer transporter (or log fallback if credentials not set)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "streetmobilevavuniya@gmail.com",
        pass: process.env.EMAIL_PASS || "zxyq abcd efgh ijkl"
      }
    });

    let subject = "";
    let htmlContent = "";

    const itemsSummary = (items || []).map((i: any) => `• ${i.name} (${i.quantity}x)`).join("<br/>");

    if (statusType === "packing") {
      subject = `📦 Your STREET MOBILE Order #${orderId.slice(-6).toUpperCase()} is Being Packed!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 30px; borderRadius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3b82f6; margin: 0;">STREET MOBILE</h1>
            <p style="color: #94a3b8; font-size: 14px;">Your Trusted Mobile Store in Vavuniya</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #60a5fa; margin-top: 0;">📦 Your Parcel is Currently Being Packed!</h2>
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Great news! Our technical & logistics team at STREET MOBILE is currently carefully packing your order with utmost care and safety.</p>
            <div style="background: rgba(59,130,246,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; font-weight: bold; color: #93c5fd;">Items Being Packed:</p>
              <p style="margin: 5px 0 0 0; color: #e2e8f0;">${itemsSummary}</p>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">We will notify you as soon as your order leaves our store!</p>
          </div>
        </div>
      `;
    } else if (statusType === "on_the_way") {
      subject = `🚚 Your Order #${orderId.slice(-6).toUpperCase()} is On The Way!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 30px; borderRadius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f59e0b; margin: 0;">STREET MOBILE</h1>
            <p style="color: #94a3b8; font-size: 14px;">Your Trusted Mobile Store in Vavuniya</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #fbbf24; margin-top: 0;">🚚 Your Order is On The Way!</h2>
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Your package has been dispatched from STREET MOBILE and is currently en route to your delivery location.</p>
            <div style="background: rgba(245,158,11,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; font-weight: bold; color: #fcd34d;">Delivery Address:</p>
              <p style="margin: 5px 0 0 0; color: #e2e8f0;">${address || ""}, ${district || ""}</p>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Please keep your phone active to receive your parcel smoothly.</p>
          </div>
        </div>
      `;
    } else if (statusType === "delivered_thankyou") {
      subject = `❤️ Thank You for Shopping at STREET MOBILE!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 30px; borderRadius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f43f5e; margin: 0;">STREET MOBILE</h1>
            <p style="color: #94a3b8; font-size: 14px;">Your Trusted Mobile Store in Vavuniya</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <h2 style="color: #fb7185; margin-top: 0; font-size: 22px;">❤️ Thank You for Choosing STREET MOBILE!</h2>
            <p style="font-size: 15px; leading: 1.6;">Dear <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              Your parcel has been delivered! We want to express our deepest gratitude for choosing <strong>STREET MOBILE</strong> for your digital life. 
            </p>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              We are honored to serve you, and you are now an valued member of our <strong>Street Mobile Family</strong>! ❤️
            </p>
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #94a3b8;">
              <p>163, Kandaswamy Kovil Road, Vavuniya Town · 075 454 1118</p>
            </div>
          </div>
        </div>
      `;
    }

    try {
      await transporter.sendMail({
        from: '"STREET MOBILE" <streetmobilevavuniya@gmail.com>',
        to: targetEmail,
        subject: subject,
        html: htmlContent,
      });
    } catch (mailErr) {
      console.warn("Mail send skipped/fallback:", mailErr);
    }

    return NextResponse.json({ success: true, message: `Status email (${statusType}) processed successfully!` });
  } catch (error: any) {
    console.error("Error sending customer status email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
