import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { AssistantConversation } from "@/lib/types";

// GET /api/assistant/conversations - list recent conversations for admin
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitNum = parseInt(searchParams.get("limit") || "50", 10);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const snap = await getDoc(doc(db, "assistant_conversations", sessionId));
      if (snap.exists()) {
        return NextResponse.json({ conversation: { id: snap.id, ...snap.data() } });
      }
      return NextResponse.json({ conversation: null });
    }

    const q = query(
      collection(db, "assistant_conversations"),
      orderBy("updatedAt", "desc"),
      limit(limitNum)
    );

    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AssistantConversation));

    return NextResponse.json({ conversations: list });
  } catch (err: any) {
    console.warn("GET assistant conversations warning:", err);
    return NextResponse.json({ conversations: [] });
  }
}

// POST /api/assistant/conversations - save or sync conversation
export async function POST(req: Request) {
  try {
    const body: Partial<AssistantConversation> = await req.json();
    if (!body.sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const convRef = doc(db, "assistant_conversations", body.sessionId);
    const payload = {
      ...body,
      updatedAt: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString(),
      status: body.status || "active",
    };

    await setDoc(convRef, payload, { merge: true });

    return NextResponse.json({ success: true, conversation: payload });
  } catch (err: any) {
    console.error("POST assistant conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/assistant/conversations - update status or notes
export async function PATCH(req: Request) {
  try {
    const { id, status, notes, rating } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (rating !== undefined) updates.rating = rating;

    await updateDoc(doc(db, "assistant_conversations", id), updates);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH assistant conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/assistant/conversations - delete conversation
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await deleteDoc(doc(db, "assistant_conversations", id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE assistant conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
