import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SpinPromotionSettings, SpinReward, SpinSegment } from "@/lib/types";
import { DEFAULT_SPIN_SETTINGS } from "@/lib/spin-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, customerName, customerEmail, customerPhone } = body;

    // 1. Fetch current settings
    const settingsDocRef = doc(db, "settings", "spin_and_win");
    const settingsSnap = await getDoc(settingsDocRef);
    let settings: SpinPromotionSettings = DEFAULT_SPIN_SETTINGS;

    if (settingsSnap.exists()) {
      settings = {
        ...DEFAULT_SPIN_SETTINGS,
        ...(settingsSnap.data() as SpinPromotionSettings),
      };
    }

    if (!settings.enabled) {
      return NextResponse.json(
        { success: false, error: "The Spin & Win promotion is currently closed." },
        { status: 400 }
      );
    }

    // 2. Strict Duplicate Prevention & Eligibility Check
    const rewardsRef = collection(db, "spin_rewards");

    if (userId && userId !== "guest") {
      const qUser = query(rewardsRef, where("userId", "==", userId));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        const existing = snapUser.docs[0].data();
        return NextResponse.json(
          {
            success: false,
            error: "You have already participated in the First Order Spin & Win.",
            existingReward: { id: snapUser.docs[0].id, ...existing },
          },
          { status: 400 }
        );
      }

      // Check prior orders
      const ordersRef = collection(db, "orders");
      const qOrders = query(ordersRef, where("userId", "==", userId));
      const snapOrders = await getDocs(qOrders);
      const qualifyingOrders = snapOrders.docs.filter((d) => {
        const o = d.data();
        const status = (o.status || o.orderStatus || "").toLowerCase();
        return status !== "cancelled" && status !== "failed";
      });

      if (qualifyingOrders.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Spin & Win is strictly reserved for your first order.",
          },
          { status: 400 }
        );
      }
    }

    if (customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, "");
      if (cleanPhone.length >= 9) {
        const qPhone = query(rewardsRef, where("customerPhone", "==", customerPhone));
        const snapPhone = await getDocs(qPhone);
        if (!snapPhone.empty) {
          const existing = snapPhone.docs[0].data();
          return NextResponse.json(
            {
              success: false,
              error: "This phone number has already claimed a Spin & Win reward.",
              existingReward: { id: snapPhone.docs[0].id, ...existing },
            },
            { status: 400 }
          );
        }
      }
    }

    // 3. Filter eligible segments with remaining inventory
    const segments = settings.segments || DEFAULT_SPIN_SETTINGS.segments;
    const availableSegments = segments.filter((s) => typeof s.inventory === "number" && s.inventory > 0);

    if (availableSegments.length === 0) {
      return NextResponse.json(
        { success: false, error: "All promotional gift inventories have been awarded for today." },
        { status: 400 }
      );
    }

    // 4. Secure Weighted Probability Selection
    const totalWeight = availableSegments.reduce((sum, s) => sum + (Number(s.probability) || 1), 0);
    let randomNum = Math.random() * totalWeight;
    let selectedSegment: SpinSegment = availableSegments[0];

    for (const segment of availableSegments) {
      const weight = Number(segment.probability) || 1;
      if (randomNum <= weight) {
        selectedSegment = segment;
        break;
      }
      randomNum -= weight;
    }

    // Determine winning index in original segments array
    const winningSegmentIndex = segments.findIndex((s) => s.id === selectedSegment.id);

    // 5. Look up linked product if it's a gift with a linked productId
    let giftProductDetails: any = null;
    if (selectedSegment.productId) {
      try {
        const prodSnap = await getDoc(doc(db, "products", selectedSegment.productId));
        if (prodSnap.exists()) {
          const p = prodSnap.data();
          giftProductDetails = {
            id: prodSnap.id,
            name: p.name || selectedSegment.productName || selectedSegment.label,
            price: 0,
            originalPrice: Number(p.price || p.sale_price) || 2500,
            image: p.image || p.primary_image || (p.images && p.images[0]) || selectedSegment.productImage || "/assets/promo/gift-box.png",
            slug: p.slug || "",
          };
        }
      } catch (prodErr) {
        console.warn("Could not load linked gift product, using segment defaults:", prodErr);
      }
    }

    if (!giftProductDetails) {
      // Fallback clean gift product descriptor
      giftProductDetails = {
        id: selectedSegment.productId || `GIFT-${selectedSegment.id}`,
        name: selectedSegment.productName || selectedSegment.label,
        price: 0,
        originalPrice: 2500,
        image: selectedSegment.productImage || "/assets/promo/gift-box.png",
        slug: "spin-win-free-gift",
      };
    }

    // 6. Generate Reward Record
    const rewardId = `RW-SPIN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expiryDays = settings.rewardExpiryDays || 7;
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const newReward: SpinReward = {
      id: rewardId,
      userId: userId || "guest",
      customerName: customerName || "First Order Customer",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      rewardType: selectedSegment.type,
      segmentId: selectedSegment.id,
      segmentLabel: selectedSegment.label,
      productId: giftProductDetails.id,
      productName: giftProductDetails.name,
      productImage: giftProductDetails.image,
      ...(selectedSegment.discountPercent ? { discountPercent: selectedSegment.discountPercent } : {}),
      ...(selectedSegment.discountAmount ? { discountAmount: selectedSegment.discountAmount } : {}),
      status: "issued",
      issuedAt: now.toISOString(),
      expiresAt,
    };

    const cleanRewardData = Object.fromEntries(
      Object.entries(newReward).filter(([_, v]) => v !== undefined)
    );

    // 7. Atomic Write: Save reward and decrement segment inventory
    try {
      await runTransaction(db, async (transaction) => {
        const currentSettingsDoc = await transaction.get(settingsDocRef);
        if (currentSettingsDoc.exists()) {
          const sData = currentSettingsDoc.data() as SpinPromotionSettings;
          const updatedSegments = (sData.segments || []).map((seg) => {
            if (seg.id === selectedSegment.id) {
              return {
                ...seg,
                inventory: Math.max(0, (seg.inventory || 1) - 1),
                claimedCount: (seg.claimedCount || 0) + 1,
              };
            }
            return seg;
          });
          transaction.update(settingsDocRef, {
            segments: updatedSegments,
            updatedAt: new Date().toISOString(),
          });
        }

        const rewardDocRef = doc(db, "spin_rewards", rewardId);
        transaction.set(rewardDocRef, cleanRewardData);
      });
    } catch (txErr) {
      console.warn("Transaction failed, saving with direct write:", txErr);
      await setDoc(doc(db, "spin_rewards", rewardId), cleanRewardData);
    }

    return NextResponse.json({
      success: true,
      winningSegmentIndex: winningSegmentIndex >= 0 ? winningSegmentIndex : 0,
      segment: selectedSegment,
      reward: newReward,
      giftProduct: giftProductDetails,
    });
  } catch (err: any) {
    console.error("POST /api/spin-and-win/spin error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process spin." },
      { status: 500 }
    );
  }
}
