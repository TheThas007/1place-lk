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
import { detectWritingStyle, getBaseLanguage, WritingStyle } from "@/lib/assistant/language-detector";
import {
  parseUserQuery,
  scoreProductForUsage,
  toProductSummary,
  generateProductComparison,
  extractBudget,
} from "@/lib/assistant/assistant-rag";

interface ChatRequestBody {
  message: string;
  language?: AssistantLanguage;
  sessionId: string;
  history?: { sender: string; text: string }[];
  currentProductSlug?: string;
  action?: string;
  payload?: any;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json();
    const {
      message = "",
      language = "en",
      sessionId,
      history = [],
      currentProductSlug,
      action,
      payload,
    } = body;

    const cleanMsg = (message || "").trim();
    const style: WritingStyle = detectWritingStyle(cleanMsg, language);
    const baseLang: AssistantLanguage = getBaseLanguage(style);

    // 1. Fetch live products from Firestore for 100% accurate, live catalog knowledge
    let allProducts: Product[] = [];
    try {
      const snap = await getDocs(collection(db, "products"));
      allProducts = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
    } catch (e) {
      console.warn("Error fetching products for assistant:", e);
    }

    // 2. Identify currently viewed product if user is on product page
    let currentProduct: Product | null = null;
    if (currentProductSlug) {
      currentProduct =
        allProducts.find((p) => p.slug === currentProductSlug || p.id === currentProductSlug) || null;
    }

    // ── Action Trigger Handlers ──
    if (action) {
      const responseMsg = await handleActionTrigger(action, payload, style, allProducts, currentProduct);
      return NextResponse.json({ message: responseMsg });
    }

    // ── Order Tracking Intent (with privacy phone check) ──
    const orderMatch = cleanMsg.match(/(?:SM-|\b)([A-Za-z0-9]{6,20})/i);
    const phoneMatch = cleanMsg.match(/(?:0|\+?94)?7[0-9]{8}/);

    if (
      cleanMsg.toLowerCase().includes("track") ||
      cleanMsg.toLowerCase().includes("order status") ||
      cleanMsg.toLowerCase().includes("where is my order") ||
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
              style === "ta"
                ? `உங்கள் Order #${foundOrder.id.slice(0, 8).toUpperCase()} விவரங்கள் உறுதிப்படுத்தப்பட்டன:`
                : style === "thanglish"
                ? `Unga Order #${foundOrder.id.slice(0, 8).toUpperCase()} details verify aagiduchu:`
                : style === "si" || style === "singlish"
                ? `ඔබගේ Order #${foundOrder.id.slice(0, 8).toUpperCase()} විස්තර තහවුරු විය:`
                : `Verified details for Order #${foundOrder.id.slice(0, 8).toUpperCase()}:`;

            const resMsg: AssistantMessage = {
              id: `msg-${Date.now()}`,
              sender: "assistant",
              text: replyText,
              timestamp: new Date().toISOString(),
              language: baseLang,
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
              style === "ta"
                ? `பாதுகாப்பு காரணங்களுக்காக, தயவுசெய்து உங்கள் Order-ல் வழங்கிய 10-இலக்க Mobile Number-ஐ உள்ளிடவும் (e.g. 077 123 4567).`
                : style === "thanglish"
                ? `Security reason-kaga, unga order-oda 10-digit mobile number-a type pannunga (e.g. 077 123 4567).`
                : style === "si" || style === "singlish"
                ? `ආරක්ෂක හේතූන් මත, කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න (e.g. 077 123 4567).`
                : `For your security, please provide the 10-digit phone number associated with Order #${potentialId.slice(0, 8)}.`;

            const resMsg: AssistantMessage = {
              id: `msg-${Date.now()}`,
              sender: "assistant",
              text: verifyPrompt,
              timestamp: new Date().toISOString(),
              language: baseLang,
              type: "text",
            };
            return NextResponse.json({ message: resMsg });
          }
        }
      }
    }

    // ── Parse User Query Intent & Entities ──
    const parsedIntent = parseUserQuery(cleanMsg, style, {
      currentProduct,
    });

    // ── Intent 1: Head-to-Head Product Comparison (e.g. "iPhone 16 vs S25", "iPhone or Samsung ethu best") ──
    if (parsedIntent.intent === "compare_products") {
      const candidates = findComparisonCandidates(cleanMsg, allProducts);
      if (candidates.length >= 2) {
        const comp = generateProductComparison(candidates[0], candidates[1], style);
        const resMsg: AssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: comp.text,
          timestamp: new Date().toISOString(),
          language: baseLang,
          type: "comparison",
          comparisonProducts: comp.products,
          products: comp.products,
        };
        return NextResponse.json({ message: resMsg });
      }
    }

    // ── Intent 2: Broad Request without Budget/Usage (Clarification Follow-Up) ──
    if (parsedIntent.needsClarification) {
      const clarifyText =
        style === "thanglish"
          ? `Sure 👍 Ungaluku best phone suggest panren!

1. Unga **Budget range** evlo? (e.g. *50k, 100k, 1.5 lakh*)
2. Enna main usage-kaga vaanga poreenga?
   • 🎮 Gaming
   • 📸 Camera & Reels
   • 🔋 Battery Life
   • 📱 Daily Normal Use`
          : style === "ta"
          ? `நிச்சயமாக 👍 உங்களுக்கு ஏற்ற சிறந்த போனை பரிந்துரைக்கிறேன்!

1. உங்கள் **பட்ஜெட் (Budget)** எவ்வளவு? (e.g. *50,000, 100,000, 1.5 லட்சம்*)
2. எதற்காக முதன்மையாக வாங்கப் போகிறீர்கள்?
   • 🎮 Gaming
   • 📸 Camera & Photography
   • 🔋 Battery Life
   • 📱 Daily Use`
          : style === "si" || style === "singlish"
          ? `හොඳම phone එකක් තෝරාගැනීමට මම උදවු කරන්නම්!
1. ඔබගේ **Budget එක** කීයද? (e.g. *100,000*)
2. ප්‍රධාන අවශ්‍යතාවය කුමක්ද? (Gaming / Camera / Battery / Daily use)`
          : `I'd love to find the best phone for you!

1. What is your approximate **budget**? (e.g. *100k, 150k, 250k LKR*)
2. What is your primary priority?
   • 🎮 Gaming & Performance
   • 📸 Camera & Content Creation
   • 🔋 Battery Endurance
   • 📱 Daily All-Round Use`;

      const resMsg: AssistantMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: clarifyText,
        timestamp: new Date().toISOString(),
        language: baseLang,
        type: "quick_actions",
        actions: [
          { label: "💰 Under 100k", action: "budget_100k" },
          { label: "💰 Under 150k", action: "budget_150k" },
          { label: "🎮 Gaming Phone", action: "find_gaming" },
          { label: "📸 Best Camera Phone", action: "find_camera" },
        ],
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Intent 3: Budget-Based or Priority-Based Recommendation ──
    if (parsedIntent.intent === "budget_recommend" || parsedIntent.budget || parsedIntent.usagePriority) {
      const budgetMax = parsedIntent.budget?.max;
      const budgetMin = parsedIntent.budget?.min || 0;
      const usage = parsedIntent.usagePriority || "daily_use";

      // Filter products by category and budget
      const candidates = allProducts.filter((p) => {
        const price = p.sale_price && p.sale_price > 0 ? p.sale_price : p.price;
        if (budgetMax && (price > budgetMax * 1.15 || price < budgetMin)) return false;
        if (parsedIntent.brandPreference) {
          const b = (p.brand_name || p.brand || "").toLowerCase();
          if (!b.includes(parsedIntent.brandPreference.toLowerCase())) return false;
        }
        return true;
      });

      // Score candidates
      const scored = candidates
        .map((p) => ({ product: p, score: scoreProductForUsage(p, usage, budgetMax) }))
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0) {
        const topPick = scored[0].product;
        const topPickPrice = topPick.sale_price && topPick.sale_price > 0 ? topPick.sale_price : topPick.price;
        const alternatives = scored.slice(1, 4).map((s) => s.product);

        const specsSnippet = Object.entries(topPick.specifications || {})
          .slice(0, 3)
          .map(([k, v]) => `• **${k}**: ${v}`)
          .join("\n");

        let responseText = "";
        const budgetFormatted = budgetMax ? formatPrice(budgetMax) : "உங்கள் தேவைக்கு";

        if (style === "thanglish") {
          responseText = `🎯 **${budgetFormatted}-kulla Streetla-vin Top Recommendation:**

🥇 **${topPick.name}**
💰 **Price**: ${formatPrice(topPickPrice)}${topPick.old_price ? ` (Old Price: ~~${formatPrice(topPick.old_price)}~~)` : ""}
• **Stock**: ${topPick.stock_status === "in_stock" ? "✅ In Stock" : "⚠️ Limited Stock"}
• **Warranty**: ${topPick.warranty || "1 Year Company Warranty"}
${specsSnippet ? `\n🔍 **Key Features:**\n${specsSnippet}\n` : ""}
⭐ **Why I Recommend It:**
• ${usage === "gaming" ? "Gaming-ku strong processor & smooth display" : usage === "camera" ? "Sharp photos & high quality video recording" : "Super battery life & smooth daily performance"}
• Installment: Koko / Mintpay moolam maatham **${formatPrice(Math.round(topPickPrice / 3))}** (3 installments)

${alternatives.length > 0 ? `🥈 **Other Great Alternatives:**\n${alternatives.map((a) => `• **${a.name}** — ${formatPrice(a.sale_price || a.price)}`).join("\n")}\n\nIthula ethavathu details paka virumbureengala?` : ""}`;
        } else if (style === "ta") {
          responseText = `🎯 **${budgetFormatted}-க்குள் Streetla-வின் முதன்மை பரிந்துரை:**

🥇 **${topPick.name}**
💰 **விலை**: ${formatPrice(topPickPrice)}${topPick.old_price ? ` (முந்தைய விலை: ~~${formatPrice(topPick.old_price)}~~)` : ""}
• **Stock**: ${topPick.stock_status === "in_stock" ? "✅ In Stock" : "⚠️ Limited Stock"}
• **Warranty**: ${topPick.warranty || "1 வருட உத்தியோகபூர்வ Warranty"}
${specsSnippet ? `\n🔍 **சிறப்பம்சங்கள்:**\n${specsSnippet}\n` : ""}
⭐ **பரிந்துரைக்கான காரணம்:**
• ${usage === "gaming" ? "Gaming-க்கு சக்திவாய்ந்த Processor மற்றும் அதிக Refresh Rate" : usage === "camera" ? "தெளிவான Camera மற்றும் சிறந்த Video தரம்" : "நீண்ட நேர Battery மற்றும் சீரான அன்றாட பயன்பாடு"}
• **Installment**: Koko / Mintpay மூலம் மாதம் **${formatPrice(Math.round(topPickPrice / 3))}** (3 தவணைகள்)

${alternatives.length > 0 ? `🥈 **மாற்று சிறந்த தெரிவுகள்:**\n${alternatives.map((a) => `• **${a.name}** — ${formatPrice(a.sale_price || a.price)}`).join("\n")}` : ""}`;
        } else if (style === "si" || style === "singlish") {
          responseText = `🎯 **ඔබගේ Budget (${budgetFormatted}) සඳහා හොඳම නිර්දේශය:**

🥇 **${topPick.name}**
💰 **මිල**: ${formatPrice(topPickPrice)}
• **තොග තත්ත්වය**: ${topPick.stock_status === "in_stock" ? "✅ තොග ඇත" : "⚠️ සීමිත තොග"}
• **වගකීම**: ${topPick.warranty || "වසරක වගකීම"}
${specsSnippet ? `\n${specsSnippet}\n` : ""}
${alternatives.length > 0 ? `🥈 **වෙනත් හොඳම විකල්ප:**\n${alternatives.map((a) => `• **${a.name}** — ${formatPrice(a.sale_price || a.price)}`).join("\n")}` : ""}`;
        } else {
          responseText = `🎯 **Top Recommendation within ${budgetFormatted}:**

🥇 **${topPick.name}**
💰 **Price**: ${formatPrice(topPickPrice)}${topPick.old_price ? ` (Was: ~~${formatPrice(topPick.old_price)}~~)` : ""}
• **Stock**: ${topPick.stock_status === "in_stock" ? "✅ In Stock in Vavuniya" : "⚠️ Limited Stock"}
• **Warranty**: ${topPick.warranty || "1-Year Genuine Company Warranty"}
${specsSnippet ? `\n🔍 **Key Specs:**\n${specsSnippet}\n` : ""}
⭐ **Why it stands out:**
• ${usage === "gaming" ? "Flagship-tier processor, high touch-sampling rate, and great cooling" : usage === "camera" ? "Superior sensor stabilization, crisp low-light photos, and 4K video" : "Exceptional battery life, durable build, and long software support"}
• **Installments**: Pay 3x **${formatPrice(Math.round(topPickPrice / 3))} / month** interest-free with Koko or Mintpay

${alternatives.length > 0 ? `🥈 **Great Alternatives in this Range:**\n${alternatives.map((a) => `• **${a.name}** — ${formatPrice(a.sale_price || a.price)}`).join("\n")}` : ""}`;
        }

        const productCards = [topPick, ...alternatives].slice(0, 4).map(toProductSummary);

        const resMsg: AssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: responseText,
          timestamp: new Date().toISOString(),
          language: baseLang,
          type: "product_list",
          products: productCards,
        };
        return NextResponse.json({ message: resMsg });
      }
    }

    // ── Intent 4: Accessories & Compatibility (e.g. "I bought iPhone, need charger", "tempered glass for S24") ──
    if (parsedIntent.intent === "accessory_recommend" || cleanMsg.includes("charger") || cleanMsg.includes("case") || cleanMsg.includes("tempered")) {
      const targetDevice = currentProduct?.name || parsedIntent.brandPreference || "your device";
      const accessories = allProducts.filter((p) => {
        const cat = (p.category_name || "").toLowerCase();
        const pType = (p.productType || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return (
          cat.includes("charger") ||
          cat.includes("adapter") ||
          cat.includes("cable") ||
          cat.includes("case") ||
          cat.includes("protector") ||
          cat.includes("audio") ||
          cat.includes("earbud") ||
          pType === "accessory" ||
          name.includes("charger") ||
          name.includes("adapter") ||
          name.includes("airpod")
        );
      });

      const matchedAccessories = accessories.slice(0, 4);

      if (matchedAccessories.length > 0) {
        const accText =
          style === "thanglish"
            ? `🔌 **${targetDevice}-kaga Street Mobile-la available-a irukkura compatible accessories:**

• **Fast Chargers & Adapters**: Apple 20W USB-C, Anker Fast Chargers, Baseus GaN Adapters.
• **Protection**: Premium Shockproof Cases & 9H Tempered Glass.
• **Audio & Power**: Original AirPods, TWS Earbuds & High-Capacity Power Banks.

Keezha irukkura products-a neenga direct-a view panni cart-la add pannikalam 👇`
            : style === "ta"
            ? `🔌 **${targetDevice}-க்கு ஏற்ற 100% Genuine Accessories:**

• **Fast Chargers**: Apple 20W Power Adapter, Anker மற்றும் Baseus Fast Chargers.
• **Protection**: Shockproof Cases மற்றும் 9H Tempered Glass.
• **Audio & Power**: AirPods, TWS Earbuds மற்றும் Power Banks.`
            : style === "si" || style === "singlish"
            ? `🔌 **${targetDevice} සඳහා ගැලපෙන Original Accessories:**
• Fast Chargers, Cases, Tempered Glass සහ Earbuds පහතින් තෝරාගත හැක 👇`
            : `🔌 **Compatible Genuine Accessories for ${targetDevice}:**

• **Fast Chargers**: Apple 20W USB-C Power Adapter, Anker 20W/30W Fast Chargers, Baseus GaN Adapters.
• **Protection**: Premium Drop-Tested Shockproof Cases & Full-Cover 9H Tempered Glass.
• **Power & Audio**: Magnetic Wireless Power Banks & True Wireless Earbuds.

You can inspect or add them directly to your cart below 👇`;

        const resMsg: AssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: "assistant",
          text: accText,
          timestamp: new Date().toISOString(),
          language: baseLang,
          type: "product_list",
          products: matchedAccessories.map(toProductSummary),
        };
        return NextResponse.json({ message: resMsg });
      }
    }

    // ── Intent 5: Specific Product Spec/Price Lookup ──
    const searchMatches = findMatchingProducts(cleanMsg, allProducts, 4);
    if (searchMatches.length > 0) {
      const p = searchMatches[0];
      const effPrice = p.sale_price && p.sale_price > 0 ? p.sale_price : p.price;
      const stockText =
        p.stock_status === "in_stock"
          ? "✅ In Stock in Vavuniya Showroom"
          : p.stock_status === "low_stock"
          ? "⚠️ Limited Stock Available"
          : "📦 Available on Request / Pre-Order";

      const installment = Math.round(effPrice / 3);

      const introText =
        style === "thanglish"
          ? `📱 **${p.name}**

• **Price**: ${formatPrice(effPrice)}${p.old_price ? ` (Old: ~~${formatPrice(p.old_price)}~~)` : ""}
• **Stock**: ${stockText}
• **Installment**: Koko / Mintpay moolam maatham **${formatPrice(installment)}** (3 interest-free installments)
• **Warranty**: ${p.warranty || "1 Year Company Warranty"}
• **Available Colors**: ${(p.colors || []).join(", ") || "Original Finishes"}

Itha direct-a cart-la add panna or view panna keezha ulla card-a use pannalam 👇`
          : style === "ta"
          ? `📱 **${p.name}**

• **விலை**: ${formatPrice(effPrice)}${p.old_price ? ` (முந்தைய விலை: ~~${formatPrice(p.old_price)}~~)` : ""}
• **Stock**: ${stockText}
• **Installment**: Koko / Mintpay மூலம் மாதம் **${formatPrice(installment)}** (3 தவணைகளில்)
• **Warranty**: ${p.warranty || "1 வருட Genuine Company Warranty"}
• **வண்ணங்கள்**: ${(p.colors || []).join(", ") || "Original Colors"}`
          : style === "si" || style === "singlish"
          ? `📱 **${p.name}**

• **මිල**: ${formatPrice(effPrice)}
• **තොග තත්ත්වය**: ${stockText}
• **වාරික ගෙවීම්**: මසකට **${formatPrice(installment)}** බැගින් (Koko / Mintpay)`
          : `📱 **${p.name}**

• **Price**: ${formatPrice(effPrice)}${p.old_price ? ` (Was: ~~${formatPrice(p.old_price)}~~)` : ""}
• **Stock Status**: ${stockText}
• **Installments**: Pay 3x **${formatPrice(installment)} / month** interest-free via Koko / Mintpay
• **Warranty**: ${p.warranty || "1-Year Official Company Warranty"}
• **Available Colors**: ${(p.colors || []).join(", ") || "Standard Genuine Finishes"}`;

      const resMsg: AssistantMessage = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: introText,
        timestamp: new Date().toISOString(),
        language: baseLang,
        type: "product_list",
        products: searchMatches.map(toProductSummary),
      };
      return NextResponse.json({ message: resMsg });
    }

    // ── Default Friendly Welcome / Fallback ──
    const fallbackText =
      style === "thanglish"
        ? `Vanakkam! Naan **Streetla** 👋 Street Mobile-oda Smart AI Shopping Assistant.

Ungaluku epdi help panna mudiyum?
• 💰 **Budget Recommendations**: "100k budget kulla best phone enna?"
• 🎮 **Gaming & Camera**: "Gaming-ku suitable phone sollunga"
• ⚖️ **Comparison**: "iPhone 16 vs Galaxy S25 ethu best?"
• 🔌 **Accessories**: "iPhone-kaga fast charger venum"

Keezha irukkura buttons-a click pannalam or unga questions-a type pannunga!`
        : style === "ta"
        ? `வணக்கம்! நான் **Streetla** 👋 Street Mobile-ன் Smart AI Shopping Assistant.

நான் உங்களுக்கு உதவ முடியும்:
• 💰 **பட்ஜெட் பரிந்துரை**: "100k-க்குள் சிறந்த Phone எது?"
• 🎮 **கேமிங் & கேமரா**: "Gaming-க்கு ஏற்ற சிறந்த போன் சொல்லுங்கள்"
• ⚖️ **ஒப்பீடு**: "iPhone 16 vs Galaxy S25 எது சிறந்தது?"
• 🔌 **பாகங்கள்**: "Fast Charger & Accessories விவரங்கள்"

கீழ்வரும் button-களில் ஒன்றைத் தேர்வு செய்யலாம் அல்லது உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்:`
        : style === "si" || style === "singlish"
        ? `ආයුබෝවන්! මම **Streetla** 👋 Street Mobile AI සහයකයා.
දුරකථන නිර්දේශ, මිල ගණන්, සංසන්දනය සහ Accessories පිළිබඳව මගෙන් විමසන්න.`
        : `Hi! I’m **Streetla** 👋 your personal AI Shopping Assistant at **Street Mobile**.

How can I help you today?
• 💰 **Budget Advice**: "Best phone under 100,000 LKR"
• 🎮 **Gaming & Camera**: "Recommend a top gaming phone"
• ⚖️ **Head-to-Head Comparison**: "iPhone 16 vs Galaxy S25"
• 🔌 **Accessories**: "What charger is best for iPhone 16 Pro?"

Pick a quick option below or type your question!`;

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toISOString(),
        language: baseLang,
        type: "quick_actions",
        actions: [
          { label: "📱 Find a Phone", action: "start_find_phone" },
          { label: "💰 Budget Phones", action: "budget_100k" },
          { label: "🎮 Gaming Phones", action: "find_gaming" },
          { label: "📸 Best Camera Phones", action: "find_camera" },
          { label: "⚖️ Compare Flagships", action: "compare_flagships" },
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

// ── Action Trigger Helper ──
async function handleActionTrigger(
  action: string,
  payload: any,
  style: WritingStyle,
  allProducts: Product[],
  currentProduct: Product | null
): Promise<AssistantMessage> {
  const baseLang = getBaseLanguage(style);

  if (action === "budget_100k" || action === "budget_150k") {
    const max = action === "budget_100k" ? 100000 : 150000;
    const candidates = allProducts
      .filter((p) => {
        const price = p.sale_price || p.price;
        return price <= max && (p.category_name?.toLowerCase().includes("phone") || p.brand_name);
      })
      .sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price))
      .slice(0, 4);

    const text =
      style === "thanglish"
        ? `🎯 **${formatPrice(max)}-kulla Top Rated Phones:**`
        : style === "ta"
        ? `🎯 **${formatPrice(max)}-க்குள் சிறந்த Phones:**`
        : `🎯 **Top Rated Smartphones under ${formatPrice(max)}:**`;

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: new Date().toISOString(),
      language: baseLang,
      type: "product_list",
      products: candidates.map(toProductSummary),
    };
  }

  if (action === "find_gaming" || action === "find_camera") {
    const usage = action === "find_gaming" ? "gaming" : "camera";
    const candidates = allProducts
      .map((p) => ({ product: p, score: scoreProductForUsage(p, usage) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.product);

    const text =
      style === "thanglish"
        ? `🎮 **Top ${usage === "gaming" ? "Gaming" : "Camera"} Phones in Stock:**`
        : style === "ta"
        ? `📸 **சிறந்த ${usage === "gaming" ? "Gaming" : "Camera"} போன்கள்:**`
        : `🏆 **Top ${usage === "gaming" ? "Gaming Performance" : "Pro Camera"} Phones:**`;

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: new Date().toISOString(),
      language: baseLang,
      type: "product_list",
      products: candidates.map(toProductSummary),
    };
  }

  if (action === "compare_flagships") {
    const p1 = allProducts.find((p) => p.name.toLowerCase().includes("iphone 16") || p.name.toLowerCase().includes("iphone 15"));
    const p2 = allProducts.find((p) => p.name.toLowerCase().includes("s25") || p.name.toLowerCase().includes("s24"));
    if (p1 && p2) {
      const comp = generateProductComparison(p1, p2, style);
      return {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: comp.text,
        timestamp: new Date().toISOString(),
        language: baseLang,
        type: "comparison",
        comparisonProducts: comp.products,
        products: comp.products,
      };
    }
  }

  // Fallback text
  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text: "How else can I assist your shopping today?",
    timestamp: new Date().toISOString(),
    language: baseLang,
    type: "text",
  };
}

// ── Comparison Candidates Finder ──
function findComparisonCandidates(text: string, products: Product[]): Product[] {
  const clean = text.toLowerCase();
  const matched: Product[] = [];

  // Try finding iPhone and Samsung if mentioned
  if (clean.includes("iphone") && clean.includes("samsung")) {
    const iphone = products.find((p) => p.name.toLowerCase().includes("iphone"));
    const samsung = products.find((p) => p.name.toLowerCase().includes("samsung") || p.name.toLowerCase().includes("galaxy"));
    if (iphone && samsung) {
      matched.push(iphone, samsung);
      return matched;
    }
  }

  // General matching for "X vs Y"
  const parts = clean.split(/\bvs\.?\b|\bcompare\b|\bor\b/i);
  if (parts.length >= 2) {
    for (const part of parts) {
      const term = part.trim();
      if (term.length >= 3) {
        const found = products.find((p) => p.name.toLowerCase().includes(term) || (p.tags || []).some((t) => t.toLowerCase().includes(term)));
        if (found && !matched.some((m) => m.id === found.id)) {
          matched.push(found);
        }
      }
    }
  }

  if (matched.length >= 2) return matched.slice(0, 2);

  // Fallback: search products in text
  for (const p of products) {
    const name = p.name.toLowerCase();
    if (clean.includes(name) || (name.length > 8 && clean.includes(name.slice(0, 10)))) {
      if (!matched.some((m) => m.id === p.id)) {
        matched.push(p);
      }
    }
  }

  return matched.slice(0, 2);
}

// ── General Matching Helper ──
function findMatchingProducts(text: string, products: Product[], max = 4): Product[] {
  const clean = text.toLowerCase();
  const tokens = clean.split(/\s+/).filter((t) => t.length >= 2);

  const scored = products.map((p) => {
    let score = 0;
    const name = (p.name || "").toLowerCase();
    const brand = (p.brand_name || p.brand || "").toLowerCase();
    const cat = (p.category_name || "").toLowerCase();
    const tags = (p.tags || []).join(" ").toLowerCase();

    for (const t of tokens) {
      if (name.includes(t)) score += 10;
      if (brand.includes(t)) score += 8;
      if (cat.includes(t)) score += 6;
      if (tags.includes(t)) score += 5;
    }

    return { product: p, score };
  });

  return scored
    .filter((s) => s.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((s) => s.product);
}
