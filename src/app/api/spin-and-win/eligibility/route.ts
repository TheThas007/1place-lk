import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SpinPromotionSettings, SpinReward } from "@/lib/types";
import { DEFAULT_SPIN_SETTINGS } from "@/lib/spin-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, phone, email } = body;

    // 1. Check promotion status
    let settings: SpinPromotionSettings = DEFAULT_SPIN_SETTINGS;
    try {
      const settingsSnap = await getDoc(doc(db, "settings", "spin_and_win"));
      if (settingsSnap.exists()) {
        settings = settingsSnap.data() as SpinPromotionSettings;
      }
    } catch (e) {
      console.warn("Could not load spin settings, fallback to default", e);
    }

    if (!settings.enabled) {
      return NextResponse.json({
        eligible: false,
        reason: "promotion_disabled",
        message: "The Spin & Win promotion is currently inactive.",
      });
    }

    // If visitor is unauthenticated guest without phone/email provided
    if (!userId && !phone && !email) {
      return NextResponse.json({
        eligible: true,
        isGuest: true,
        message: "New visitor eligible for promotion discovery.",
      });
    }

    // 2. Check existing spin rewards (max spins per customer)
    let existingReward: SpinReward | null = null;
    const rewardsRef = collection(db, "spin_rewards");

    if (userId && userId !== "guest") {
      const qUser = query(rewardsRef, where("userId", "==", userId));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        existingReward = { id: snapUser.docs[0].id, ...snapUser.docs[0].data() } as SpinReward;
      }
    }

    if (!existingReward && phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length >= 9) {
        const qPhone = query(rewardsRef, where("customerPhone", "==", phone));
        const snapPhone = await getDocs(qPhone);
        if (!snapPhone.empty) {
          existingReward = { id: snapPhone.docs[0].id, ...snapPhone.docs[0].data() } as SpinReward;
        }
      }
    }

    if (existingReward) {
      const isExpired = new Date(existingReward.expiresAt).getTime() < Date.now();
      return NextResponse.json({
        eligible: false,
        reason: "already_spun",
        message: "You have already claimed your First Order spin reward.",
        existingReward: {
          ...existingReward,
          isExpired,
        },
      });
    }

    // 3. Check customer order history (First Order rule)
    if (userId && userId !== "guest") {
      const ordersRef = collection(db, "orders");
      const qOrders = query(ordersRef, where("userId", "==", userId));
      const snapOrders = await getDocs(qOrders);

      const qualifyingOrders = snapOrders.docs.filter((d) => {
        const o = d.data();
        const status = (o.status || o.orderStatus || "").toLowerCase();
        return status !== "cancelled" && status !== "failed";
      });

      if (qualifyingOrders.length > 0) {
        return NextResponse.json({
          eligible: false,
          reason: "not_first_order",
          message: "This exclusive promotion is valid only for first-time orders.",
        });
      }
    }

    return NextResponse.json({
      eligible: true,
      message: "You are eligible to spin and win!",
    });
  } catch (err: any) {
    console.error("POST /api/spin-and-win/eligibility error:", err);
    return NextResponse.json(
      { eligible: false, error: err.message || "Failed to check eligibility." },
      { status: 500 }
    );
  }
}
