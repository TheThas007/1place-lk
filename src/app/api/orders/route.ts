import { NextResponse } from "next/server";
import { getLocalOrders, saveLocalOrder, updateLocalOrderStatus, deleteLocalOrder, OrderRecord } from "@/lib/orders-store";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET /api/orders - returns all orders
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim();
    const userId = searchParams.get("userId")?.trim();
    const orderId = searchParams.get("id")?.trim();

    // 1. Read local persistent orders
    let localList = getLocalOrders();

    // 2. Read Firestore orders
    let firestoreList: OrderRecord[] = [];
    try {
      const snap = await getDocs(collection(db, "orders"));
      firestoreList = snap.docs.map((d) => ({ ...d.data(), id: d.id } as OrderRecord));
    } catch (e) {
      console.warn("API GET orders Firestore read error (using local store):", e);
    }

    // Merge without duplicates (favoring Firestore or local)
    const map = new Map<string, OrderRecord>();
    [...localList, ...firestoreList].forEach((item) => {
      if (item && item.id) {
        map.set(item.id, item);
      }
    });

    let result = Array.from(map.values());

    // Apply filtering if parameters provided
    if (orderId) {
      result = result.filter((o) => o.id === orderId || o.id.slice(-6) === orderId || o.id.slice(-8) === orderId);
    } else if (phone) {
      result = result.filter(
        (o) =>
          o.primaryPhone?.includes(phone) ||
          o.secondaryPhone?.includes(phone) ||
          phone.includes(o.primaryPhone || "___")
      );
    } else if (userId) {
      result = result.filter((o) => o.userId === userId);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({ success: true, orders: result });
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ success: false, error: err.message, orders: getLocalOrders() });
  }
}

// POST /api/orders - save new order
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = body.id || `SM-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: OrderRecord = {
      id: orderId,
      userId: body.userId || "guest",
      customerName: body.customerName || body.codName || body.cardName || "Valued Customer",
      address: body.address || body.codAddress || "Local Store Pick-up / Delivery",
      district: body.district || body.codDistrict || "Vavuniya",
      primaryPhone: body.primaryPhone || body.codPhone1 || "0774141118",
      secondaryPhone: body.secondaryPhone || body.codPhone2 || "",
      postalCode: body.postalCode || body.codPostal || "",
      items: body.items || [],
      totalPrice: Number(body.totalPrice) || 0,
      paymentMethod: body.paymentMethod || "COD",
      status: body.status || "pending",
      createdAt: body.createdAt || new Date().toISOString()
    };

    // 1. Save to local JSON store
    saveLocalOrder(newOrder);

    // 2. Try saving to Firestore
    try {
      const cleanData = JSON.parse(JSON.stringify(newOrder));
      await setDoc(doc(db, "orders", newOrder.id), cleanData, { merge: true });
    } catch (fsErr) {
      console.warn("Firestore save fallback error (saved to local store):", fsErr);
    }

    return NextResponse.json({ success: true, orderId: newOrder.id, order: newOrder });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/orders - update status
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    updateLocalOrderStatus(id, status);

    try {
      await updateDoc(doc(db, "orders", id), { status });
    } catch (e) {
      console.warn("Firestore status update warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/orders - delete order
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    deleteLocalOrder(id);

    try {
      await deleteDoc(doc(db, "orders", id));
    } catch (e) {
      console.warn("Firestore delete warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
