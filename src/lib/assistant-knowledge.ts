import { AssistantSettings, AssistantFAQ, AssistantLanguage } from "./types";
import { siteSettings } from "./data";

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  enabled: true,
  assistant_name: "Streetla",
  assistant_subtitle: "Your StreetMobile Shopping Assistant",
  avatar_url: "/streetla.png",
  tooltip_text: "Hi, I’m Streetla 👋 Need help?",
  welcome_message_en:
    "Hi! I’m Streetla 👋\nI can help you find the right device, compare products, check prices and stock, track orders, and answer warranty questions. How can I help you today?",
  welcome_message_ta:
    "வணக்கம்! நான் Streetla 👋\nஉங்களுக்கு ஏற்ற phone-ஐ தெரிவு செய்ய, விலை & stock பார்க்க, order track செய்ய மற்றும் warranty விவரங்களை அறிய நான் உதவுகிறேன். இன்று உங்களுக்கு எப்படி உதவ முடியும்?",
  welcome_message_si:
    "ආයුබෝවන්! මම Streetla 👋\nඔබට සුදුසුම දුරකථනය තෝරාගැනීමට, මිල ගණන් පරීක්ෂා කිරීමට, Order Track කිරීමට සහ වගකීම් විස්තර ලබාගැනීමට මට උදවු කළ හැක. අද ඔබට උදවු කරන්නේ කෙසේද?",
  supported_languages: ["en", "ta", "si"],
  business_hours: "Monday – Saturday: 9:00 AM – 9:00 PM | Sunday: 10:00 AM – 6:00 PM",
  offline_message:
    "Our showroom team is currently offline. You can leave your details or message us on WhatsApp, and our team will contact you during business hours.",
  phone: siteSettings.phone,
  whatsapp: siteSettings.whatsapp,
  email: siteSettings.email,
  address: siteSettings.address,
  rate_limit_per_minute: 20,
  retention_days: 60,
};

export const ASSISTANT_QUICK_ACTIONS: Record<
  AssistantLanguage,
  { id: string; label: string; icon: string; action: string; payload?: Record<string, unknown> | string | number | boolean | null }[]
> = {
  en: [
    { id: "find_phone", label: "Find a Phone", icon: "Smartphone", action: "start_find_phone" },
    { id: "compare", label: "Compare Products", icon: "Scale", action: "start_compare" },
    { id: "check_stock", label: "Check Price & Stock", icon: "Tag", action: "check_stock" },
    { id: "track_order", label: "Track My Order", icon: "Package", action: "start_track_order" },
    { id: "repairs_warranty", label: "Repairs & Warranty", icon: "Wrench", action: "repairs_info" },
    { id: "store_location", label: "Store Location", icon: "MapPin", action: "store_info" },
    { id: "human_support", label: "Talk to a Human", icon: "Headphones", action: "human_support" },
  ],
  ta: [
    { id: "find_phone", label: "போன் தெரிவு செய்ய", icon: "Smartphone", action: "start_find_phone" },
    { id: "compare", label: "Phone ஒப்பீடு செய்ய", icon: "Scale", action: "start_compare" },
    { id: "check_stock", label: "விலை & Stock அறிய", icon: "Tag", action: "check_stock" },
    { id: "track_order", label: "Order Track செய்ய", icon: "Package", action: "start_track_order" },
    { id: "repairs_warranty", label: "Repair & Warranty", icon: "Wrench", action: "repairs_info" },
    { id: "store_location", label: "கடை முகவரி", icon: "MapPin", action: "store_info" },
    { id: "human_support", label: "நேரடி உதவி (Human)", icon: "Headphones", action: "human_support" },
  ],
  si: [
    { id: "find_phone", label: "දුරකථන සොයන්න", icon: "Smartphone", action: "start_find_phone" },
    { id: "compare", label: "සංසන්දනය කරන්න", icon: "Scale", action: "start_compare" },
    { id: "check_stock", label: "මිල සහ තොග", icon: "Tag", action: "check_stock" },
    { id: "track_order", label: "Order පරීක්ෂා කරන්න", icon: "Package", action: "start_track_order" },
    { id: "repairs_warranty", label: "අලුත්වැඩියා & වගකීම්", icon: "Wrench", action: "repairs_info" },
    { id: "store_location", label: "ශාඛා පිහිටීම", icon: "MapPin", action: "store_info" },
    { id: "human_support", label: "සහය ලබාගන්න", icon: "Headphones", action: "human_support" },
  ],
};

export const DEFAULT_FAQS: AssistantFAQ[] = [
  {
    id: "faq-warranty",
    category: "warranty",
    question_en: "What warranty do you offer on smartphones?",
    answer_en:
      "All our Apple, Samsung, and Xiaomi smartphones come with 100% Genuine Official Company Warranty or 1-Year Hardware & Software Warranty backed by Street Mobile certified repair lab.",
    question_ta:
      "Smartphones-க்கு என்ன warranty வழங்குகிறீர்கள்?",
    answer_ta:
      "எங்கள் அனைத்து Apple, Samsung மற்றும் Xiaomi போன்களும் 100% Genuine Official Company Warranty அல்லது 1 வருட Hardware & Software Warranty-உடன் Street Mobile-ல் வழங்கப்படுகின்றன.",
    question_si:
      "Smartphones සඳහා ලබාදෙන වගකීම කුමක්ද?",
    answer_si:
      "අපගේ සියලුම Apple, Samsung සහ Xiaomi දුරකථන සඳහා වසරක නිල වගකීමක් සහ Street Mobile අලුත්වැඩියා සහතිකය හිමිවේ.",
    order: 1,
  },
  {
    id: "faq-repairs",
    category: "repairs",
    question_en: "Do you offer display and battery replacement in Vavuniya?",
    answer_en:
      "Yes! We offer Express Screen & Battery Replacement in our Vavuniya showroom lab using 100% genuine Grade-A parts with warranty. Most repairs are completed within 1–2 hours.",
    question_ta:
      "வவுனியாவில் Screen மற்றும் Battery மாற்றித் தருவீர்களா?",
    answer_ta:
      "ஆம்! எங்கள் வவுனியா showroom lab-ல் 100% Genuine தரமான பாகங்களுடன் 1–2 மணித்தியாலங்களில் Express Screen & Battery Replacement செய்து தரப்படும்.",
    question_si:
      "Screen සහ Battery මාරු කිරීම සිදුකරන්නේද?",
    answer_si:
      "ඔව්! අපගේ වවුනියාව ශාඛාවෙන් පැය 1-2ක් ඇතුළත Screen සහ Battery මාරු කරගත හැක.",
    order: 2,
  },
  {
    id: "faq-delivery",
    category: "orders",
    question_en: "How long does delivery take in Sri Lanka?",
    answer_en:
      "We provide Island-wide door-to-door courier delivery within 1–3 business days. You can also choose Free Same-Day Store Pickup at our Vavuniya showroom.",
    question_ta:
      "இலங்கை முழுவதும் Delivery செய்ய எவ்வளவு நேரம் எடுக்கும்?",
    answer_ta:
      "இலங்கை முழுவதும் 1–3 வேலை நாட்களுக்குள் Courier Delivery செய்யப்படும். வவுனியா showroom-ல் அதே நாளில் Free Store Pickup-ம் பெற்றுக்கொள்ளலாம்.",
    question_si:
      "Delivery සඳහා කොපමණ කාලයක් ගතවේද?",
    answer_si:
      "දිවයින පුරා දින 1-3ක් ඇතුළත Delivery සිදුකෙරේ. වවුනියාව ශාඛාවෙන් එදිනම ලබාගත හැක.",
    order: 3,
  },
  {
    id: "faq-payment",
    category: "payment",
    question_en: "What payment methods are supported?",
    answer_en:
      "We support secure Credit / Debit Card payments (Visa, MasterCard, Amex processed securely via PayHere) and Cash on Delivery (COD) across Sri Lanka.",
    question_ta:
      "என்னென்ன Payment முறைகள் உள்ளன?",
    answer_ta:
      "Visa, MasterCard, Amex மூலமான Card Payment (PayHere Gateway) மற்றும் Cash on Delivery (COD) முறைகளில் பணம் செலுத்தலாம்.",
    question_si:
      "භාවිතා කළ හැකි Payment ක්‍රම මොනවාද?",
    answer_si:
      "Visa, MasterCard, Amex මගින් Card Payment හෝ භාණ්ඩ ලැබුණු පසු මුදල් ගෙවීමේ (COD) ක්‍රම පහසුකම් ඇත.",
    order: 4,
  },
];
