import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import {
  Product,
  AssistantMessage,
  AssistantLanguage,
  AssistantProductSummary,
} from "@/lib/types";
import {
  DEFAULT_ASSISTANT_SETTINGS,
  DEFAULT_FAQS,
} from "@/lib/assistant-knowledge";
import { formatPrice } from "@/lib/utils";
import { siteSettings } from "@/lib/data";

interface ChatRequestBody {
  message: string;
  language?: AssistantLanguage;
  sessionId: string;
  history?: { sender: string; text: string }[];
  action?: string;
  payload?: any;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json();
    const { message = "", language = "en", sessionId, action, payload } = body;

    const lang: AssistantLanguage = language === "ta" || language === "si" ? language : "en";
    const cleanMsg = (message || "").trim();

    // 1. Fetch live products from Firestore for accurate answers
    let allProducts: Product[] = [];
    try {
      const snap = await getDocs(collection(db, "products"));
      allProducts = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
    } catch (e) {
      console.warn("Error fetching products for assistant:", e);
    }

    // ── Intent 1: Explicit Action Triggered ──
    if (action) {
      const responseMsg = await handleActionTrigger(action, payload, lang, allProducts);
      return NextResponse.json({ message: responseMsg });
    }

    // ── Intent 2: Order Tracking with Verification ──
    const orderMatch = cleanMsg.match(/(?:SM-|\b)([A-Za-z0-9]{6,20})/i);
    const phoneMatch = cleanMsg.match(/(?:0|\+?94)?7[0-9]{8}/);

    if (
      cleanMsg.toLowerCase().includes("track") ||
      cleanMsg.toLowerCase().includes("order") ||
      cleanMsg.toLowerCase().includes("order status") ||
      cleanMsg.includes("ஒர்டர்") ||
      cleanMsg.includes("ඇණවුම")
    ) {
      // Check if order ID is provided
      if (orderMatch) {
        const potentialId = orderMatch[1].toUpperCase();

        // Search in Firestore
        let foundOrder: any = null;
        try {
          const orderSnap = await getDoc(doc(db, "orders", potentialId));
          if (orderSnap.exists()) {
            foundOrder = { id: orderSnap.id, ...orderSnap.data() };
          } else {
            // Search by prefix or ID search
            const q = query(collection(db, "orders"), limit(50));
            const allOrdersSnap = await getDocs(q);
            for (const d of allOrdersSnap.docs) {
              const dId = d.id.toUpperCase();
              if (dId === potentialId || dId.slice(0, 10) === potentialId || dId.slice(-8) === potentialId) {
                foundOrder = { id: d.id, ...d.data() };
                break;
              }
            }
          }
        } catch (e) {
          console.warn("Order search error:", e);
        }

        if (foundOrder) {
          // Verification Check: Verify phone number or email to protect privacy
          const orderPhone = (foundOrder.phone || foundOrder.primaryPhone || "").replace(/[^0-9]/g, "");
          const customerInputPhone = phoneMatch ? phoneMatch[0].replace(/[^0-9]/g, "") : "";

          if (
            customerInputPhone &&
            orderPhone.length >= 9 &&
            (orderPhone.includes(customerInputPhone.slice(-7)) || customerInputPhone.includes(orderPhone.slice(-7)))
          ) {
            // Verified successfully!
            const replyText =
              lang === "ta"
                ? `உங்கள் Order #${foundOrder.id.slice(0, 8).toUpperCase()} விவரங்கள் உறுதிப்படுத்தப்பட்டன:`
                : lang === "si"
                ? `ඔබගේ Order #${foundOrder.id.slice(0, 8).toUpperCase()} විස්තර තහවුරු විය:`
                : `Verified details for Order #${foundOrder.id.slice(0, 8).toUpperCase()}:`;

            const resMsg: AssistantMessage = {
              id: `msg-${Date.now()}`,
              sender: "assistant",
              text: replyText,
              timestamp: new Date().toISOString(),
              language: lang,
              type: "order_status",
              orderData: {
                id: foundOrder.id,
                customerName: foundOrder.customerName || "Customer",
                paymentStatus: foundOrder.paymentStatus || "Processing",
                orderStatus: foundOrder.orderStatus || foundOrder.status || "Processing",
                deliveryOption: foundOrder.deliveryOption || "Standard Courier",
                estimatedDelivery: "1–3 Business Days",
                finalTotal: foundOrder.finalTotal || foundOrder.totalPrice || 0,
                items: (foundOrder.items || []).map((it: any) => ({
                  name: it.name || "Product",
                  quantity: it.quantity || 1,
                  price: it.price || 0,
                  image: it.image || "",
                })),
              },
            };
            return NextResponse.json({ message: resMsg });
          } else {
            // Ask for verification
            const verifyPrompt =
              lang === "ta"
                ? `பாதுகாப்பு காரணங்களுக்காக, தயவுசெய்து உங்கள் Order-ல் வழங்கிய 10-இலக்க Mobile Number-ஐ உள்ளிடவும் (e.g. 077 123 4567).`
                : lang === "si"
                ? `ආරක්ෂක හේතූන් මත, කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න (e.g. 077 123 4567).`
                : `For your privacy and security, please provide the mobile number associated with Order #${potentialId.slice(0, 8)} to view details.`;

            const resMsg: AssistantMessage = {
              id: `msg-${Date.now()}`,
              sender: "assistant",
              text: verifyPrompt,
              timestamp: new Date().toISOString(),
              language: lang,
              type: "text",
            };
            return NextResponse.json({ message: resMsg });
          }
        }
      }

      // If no order ID entered, ask for it
      const askOrderMsg =
        lang === "ta"
          ? "உங்கள் Order Number (e.g. SM-123456) மற்றும் தொடர்பு இலக்கத்தை உள்ளிடவும்."
          : lang === "si"
          ? "කරුණාකර ඔබගේ Order අංකය (e.g. SM-123456) සහ දුරකථන අංකය ඇතුළත් කරන්න."
          : "Please enter your Order Number (e.g. SM-123456) and your phone number to track your order.";

      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: askOrderMsg,
          timestamp: new Date().toISOString(),
          language: lang,
          type: "text",
        },
      });
    }

    // ── Intent 3: Product Comparison ──
    if (
      cleanMsg.toLowerCase().includes("compare") ||
      cleanMsg.toLowerCase().includes("vs") ||
      cleanMsg.includes("ஒப்பீடு") ||
      cleanMsg.includes("සංසන්දනය")
    ) {
      const matchedProducts = findMatchingProducts(cleanMsg, allProducts, 3);
      if (matchedProducts.length >= 2) {
        const text =
          lang === "ta"
            ? `இதோ நீங்கள் கேட்ட சாதனங்களின் ஒப்பீடு:`
            : lang === "si"
            ? `මෙන්න ඔබ ඉල්ලූ දුරකථන සංසන්දනය:`
            : `Here is the side-by-side comparison for the selected models:`;

        const resMsg: AssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text,
          timestamp: new Date().toISOString(),
          language: lang,
          type: "comparison",
          comparisonProducts: matchedProducts.map(toProductSummary),
        };
        return NextResponse.json({ message: resMsg });
      }
    }

    // ── Intent 4: Product Discovery & Price/Stock Inquiry ──
    const searchMatches = findMatchingProducts(cleanMsg, allProducts, 4);
    if (searchMatches.length > 0) {
      const introText =
        lang === "ta"
          ? `Street Mobile-ல் கிடைக்கும் genuine சாதனங்கள்:`
          : lang === "si"
          ? `Street Mobile හි ඇති නිල දුරකථන මාදිලි:`
          : `Here are the authentic products available at Street Mobile:`;

      const resMsg: AssistantMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: introText,
        timestamp: new Date().toISOString(),
        language: lang,
        type: "product_list",
        products: searchMatches.map(toProductSummary),
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Intent 5: Repairs & Warranty ──
    if (
      cleanMsg.toLowerCase().includes("repair") ||
      cleanMsg.toLowerCase().includes("screen") ||
      cleanMsg.toLowerCase().includes("battery") ||
      cleanMsg.toLowerCase().includes("display") ||
      cleanMsg.toLowerCase().includes("warranty") ||
      cleanMsg.includes("மாற்ற") ||
      cleanMsg.includes("ரிப்பேர்") ||
      cleanMsg.includes("අලුත්වැඩියා")
    ) {
      const repairText =
        lang === "ta"
          ? `🔧 **Street Mobile Repair & Warranty Services (வவுனியா):**\n\n• **Express Screen & Battery Replacement**: 100% Genuine பாகங்களுடன் 1–2 மணித்தியாலங்களில் மாற்றித் தரப்படும்.\n• **Warranty**: அனைத்து புதிய சாதனங்களுக்கும் 1-வருட உத்தியோகபூர்வ உத்தரவாதம் உண்டு.\n• **Repair Pricing**: சாதனத்தின் மாடல் மற்றும் பரிசோதனையைப் பொறுத்தது.`
          : lang === "si"
          ? `🔧 **Street Mobile Repair & Warranty (වවුනියාව):**\n\n• **Screen & Battery Replacement**: 100% මුල් අමතර කොටස් සහිතව පැය 1-2කින් සිදුකෙරේ.\n• **Warranty**: සියලුම නව දුරකථන සඳහා වසරක නිල වගකීම හිමිවේ.`
          : `🔧 **Street Mobile Repair & Warranty Services (Vavuniya):**\n\n• **Express Screen & Battery Replacement**: Completed within 1–2 hours using 100% genuine Grade-A parts.\n• **Warranty**: 1-Year official hardware & software warranty on all smartphones.\n• **Inspection**: Walk into our Vavuniya repair lab or contact our technicians for pricing.`;

      const resMsg: AssistantMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: repairText,
        timestamp: new Date().toISOString(),
        language: lang,
        type: "repairs",
        actions: [
          { label: "📞 Call Technician", action: "call_store", payload: siteSettings.phone },
          { label: "💬 WhatsApp Support", action: "open_whatsapp" },
        ],
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Intent 6: Store Location & Contact Details ──
    if (
      cleanMsg.toLowerCase().includes("location") ||
      cleanMsg.toLowerCase().includes("address") ||
      cleanMsg.toLowerCase().includes("phone") ||
      cleanMsg.toLowerCase().includes("contact") ||
      cleanMsg.toLowerCase().includes("where") ||
      cleanMsg.includes("முகவரி") ||
      cleanMsg.includes("இடம்") ||
      cleanMsg.includes("ලිපිනය")
    ) {
      const storeText =
        lang === "ta"
          ? `📍 **Street Mobile Showroom & Repair Lab:**\n\n• **முகவரி**: 163, கந்தசுவாமி கோவில் வீதி, றம்பைக்குளம், வவுனியா.\n• **தொலைபேசி**: 077 414 1118 / 024 222 8118\n• **வேலை நேரம்**: திங்கள் – சனி (9:00 AM – 8:00 PM), ஞாயிறு (10:00 AM – 6:00 PM)`
          : lang === "si"
          ? `📍 **Street Mobile Showroom & Lab (වවුනියාව):**\n\n• **ලිපිනය**: 163, කන්දසාමි කෝවිල් පාර, රම්බයිකුලම්, වවුනියාව.\n• **දුරකථන**: 077 414 1118 / 024 222 8118\n• **වේලාව**: සඳුදා - සෙනසුරාදා: 9:00 AM - 8:00 PM`
          : `📍 **STREET MOBILE Showroom & Repair Lab:**\n\n• **Address**: 163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya Town, Sri Lanka.\n• **Hotline**: 077 414 1118 / 024 222 8118\n• **Hours**: Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 6:00 PM`;

      const resMsg: AssistantMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: storeText,
        timestamp: new Date().toISOString(),
        language: lang,
        type: "contact_info",
        actions: [
          { label: "📞 Call Store", action: "call_store" },
          { label: "🗺️ Get Directions", action: "open_maps", payload: siteSettings.google_maps_link },
          { label: "💬 Chat on WhatsApp", action: "open_whatsapp" },
        ],
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Intent 7: Talk to a Human ──
    if (
      cleanMsg.toLowerCase().includes("human") ||
      cleanMsg.toLowerCase().includes("agent") ||
      cleanMsg.toLowerCase().includes("staff") ||
      cleanMsg.toLowerCase().includes("whatsapp") ||
      cleanMsg.includes("மனிதர்") ||
      cleanMsg.includes("மனித உதவி") ||
      cleanMsg.includes("සහයකයා")
    ) {
      const handoffText =
        lang === "ta"
          ? `எங்கள் வவுனியா showroom நிபுணர்களுடன் தொடர்பு கொள்ள கீழ்வரும் வழிகளில் ஒன்றை தெரிவு செய்யலாம்:`
          : lang === "si"
          ? `අපගේ කාර්ය මණ්ඩලය සමඟ සම්බන්ධ වීමට පහත ක්‍රමයක් තෝරන්න:`
          : `You can connect directly with our human specialists in Vavuniya through any of the following channels:`;

      const resMsg: AssistantMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: handoffText,
        timestamp: new Date().toISOString(),
        language: lang,
        type: "human_handoff",
        actions: [
          { label: "💬 WhatsApp Chat", action: "open_whatsapp" },
          { label: "📞 Call Hotline", action: "call_store" },
          { label: "✉️ Email Support", action: "email_store" },
        ],
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Default Fallback Response ──
    const fallbackText =
      lang === "ta"
        ? `நான் Streetla 👋 Apple, Samsung, Xiaomi போன்கள், விலை, Stock விவரங்கள், Repair மற்றும் Order status போன்றவற்றிற்கு உதவ முடியும். கீழ்வரும் தெரிவுகளில் ஒன்றை அழுத்தவும்:`
        : lang === "si"
        ? `මම Streetla 👋 දුරකථන මිල ගණන්, තොග විස්තර, අලුත්වැඩියා සහ Order තොරතුරු සඳහා මට සහය විය හැක.`
        : `I’m Streetla, your personal shopping assistant at StreetMobile. I can help you find smartphones, check live prices, verify stock in our Vavuniya showroom, track orders, or connect you with human technicians. How can I assist you?`;

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toISOString(),
        language: lang,
        type: "quick_actions",
      },
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        message: {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: "I'm having a brief connection issue. Please feel free to WhatsApp us directly or try again in a moment.",
          timestamp: new Date().toISOString(),
          type: "text",
        },
      },
      { status: 500 }
    );
  }
}

// ── Action Trigger Helper ──
async function handleActionTrigger(
  action: string,
  payload: any,
  lang: AssistantLanguage,
  products: Product[]
): Promise<AssistantMessage> {
  if (action === "start_find_phone") {
    const text =
      lang === "ta"
        ? "உங்கள் budget அல்லது விரும்பிய brand-ஐ தெரிவு செய்யவும்:"
        : lang === "si"
        ? "ඔබගේ අයවැය හෝ කැමති Brand එක තෝරන්න:"
        : "Let's find the right phone for you! What is your budget range or preferred brand?";

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: new Date().toISOString(),
      language: lang,
      type: "text",
      actions: [
        { label: "Under LKR 100K", action: "filter_budget", payload: { max: 100000 } },
        { label: "LKR 100K – 250K", action: "filter_budget", payload: { min: 100000, max: 250000 } },
        { label: "Apple iPhones", action: "filter_brand", payload: "Apple" },
        { label: "Samsung Galaxy", action: "filter_brand", payload: "Samsung" },
      ],
    };
  }

  if (action === "filter_budget" || action === "filter_brand") {
    let filtered = [...products];
    if (action === "filter_budget" && payload) {
      if (payload.min) filtered = filtered.filter((p) => p.price >= payload.min);
      if (payload.max) filtered = filtered.filter((p) => p.price <= payload.max);
    } else if (action === "filter_brand" && typeof payload === "string") {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(payload.toLowerCase()) ||
          p.brand_name?.toLowerCase().includes(payload.toLowerCase())
      );
    }

    const items = filtered.slice(0, 4);
    const text =
      lang === "ta"
        ? `Street Mobile-ல் உள்ள பரிந்துரைக்கப்பட்ட சாதனங்கள்:`
        : lang === "si"
        ? `ඔබට ගැළපෙන දුරකථන මාදිලි:`
        : `Here are our recommended models from our live inventory:`;

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: items.length > 0 ? text : "No exact models found in this filter range.",
      timestamp: new Date().toISOString(),
      language: lang,
      type: "product_list",
      products: items.map(toProductSummary),
    };
  }

  if (action === "store_info") {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: `📍 **STREET MOBILE Showroom & Repair Lab:**\n\n• **Address**: 163, Kandaswamy Kovil Road, Vavuniya.\n• **Phone**: 077 414 1118 / 024 222 8118\n• **Hours**: Mon – Sat: 9:00 AM – 8:00 PM`,
      timestamp: new Date().toISOString(),
      language: lang,
      type: "contact_info",
      actions: [
        { label: "📞 Call Store", action: "call_store" },
        { label: "🗺️ Get Directions", action: "open_maps", payload: siteSettings.google_maps_link },
      ],
    };
  }

  if (action === "human_support") {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Our human support team in Vavuniya is ready to assist you:",
      timestamp: new Date().toISOString(),
      language: lang,
      type: "human_handoff",
      actions: [
        { label: "💬 Chat on WhatsApp", action: "open_whatsapp" },
        { label: "📞 Call 077 414 1118", action: "call_store" },
      ],
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text: "How else can I assist you with your electronics shopping today?",
    timestamp: new Date().toISOString(),
    language: lang,
    type: "text",
  };
}

// ── Search & Filter Helpers ──
function findMatchingProducts(queryText: string, products: Product[], max = 3): Product[] {
  const q = queryText.toLowerCase();
  return products
    .filter((p) => {
      const name = p.name.toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const cat = (p.category_name || "").toLowerCase();
      const brand = (p.brand_name || "").toLowerCase();

      // Check keywords
      if (q.includes("iphone") && name.includes("iphone")) return true;
      if (q.includes("samsung") && (name.includes("samsung") || name.includes("galaxy"))) return true;
      if (q.includes("xiaomi") && (name.includes("xiaomi") || name.includes("redmi"))) return true;
      if (q.includes("pixel") && name.includes("pixel")) return true;
      if (q.includes("watch") && (name.includes("watch") || cat.includes("watch"))) return true;
      if (q.includes("airpods") && (name.includes("airpods") || name.includes("earbuds"))) return true;
      if (q.includes("laptop") && (name.includes("macbook") || cat.includes("laptop"))) return true;

      return (
        name.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        brand.includes(q) ||
        q.split(" ").some((w) => w.length > 3 && name.includes(w))
      );
    })
    .slice(0, max);
}

function toProductSummary(p: Product): AssistantProductSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    old_price: p.old_price,
    image: p.images?.[0] || "/placeholder.png",
    storage: p.storage_options?.[0] || "",
    color: p.colors?.[0] || "",
    warranty: p.warranty || "1 Year Genuine Warranty",
    stock_status: p.stock_status || "in_stock",
    category_name: p.category_name,
  };
}
