import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const COOKIE_NAME = "sm_guest_remember_token";

// GET /api/checkout/remember-me - returns saved guest profile if cookie present
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ profile: null });
    }

    const docRef = doc(db, "guest_profiles", token);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ profile: docSnap.data(), remembered: true });
    }

    return NextResponse.json({ profile: null });
  } catch (err) {
    console.warn("GET remember-me error:", err);
    return NextResponse.json({ profile: null });
  }
}

// POST /api/checkout/remember-me - saves guest profile and sets HttpOnly cookie
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    let token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      token = crypto.randomBytes(24).toString("hex");
    }

    const docRef = doc(db, "guest_profiles", token);
    await setDoc(docRef, {
      ...body,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    const res = NextResponse.json({ success: true, remembered: true });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    console.error("POST remember-me error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/checkout/remember-me - forgets saved details
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      await deleteDoc(doc(db, "guest_profiles", token));
    }

    const res = NextResponse.json({ success: true, remembered: false });
    res.cookies.delete(COOKIE_NAME);
    return res;
  } catch (err: any) {
    console.error("DELETE remember-me error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
