import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Valid server-side access codes for admin preview
const VALID_PREVIEW_CODES = [
  "street2024",
  "street2026",
  "streetmobile",
  "streetmobile2026",
  "sm_launch_preview_7788",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, message: "Invalid access code" }, { status: 400 });
    }

    const cleanCode = code.trim();
    const isValid = VALID_PREVIEW_CODES.some((c) => c.toLowerCase() === cleanCode.toLowerCase());

    if (!isValid) {
      // Artificial delay to prevent brute-force
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json({ success: false, message: "Invalid access code" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Access granted",
    });

    // Set preview session cookie (valid for 24 hours)
    response.cookies.set("sm_admin_preview", "authenticated", {
      httpOnly: false, // Accessible to client for instant render check
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
