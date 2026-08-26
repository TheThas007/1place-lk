import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Product,
  AssistantMessage,
  AssistantLanguage,
  AssistantProductSummary,
} from "@/lib/types";
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
    const lowerMsg = cleanMsg.toLowerCase();

    // 1. Fetch live products from Firestore for 100% accurate, live catalog knowledge
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
      lowerMsg.includes("track") ||
      lowerMsg.includes("order status") ||
      lowerMsg.includes("where is my order") ||
      cleanMsg.includes("ஒர்டர்") ||
      cleanMsg.includes("ඇණවුම")
    ) {
      if (orderMatch) {
        const potentialId = orderMatch[1].toUpperCase();

        let foundOrder: any = null;
        try {
          const orderSnap = await getDoc(doc(db, "orders", potentialId));
          if (orderSnap.exists()) {
            foundOrder = { id: orderSnap.id, ...orderSnap.data() };
          } else {
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
          const orderPhone = (foundOrder.phone || foundOrder.primaryPhone || "").replace(/[^0-9]/g, "");
          const customerInputPhone = phoneMatch ? phoneMatch[0].replace(/[^0-9]/g, "") : "";

          if (
            customerInputPhone &&
            orderPhone.length >= 9 &&
            (orderPhone.includes(customerInputPhone.slice(-7)) || customerInputPhone.includes(orderPhone.slice(-7)))
          ) {
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

    // ── Intent 3: Head-to-Head Product Comparison (e.g. "iPhone 15 vs S24", "Compare X and Y") ──
    const isCompareQuery =
      lowerMsg.includes(" vs ") ||
      lowerMsg.includes(" vs. ") ||
      lowerMsg.includes("compare") ||
      lowerMsg.includes("better") ||
      lowerMsg.includes("difference") ||
      cleanMsg.includes("ஒப்பீடு") ||
      cleanMsg.includes("எது நல்லது") ||
      cleanMsg.includes("சங்கட") ||
      cleanMsg.includes("සංසන්දනය");

    if (isCompareQuery) {
      const matchedProducts = findMatchingProducts(cleanMsg, allProducts, 3);
      if (matchedProducts.length >= 2) {
        const p1 = matchedProducts[0];
        const p2 = matchedProducts[1];

        const compAnalysis = generateComparisonAnalysis(p1, p2, lang);

        const resMsg: AssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: compAnalysis,
          timestamp: new Date().toISOString(),
          language: lang,
          type: "comparison",
          comparisonProducts: matchedProducts.map(toProductSummary),
        };
        return NextResponse.json({ message: resMsg });
      }
    }

    // ── Intent 4: Budget-Based Smart Phone Recommendation ──
    const parsedBudget = extractBudgetFromText(lowerMsg);
    if (parsedBudget) {
      const budgetRecommendations = getBudgetRecommendations(parsedBudget, allProducts, lang);
      if (budgetRecommendations) {
        return NextResponse.json({ message: budgetRecommendations });
      }
    }

    // ── Intent 5: Specific Specification or Colors Inquiry ──
    const isColorOrSpecInquiry =
      lowerMsg.includes("color") ||
      lowerMsg.includes("colour") ||
      lowerMsg.includes("spec") ||
      lowerMsg.includes("ram") ||
      lowerMsg.includes("storage") ||
      lowerMsg.includes("battery") ||
      lowerMsg.includes("camera") ||
      cleanMsg.includes("வண்ணம்") ||
      cleanMsg.includes("நிறம்") ||
      cleanMsg.includes("விவரம்");

    if (isColorOrSpecInquiry) {
      const matchedProducts = findMatchingProducts(cleanMsg, allProducts, 1);
      if (matchedProducts.length > 0) {
        const p = matchedProducts[0];
        const specDetails = generateSpecDetailsText(p, lowerMsg, lang);

        const resMsg: AssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: specDetails,
          timestamp: new Date().toISOString(),
          language: lang,
          type: "product_list",
          products: [toProductSummary(p)],
        };
        return NextResponse.json({ message: resMsg });
      }
    }

    // ── Intent 6: Product Discovery & Price/Stock Inquiry ──
    const searchMatches = findMatchingProducts(cleanMsg, allProducts, 4);
    if (searchMatches.length > 0) {
      const p = searchMatches[0];
      const stockText =
        p.stock_status === "in_stock"
          ? "✅ In Stock in Vavuniya Showroom"
          : p.stock_status === "low_stock"
          ? "⚠️ Limited Stock Available"
          : "📦 Pre-Order / Available on Request";

      const installment = Math.round(p.price / 3);

      const introText =
        lang === "ta"
          ? `📱 **${p.name}**\n\n• **விலை**: ${formatPrice(p.price)}${p.old_price ? ` (முந்தைய விலை: ~~${formatPrice(p.old_price)}~~)` : ""}\n• **Stock**: ${stockText}\n• **Installment**: Koko / Mintpay மூலம் மாதம் **${formatPrice(installment)}** (3 தவணைகளில்)\n• **Warranty**: ${p.warranty || "1 Year Genuine Company Warranty"}\n• **வண்ணங்கள்**: ${(p.colors || []).join(", ") || "Original Official Colors"}`
          : lang === "si"
          ? `📱 **${p.name}**\n\n• **මිල**: ${formatPrice(p.price)}\n• **තොග තත්ත්වය**: ${stockText}\n• **වාරික ගෙවීම්**: Koko / Mintpay මගින් මසකට **${formatPrice(installment)}** බැගින්\n• **වගකීම**: ${p.warranty || "වසරක නිල වගකීම"}`
          : `📱 **${p.name}**\n\n• **Price**: ${formatPrice(p.price)}${p.old_price ? ` (Was: ~~${formatPrice(p.old_price)}~~)` : ""}\n• **Stock Status**: ${stockText}\n• **Installments**: Pay 3x **${formatPrice(installment)} / month** interest-free with Koko or Mintpay\n• **Warranty**: ${p.warranty || "1-Year Official Company Warranty"}\n• **Available Colors**: ${(p.colors || []).join(", ") || "Standard Genuine Finishes"}`;

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

    // ── Intent 7: Repairs & Warranty ──
    if (
      lowerMsg.includes("repair") ||
      lowerMsg.includes("screen") ||
      lowerMsg.includes("battery replacement") ||
      lowerMsg.includes("display change") ||
      lowerMsg.includes("warranty") ||
      cleanMsg.includes("மாற்ற") ||
      cleanMsg.includes("ரிப்பேர்") ||
      cleanMsg.includes("டிஸ்பிளே") ||
      cleanMsg.includes("அலுත්වැඩියා")
    ) {
      const repairText =
        lang === "ta"
          ? `🔧 **Street Mobile Repair & Service Lab (வவுனியா):**\n\n• **Express Screen & Battery Replacement**: 100% Genuine Grade-A பாகங்களுடன் 1–2 மணித்தியாலங்களில் மாற்றித் தரப்படும்.\n• **Services**: Display Change, Battery Health Fix, Water Damage Recovery, Motherboard Repair, Face ID / Touch ID Repair.\n• **Warranty**: அனைத்து புதிய சாதனங்களுக்கும் 1-வருட Genuine Company Warranty மற்றும் Repair சேவைகளுக்கும் Service Warranty உண்டு.`
          : lang === "si"
          ? `🔧 **Street Mobile Repair & Warranty (වවුනියාව):**\n\n• **Screen & Battery Replacement**: 100% මුල් අමතර කොටස් සහිතව පැය 1-2කින් සිදුකෙරේ.\n• **Warranty**: සියලුම නව දුරකථන සඳහා වසරක නිල වගකීම හිමිවේ.`
          : `🔧 **Street Mobile Repair & Service Lab (Vavuniya):**\n\n• **Express Screen & Battery Replacement**: Completed within 1–2 hours using 100% genuine Grade-A original parts.\n• **Expert Services**: OLED/AMOLED Display Glass Replacement, Battery Health Restore, Water Damage Revival, Motherboard & IC Repair.\n• **Warranty**: 1-Year official hardware & software warranty on all smartphones + Dedicated Repair Service Warranty.`;

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

    // ── Intent 8: Store Location & Contact Details ──
    if (
      lowerMsg.includes("location") ||
      lowerMsg.includes("address") ||
      lowerMsg.includes("phone") ||
      lowerMsg.includes("contact") ||
      lowerMsg.includes("where") ||
      lowerMsg.includes("open") ||
      cleanMsg.includes("முகவரி") ||
      cleanMsg.includes("இடம்") ||
      cleanMsg.includes("நேரம்") ||
      cleanMsg.includes("ලිපිනය")
    ) {
      const storeText =
        lang === "ta"
          ? `📍 **Street Mobile Showroom & Repair Lab:**\n\n• **முகவரி**: 163, கந்தசுவாமி கோவில் வீதி, றம்பைக்குளம், வவுனியா.\n• **தொலைபேசி**: 077 414 1118 / 024 222 8118\n• **வேலை நேரம்**: திங்கள் – சனி (9:00 AM – 8:00 PM), ஞாயிறு (10:00 AM – 6:00 PM)\n• **Delivery**: இலங்கை முழுவதும் 1–3 நாட்களில் Express Courier Delivery!`
          : lang === "si"
          ? `📍 **Street Mobile Showroom & Lab (වවුනියාව):**\n\n• **ලිපිනය**: 163, කන්දසාමි කෝවිල් පාර, රම්බයිකුලම්, වවුනියාව.\n• **දුරකථන**: 077 414 1118 / 024 222 8118\n• **වේලාව**: සඳුදා - සෙනසුරාදා: 9:00 AM - 8:00 PM`
          : `📍 **STREET MOBILE Showroom & Repair Lab:**\n\n• **Address**: 163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya Town, Sri Lanka.\n• **Hotline**: 077 414 1118 / 024 222 8118\n• **Opening Hours**: Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 6:00 PM\n• **Delivery**: 1–3 Days Island-Wide Express Courier Delivery with Live Tracking.`;

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

    // ── Intent 9: Talk to Human Specialist ──
    if (
      lowerMsg.includes("human") ||
      lowerMsg.includes("agent") ||
      lowerMsg.includes("staff") ||
      lowerMsg.includes("person") ||
      cleanMsg.includes("மனிதர்") ||
      cleanMsg.includes("நேரடி உதவி") ||
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
        ],
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Default Conversational Fallback ──
    const fallbackText =
      lang === "ta"
        ? `வணக்கம்! நான் Streetla 👋 Street Mobile-ன் AI Shopping Assistant.

நான் உங்களுக்கு உதவ முடியும்:
1. 💰 **Budget Recommendations**: "100k-க்குள் சிறந்த Phone எது?"
2. ⚖️ **Product Comparison**: "iPhone 15 vs Samsung S24"
3. 🎨 **Specs & Colors**: "iPhone 15-ல் உள்ள நிறங்கள் என்ன?"
4. 📦 **Stock & Installments**: "Koko தவணை முறை மற்றும் விலை விவரங்கள்"
5. 🔧 **Repair & Warranty**: "Screen change & Company warranty விவரங்கள்"

கீழ்வரும் button-களில் ஒன்றைத் தேர்வு செய்யலாம் அல்லது உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்:`
        : lang === "si"
        ? `ආයුබෝවන්! මම Streetla 👋 Street Mobile හි AI සහයකයා. දුරකථන සංසන්දනය, මිල ගණන්, වාරික ගෙවීම් සහ අලුත්වැඩියා විස්තර සඳහා මගෙන් විමසන්න.`
        : `Hi! I’m **Streetla**, your personal AI Shopping Assistant at **Street Mobile**.

I can help you with:
• 💰 **Budget Recommendations**: "Best phone under 100,000 LKR"
• ⚖️ **Head-to-Head Comparisons**: "iPhone 15 vs Galaxy S24"
• 🎨 **Specs & Colors**: "What colors & storage for iPhone 13?"
• 📦 **Stock & Pricing**: "Is S24 Ultra in stock?" + 3x Koko installments
• 🔧 **Repairs & Warranty**: Screen & battery replacements in Vavuniya

How can I assist your tech shopping today?`;

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toISOString(),
        language: lang,
        type: "quick_actions",
        actions: [
          { label: "🔍 Find Phone by Budget", action: "start_find_phone" },
          { label: "⚖️ Compare Flagships", action: "compare_flagships" },
          { label: "📍 Store & Repairs", action: "store_info" },
          { label: "💬 WhatsApp Support", action: "open_whatsapp" },
        ],
      },
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        message: {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: "I'm experiencing a brief network lag. Please try again or chat with our team directly on WhatsApp!",
          timestamp: new Date().toISOString(),
          type: "text",
        },
      },
      { status: 500 }
    );
  }
}

// ── Smart Budget Extractor ──
function extractBudgetFromText(text: string): { min?: number; max?: number } | null {
  // e.g. "under 50k", "50000", "1 lakh", "1.5 lakh", "100k", "between 50k and 100k"
  const rangeMatch = text.match(/(?:between|from)?\s*(\d+(?:\.\d+)?)\s*(k|lakh|lakhs)?\s*(?:to|and|-)\s*(\d+(?:\.\d+)?)\s*(k|lakh|lakhs)?/i);
  if (rangeMatch) {
    let minVal = parseFloat(rangeMatch[1]);
    const minUnit = rangeMatch[2]?.toLowerCase();
    if (minUnit === "k") minVal *= 1000;
    else if (minUnit === "lakh" || minUnit === "lakhs") minVal *= 100000;

    let maxVal = parseFloat(rangeMatch[3]);
    const maxUnit = rangeMatch[4]?.toLowerCase();
    if (maxUnit === "k") maxVal *= 1000;
    else if (maxUnit === "lakh" || maxUnit === "lakhs") maxVal *= 100000;

    return { min: minVal, max: maxVal };
  }

  const singleMatch = text.match(/(?:under|below|around|budget|within|kulla|less than|upto|up to)?\s*(\d+(?:\.\d+)?)\s*(k|lakh|lakhs|thousand)?/i);
  if (singleMatch && (text.includes("budget") || text.includes("under") || text.includes("below") || text.includes("kulla") || text.includes("phone") || text.includes("k") || text.includes("lakh"))) {
    let num = parseFloat(singleMatch[1]);
    const unit = singleMatch[2]?.toLowerCase();

    if (unit === "k") num *= 1000;
    else if (unit === "lakh" || unit === "lakhs") num *= 100000;
    else if (unit === "thousand") num *= 1000;
    else if (num < 1000 && num >= 10) num *= 1000; // e.g. "budget 50" -> 50000

    return { max: num };
  }

  return null;
}

// ── Smart Budget Recommendation Generator ──
function getBudgetRecommendations(
  budget: { min?: number; max?: number },
  products: Product[],
  lang: AssistantLanguage
): AssistantMessage | null {
  const min = budget.min || 0;
  const max = budget.max || 10000000;

  const inBudget = products
    .filter((p) => (p.category_name?.toLowerCase().includes("phone") || p.brand_name) && p.price >= min && p.price <= max)
    .sort((a, b) => b.price - a.price);

  if (inBudget.length === 0) return null;

  const topPick = inBudget[0];
  const alternatives = inBudget.slice(1, 4);

  const topSpecs = Object.entries(topPick.specifications || {})
    .slice(0, 3)
    .map(([k, v]) => `• **${k}**: ${v}`)
    .join("\n");

  const text =
    lang === "ta"
      ? `🎯 **உங்கள் Budget (${formatPrice(max)}-க்குள்) Streetla-வின் முதன்மை பரிந்துரை:**

🏆 **${topPick.name}** — **${formatPrice(topPick.price)}**
${topSpecs || "• 100% Original Genuine Device with 1 Year Warranty"}
• **Installment**: மாதம் **${formatPrice(Math.round(topPick.price / 3))}** (Koko / Mintpay 3 தவணைகள்)

${alternatives.length > 0 ? `✨ இந்த budget-ல் உள்ள மற்ற சிறந்த தெரிவுகள்:` : ""}`
      : lang === "si"
      ? `🎯 **ඔබගේ Budget (${formatPrice(max)}) සඳහා Streetla හි ප්‍රමුඛ තේරීම:**\n\n🏆 **${topPick.name}** (${formatPrice(topPick.price)})\n${topSpecs}\n\nතවත් විකල්ප:`
      : `🎯 **Top Recommendation for Your Budget (${formatPrice(max)}):**

🏆 **${topPick.name}** — **${formatPrice(topPick.price)}**
${topSpecs || "• 100% Genuine Original Device with Official Warranty"}
• **Installments**: Pay 3x **${formatPrice(Math.round(topPick.price / 3))} / month** interest-free with Koko/Mintpay

${alternatives.length > 0 ? `✨ Other top value-for-money contenders in your range:` : ""}`;

  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text,
    timestamp: new Date().toISOString(),
    language: lang,
    type: "product_list",
    products: inBudget.slice(0, 4).map(toProductSummary),
  };
}

// ── Head-to-Head Comparison Generator ──
function generateComparisonAnalysis(p1: Product, p2: Product, lang: AssistantLanguage): string {
  const p1Specs = p1.specifications || {};
  const p2Specs = p2.specifications || {};

  const p1Display = p1Specs["Display"] || p1Specs["Screen"] || "Premium High-Refresh Display";
  const p2Display = p2Specs["Display"] || p2Specs["Screen"] || "Premium High-Refresh Display";

  const p1Camera = p1Specs["Camera"] || p1Specs["Main Camera"] || "Pro-Grade High-Res Camera";
  const p2Camera = p2Specs["Camera"] || p2Specs["Main Camera"] || "Pro-Grade High-Res Camera";

  const p1Chip = p1Specs["Chipset"] || p1Specs["Processor"] || p1Specs["Chip"] || "High Performance Processor";
  const p2Chip = p2Specs["Chipset"] || p2Specs["Processor"] || p2Specs["Chip"] || "High Performance Processor";

  const priceDiff = Math.abs(p1.price - p2.price);
  const cheaper = p1.price < p2.price ? p1 : p2;
  const pricier = p1.price >= p2.price ? p1 : p2;

  if (lang === "ta") {
    return `⚖️ **${p1.name} vs ${p2.name} — நேரடி ஒப்பீடு:**

📸 **Camera**:
• **${p1.name}**: ${p1Camera}
• **${p2.name}**: ${p2Camera}

⚡ **Processor & Speed**:
• **${p1.name}**: ${p1Chip}
• **${p2.name}**: ${p2Chip}

📱 **Display**:
• **${p1.name}**: ${p1Display}
• **${p2.name}**: ${p2Display}

💰 **விலை விவரம்**:
• **${p1.name}**: ${formatPrice(p1.price)} (Installment: ${formatPrice(Math.round(p1.price / 3))}/mo)
• **${p2.name}**: ${formatPrice(p2.price)} (Installment: ${formatPrice(Math.round(p2.price / 3))}/mo)

🏆 **Streetla-வின் முடிவு (Verdict)**:
${priceDiff > 0 ? `• சிறந்த Value-for-Money வேண்டுமானால் **${cheaper.name}** சிறந்த தெரிவு (${formatPrice(priceDiff)} குறைவு).\n• உச்சகட்ட Performance & Camera அம்சங்களை விரும்பினால் **${pricier.name}**-ஐ தேர்ந்தெடுக்கலாம்!` : `இரண்டுமே மிகச் சிறந்த தெரிவுகள். உங்கள் பயன்பாட்டிற்கு ஏற்ப தேர்ந்தெடுக்கலாம்!`}`;
  }

  return `⚖️ **${p1.name} vs ${p2.name} — Detailed Head-to-Head Comparison:**

📸 **Camera System**:
• **${p1.name}**: ${p1Camera}
• **${p2.name}**: ${p2Camera}

⚡ **Performance & Chip**:
• **${p1.name}**: ${p1Chip}
• **${p2.name}**: ${p2Chip}

📱 **Display Experience**:
• **${p1.name}**: ${p1Display}
• **${p2.name}**: ${p2Display}

💰 **Price & Easy Installments**:
• **${p1.name}**: ${formatPrice(p1.price)} (3x ${formatPrice(Math.round(p1.price / 3))}/mo)
• **${p2.name}**: ${formatPrice(p2.price)} (3x ${formatPrice(Math.round(p2.price / 3))}/mo)

🏆 **Streetla's Buying Advice**:
${priceDiff > 0 ? `• If you want the maximum value per rupee, choose **${cheaper.name}** (Saves you ${formatPrice(priceDiff)}).\n• If you need top-tier flagship cameras and maximum longevity, go for **${pricier.name}**!` : `Both are stellar devices in their class with 100% genuine warranty.`}`;
}

// ── Specific Spec / Color Details Generator ──
function generateSpecDetailsText(p: Product, queryText: string, lang: AssistantLanguage): string {
  const specs = p.specifications || {};
  const colorsList = (p.colors || []).join(", ") || "Standard Genuine Finishes";
  const storageList = (p.storage_options || []).join(", ") || "Standard Base Storage";

  const allSpecLines = Object.entries(specs)
    .map(([k, v]) => `• **${k}**: ${v}`)
    .join("\n");

  if (lang === "ta") {
    return `📱 **${p.name} — முழு விபரங்கள்:**

🎨 **கிடைக்கும் நிறங்கள் (Colors)**:
${colorsList}

💾 **Storage தெரிவுகள்**:
${storageList}

⚙️ **Technical Specifications**:
${allSpecLines || "• 100% Authentic Original TRCSL Approved Device"}

💰 **விலை**: ${formatPrice(p.price)} (மாதம் ${formatPrice(Math.round(p.price / 3))} x 3 தவணைகள்)
🛡️ **Warranty**: ${p.warranty || "1 Year Company Warranty"}`;
  }

  return `📱 **${p.name} — Specifications & Variants:**

🎨 **Available Colors**:
${colorsList}

💾 **Storage Options**:
${storageList}

⚙️ **Key Specifications**:
${allSpecLines || "• 100% Genuine TRCSL Approved Hardware"}

💰 **Price**: ${formatPrice(p.price)} (Pay 3x ${formatPrice(Math.round(p.price / 3))} / mo with Koko)
🛡️ **Warranty**: ${p.warranty || "1-Year Official Company Warranty"}`;
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
        ? "உங்கள் Budget அல்லது விரும்பிய Brand-ஐ தெரிவு செய்யவும்:"
        : "Let's find the best device for you! Choose your budget or favorite brand:";

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: new Date().toISOString(),
      language: lang,
      type: "text",
      actions: [
        { label: "Under 100K", action: "filter_budget", payload: { max: 100000 } },
        { label: "100K – 250K", action: "filter_budget", payload: { min: 100000, max: 250000 } },
        { label: "250K+ Flagships", action: "filter_budget", payload: { min: 250000 } },
        { label: "Apple iPhones", action: "filter_brand", payload: "Apple" },
        { label: "Samsung Galaxy", action: "filter_brand", payload: "Samsung" },
      ],
    };
  }

  if (action === "compare_flagships") {
    const iphones = products.filter((p) => p.name.toLowerCase().includes("iphone 15"));
    const samsungs = products.filter((p) => p.name.toLowerCase().includes("s24"));

    if (iphones.length > 0 && samsungs.length > 0) {
      const p1 = iphones[0];
      const p2 = samsungs[0];
      return {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: generateComparisonAnalysis(p1, p2, lang),
        timestamp: new Date().toISOString(),
        language: lang,
        type: "comparison",
        comparisonProducts: [toProductSummary(p1), toProductSummary(p2)],
      };
    }
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
        : `Here are our top recommended genuine devices matching your criteria:`;

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: items.length > 0 ? text : "No exact models found in this range.",
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
      text: `📍 **STREET MOBILE Showroom & Repair Lab:**\n\n• **Address**: 163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya.\n• **Hotline**: 077 414 1118 / 024 222 8118\n• **Hours**: Mon – Sat: 9:00 AM – 8:00 PM\n• **Island-wide Delivery**: 1–3 Business Days.`,
      timestamp: new Date().toISOString(),
      language: lang,
      type: "contact_info",
      actions: [
        { label: "📞 Call Store", action: "call_store" },
        { label: "🗺️ Get Directions", action: "open_maps", payload: siteSettings.google_maps_link },
        { label: "💬 Chat on WhatsApp", action: "open_whatsapp" },
      ],
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text: "How else can I assist your tech shopping today?",
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

      // Check specific models
      if (q.includes("iphone 15") && name.includes("iphone 15")) return true;
      if (q.includes("iphone 14") && name.includes("iphone 14")) return true;
      if (q.includes("iphone 13") && name.includes("iphone 13")) return true;
      if (q.includes("s24") && (name.includes("s24") || name.includes("galaxy s24"))) return true;
      if (q.includes("s23") && (name.includes("s23") || name.includes("galaxy s23"))) return true;
      if (q.includes("redmi") && (name.includes("redmi") || name.includes("note"))) return true;
      if (q.includes("pixel") && name.includes("pixel")) return true;
      if (q.includes("airpods") && (name.includes("airpods") || cat.includes("audio"))) return true;
      if (q.includes("watch") && (name.includes("watch") || cat.includes("watch"))) return true;

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
    colors: p.colors || [],
    storage_options: p.storage_options || [],
    specifications: p.specifications || {},
    brand_name: p.brand_name,
    warranty: p.warranty || "1 Year Genuine Company Warranty",
    stock_status: p.stock_status || "in_stock",
    category_name: p.category_name,
    installment_price: `Rs. ${Math.round(p.price / 3).toLocaleString()} / mo (x3)`,
  };
}
