import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_SPIN_SETTINGS } from "@/lib/spin-config";
import { SpinPromotionSettings } from "@/lib/types";

export async function GET() {
  try {
    const docRef = doc(db, "settings", "spin_and_win");
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as SpinPromotionSettings;
      return NextResponse.json({
        success: true,
        settings: {
          ...DEFAULT_SPIN_SETTINGS,
          ...data,
          segments: data.segments && data.segments.length > 0 ? data.segments : DEFAULT_SPIN_SETTINGS.segments,
        },
      });
    }

    // Initialize with defaults if not created yet
    await setDoc(docRef, DEFAULT_SPIN_SETTINGS, { merge: true });
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SPIN_SETTINGS,
    });
  } catch (err: any) {
    console.error("GET /api/spin-and-win/settings error:", err);
    // Return default settings safely if DB is unreachable
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SPIN_SETTINGS,
      fallback: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    // Validate segments and probabilities
    if (Array.isArray(body.segments) && body.segments.length > 0) {
      for (const seg of body.segments) {
        if (typeof seg.inventory === "number" && seg.inventory < 0) {
          seg.inventory = 0;
        }
        if (typeof seg.probability === "number" && seg.probability < 0) {
          seg.probability = 0;
        }
      }
    }

    const payload: SpinPromotionSettings = {
      ...DEFAULT_SPIN_SETTINGS,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, "settings", "spin_and_win");
    await setDoc(docRef, payload, { merge: true });

    return NextResponse.json({
      success: true,
      settings: payload,
    });
  } catch (err: any) {
    console.error("POST /api/spin-and-win/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update settings." },
      { status: 500 }
    );
  }
}
