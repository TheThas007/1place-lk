import { SpinPromotionSettings } from "@/lib/types";

export const DEFAULT_SPIN_SETTINGS: SpinPromotionSettings = {
  enabled: true,
  popupEnabled: true,
  heading: "YOUR FIRST ORDER DESERVES A GIFT!",
  badgeText: "FIRST ORDER SPECIAL",
  description: "Place your first order and unlock your chance to WIN A FREE GIFT!",
  minOrderAmount: 1000,
  maxSpinsPerCustomer: 1,
  rewardExpiryDays: 7,
  termsAndConditions: 
`• Exclusive to new customers on their first qualifying order.
• Physical free gifts require at least one eligible regular item in your order.
• Maximum 1 spin reward per customer.
• Free gift will be automatically added to your cart at LKR 0.
• Standalone free gift orders are strictly prohibited.
• Unredeemed spin rewards expire after 7 days.
• Subject to product stock and inventory availability.`,
  segments: [
    {
      id: "seg_gift_box",
      label: "FREE GIFT BOX",
      subLabel: "Special Mystery Box",
      type: "gift",
      color: "#D90429", // Red
      textColor: "#FFFFFF",
      icon: "gift",
      productId: "",
      productName: "1PLACE Premium Mystery Gift Box",
      productImage: "/assets/promo/gift-box.png",
      probability: 25,
      inventory: 50,
      claimedCount: 0,
    },
    {
      id: "seg_free_shipping",
      label: "FREE SHIPPING",
      subLabel: "Islandwide Delivery",
      type: "free_shipping",
      color: "#FFFFFF", // White
      textColor: "#111111",
      icon: "truck",
      probability: 25,
      inventory: 100,
      claimedCount: 0,
    },
    {
      id: "seg_earbuds",
      label: "FREE EARBUDS",
      subLabel: "True Wireless Stereo",
      type: "gift",
      color: "#64152F", // Burgundy
      textColor: "#FFFFFF",
      icon: "headphones",
      productId: "",
      productName: "TWS Wireless Earbuds",
      probability: 15,
      inventory: 30,
      claimedCount: 0,
    },
    {
      id: "seg_charger",
      label: "FREE CHARGER",
      subLabel: "Fast Power Adapter",
      type: "gift",
      color: "#F5F5F5", // Light grey
      textColor: "#111111",
      icon: "zap",
      productId: "",
      productName: "20W USB-C Fast Charger",
      probability: 15,
      inventory: 30,
      claimedCount: 0,
    },
    {
      id: "seg_accessories",
      label: "FREE ACCESSORIES",
      subLabel: "Premium Mobile Kit",
      type: "gift",
      color: "#64152F", // Burgundy
      textColor: "#F59E0B", // Gold
      icon: "gift",
      productId: "",
      productName: "Universal Phone Stand & Cable",
      probability: 10,
      inventory: 25,
      claimedCount: 0,
    },
    {
      id: "seg_discount",
      label: "10% DISCOUNT",
      subLabel: "On First Checkout",
      type: "discount",
      color: "#111111", // Black
      textColor: "#F59E0B", // Gold
      icon: "tag",
      discountPercent: 10,
      probability: 10,
      inventory: 50,
      claimedCount: 0,
    },
  ],
};
