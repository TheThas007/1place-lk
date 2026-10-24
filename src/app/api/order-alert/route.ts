import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, customerName, paymentMethod, totalPrice, items, district, address, primaryPhone } = body;

    const itemsText = (items || []).map((i: any) => 
      `- ${i.name} (${i.storage || "N/A"}, ${i.color || "N/A"}) x ${i.quantity} @ Rs. ${i.price.toLocaleString()}`
    ).join("\n");

    const mailContent = `
🚨 NEW ORDER PLACED ON 1PLACE.LK

Order Details:
----------------------------------------
Order ID: ${orderId || "N/A"}
Customer Name: ${customerName || "Guest"}
Payment Method: ${paymentMethod || "COD"}
Total Price: Rs. ${totalPrice?.toLocaleString() || "0"}

Delivery Details:
----------------------------------------
District: ${district || "N/A"}
Address: ${address || "N/A"}
Phone: ${primaryPhone || "N/A"}

Items Ordered:
----------------------------------------
${itemsText}

Please login to your 1place.lk Admin Panel to view full details.
`;

    // Configure Nodemailer transporter
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_USER || "orders@1place.lk";
    const senderEmail = process.env.EMAIL_USER || "orders@1place.lk";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: process.env.EMAIL_PASSWORD || "" // App password required
      }
    });

    const mailOptions = {
      from: `"1PLACE.LK Alert" <${senderEmail}>`,
      to: adminEmail,
      subject: `🚨 New Order Alert: #${orderId?.slice(-6) || "1PLACE.LK"}`,
      text: mailContent
    };

    // If environment variable is not configured, skip real sending to prevent crashes
    if (!process.env.EMAIL_PASSWORD) {
      console.log("Email notification skipped: EMAIL_PASSWORD env variable is not set.");
      console.log("Notification Content:\n", mailContent);
      return NextResponse.json({ 
        success: true, 
        message: "Order logged. Email simulation outputted to server logs." 
      });
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Email alert sent successfully" });

  } catch (err: any) {
    console.error("Order alert email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
