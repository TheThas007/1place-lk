import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SpinReward } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const rewardsRef = collection(db, "spin_rewards");
    const snap = await getDocs(rewardsRef);

    const now = Date.now();
    const rewards: SpinReward[] = snap.docs.map((d) => {
      const data = d.data() as SpinReward;
      const isExpired = data.status === "issued" && new Date(data.expiresAt).getTime() < now;
      return {
        ...data,
        id: d.id,
        status: isExpired ? "expired" : data.status,
      };
    });

    // Sort newest first
    rewards.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

    // Analytics computation
    const totalSpins = rewards.length;
    const rewardsIssued = rewards.length;
    const rewardsRedeemed = rewards.filter((r) => r.status === "redeemed").length;
    const expired = rewards.filter((r) => r.status === "expired").length;
    const unredeemed = rewards.filter((r) => r.status === "issued").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalSpins,
        rewardsIssued,
        rewardsRedeemed,
        unredeemed,
        expired,
      },
      rewards,
    });
  } catch (err: any) {
    console.error("GET /api/spin-and-win/rewards error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load rewards." },
      { status: 500 }
    );
  }
}
