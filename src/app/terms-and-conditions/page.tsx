import { Metadata } from "next";
import PolicyPageLayout from "@/components/policies/PolicyPageLayout";
import PolicySection from "@/components/policies/PolicySection";
import { businessPolicyConfig } from "@/config/business-policy";
import Link from "next/link";
import { ShieldCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Terms & Conditions | 1PLACE.LK",
  description:
    "Official Business Terms & Conditions of 1place.lk Sri Lanka. Governs online orders, LKR currency pricing, PayHere online payments, delivery, and store operations.",
  alternates: {
    canonical: "https://www.1place.lk/terms-and-conditions",
  },
  openGraph: {
    title: "Business Terms & Conditions | 1PLACE.LK",
    description:
      "Review the official e-commerce terms, LKR pricing policy, PayHere payment terms, and delivery guidelines of 1place.lk.",
    url: "https://www.1place.lk/terms-and-conditions",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const TOC_ITEMS = [
  { id: "introduction", title: "Introduction" },
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "eligibility", title: "Customer Eligibility" },
  { id: "account-responsibilities", title: "Customer Account Responsibilities" },
  { id: "product-information", title: "Product Information" },
  { id: "product-images", title: "Product Images & Colour Differences" },
  { id: "pricing-availability", title: "Pricing & LKR Currency" },
  { id: "stock-availability", title: "Stock Availability" },
  { id: "orders-confirmation", title: "Orders & Order Confirmation" },
  { id: "cancellation-rights", title: "Right to Accept or Cancel Orders" },
  { id: "payment-methods", title: "Payment Methods Overview" },
  { id: "payhere-payments", title: "PayHere Online Payments" },
  { id: "cod-policy", title: "Cash on Delivery (COD)" },
  { id: "delivery-coverage", title: "Delivery Coverage & Estimates" },
  { id: "delivery-delays", title: "Delivery Delays & External Factors" },
  { id: "delivery-responsibility", title: "Customer Delivery Responsibilities" },
  { id: "inspection-acceptance", title: "Order Inspection & Acceptance" },
  { id: "returns-refunds", title: "Returns & Refunds Cross-Reference" },
  { id: "product-warranty", title: "Product & Warranty Conditions" },
  { id: "promotions-coupons", title: "Promotions, Discounts & Coupons" },
  { id: "usage-restrictions", title: "Website Usage Restrictions" },
  { id: "intellectual-property", title: "Intellectual Property Rights" },
  { id: "prohibited-activity", title: "Prohibited & Fraudulent Activity" },
  { id: "third-party-services", title: "Third-Party Services & Links" },
  { id: "limitation-liability", title: "Limitation of Liability" },
  { id: "governing-law", title: "Governing Law (Sri Lanka)" },
  { id: "changes-terms", title: "Changes to Terms" },
  { id: "contact-info", title: "Contact Information" },
];

export default function TermsAndConditionsPage() {
  return (
    <PolicyPageLayout
      title="Business Terms & Conditions"
      subtitle="The official terms and conditions governing online transactions, product pricing in Sri Lankan Rupees (LKR), PayHere payment processing, delivery terms, and customer rights at 1place.lk."
      badge="PayHere & Merchant Terms"
      tocItems={TOC_ITEMS}
    >
      {/* ── Core Merchant Notice Banner ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 text-xs space-y-2 text-gray-900 font-normal">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-black">
          <FileText className="w-4 h-4 text-black" />
          <span>PayHere E-Commerce Compliance Commitment</span>
        </div>
        <p className="leading-relaxed">
          Placing an order on <strong>https://www.1place.lk</strong> constitutes a binding agreement under these Terms & Conditions. Online card payments are securely processed by <strong>PayHere.lk</strong>. All prices are listed in <strong>Sri Lankan Rupees (LKR)</strong>.
        </p>
      </div>

      {/* 1. Introduction */}
      <PolicySection id="introduction" number={1} title="Introduction">
        <p>
          These Business Terms & Conditions ("Terms") govern your use of the website located at <strong>https://www.1place.lk</strong> ("Website") and all product orders, purchases, and services provided by <strong>{businessPolicyConfig.legalName}</strong> (operating as "{businessPolicyConfig.tradingName}").
        </p>
        <p>
          {businessPolicyConfig.tradingName} is a licensed technology, gadget, and lifestyle device retailer located at {businessPolicyConfig.address}, Sri Lanka.
        </p>
      </PolicySection>

      {/* 2. Acceptance of Terms */}
      <PolicySection id="acceptance" number={2} title="Acceptance of Terms">
        <p>
          By accessing our Website, browsing products, creating an account, or placing an order, you acknowledge that you have read, understood, and agreed to be bound by these Terms, as well as our <Link href="/privacy-policy" className="underline font-bold text-black">Privacy Policy</Link> and <Link href="/return-policy" className="underline font-bold text-black">Return, Refund & Warranty Policy</Link>.
        </p>
        <p>
          If you do not agree to these Terms, you must refrain from placing orders on this Website.
        </p>
      </PolicySection>

      {/* 3. Customer Eligibility */}
      <PolicySection id="eligibility" number={3} title="Customer Eligibility">
        <p>
          To purchase products from {businessPolicyConfig.tradingName}, you must be at least 18 years of age or possess legal parental/guardian consent, and have full legal capacity to enter into binding agreements in Sri Lanka.
        </p>
      </PolicySection>

      {/* 4. Customer Account Responsibilities */}
      <PolicySection id="account-responsibilities" number={4} title="Customer Account Responsibilities">
        <p>
          When creating an account on our Website, you are responsible for maintaining the confidentiality of your credentials and restricting unauthorized access to your device. You agree to accept responsibility for all activities that occur under your account.
        </p>
      </PolicySection>

      {/* 5. Product Information */}
      <PolicySection id="product-information" number={5} title="Product Information">
        <p>
          We strive to ensure that all specifications, features, warranty terms, and descriptions displayed on our Website are as accurate and up-to-date as possible. Technical specifications (such as display size, battery capacity, camera megapixels, RAM, and storage) are provided based on official manufacturer documentation.
        </p>
      </PolicySection>

      {/* 6. Product Images and Colour Differences */}
      <PolicySection id="product-images" number={6} title="Product Images & Colour Differences">
        <p>
          Product photographs displayed on our Website are for illustrative representation. While we make every effort to display product colors accurately, actual screen color rendering can vary slightly due to individual monitor calibrations, display settings, and photographic lighting conditions.
        </p>
      </PolicySection>

      {/* 7. Pricing and Availability */}
      <PolicySection id="pricing-availability" number={7} title="Pricing & LKR Currency">
        <p>
          <strong>All prices listed on https://www.1place.lk are strictly quoted in Sri Lankan Rupees (LKR).</strong>
        </p>
        <p>
          Prices include applicable local sales taxes unless otherwise stated. {businessPolicyConfig.tradingName} reserves the right to update product prices at any time without prior notice. However, once an order receives formal order confirmation, the price agreed upon at the time of checkout will remain fixed for that order.
        </p>
      </PolicySection>

      {/* 8. Stock Availability */}
      <PolicySection id="stock-availability" number={8} title="Stock Availability">
        <p>
          All product orders are subject to stock availability. While our website synchronizes inventory in real-time, high demand or simultaneous purchases may occasionally result in an item becoming out of stock before an order is processed.
        </p>
      </PolicySection>

      {/* 9. Orders and Order Confirmation */}
      <PolicySection id="orders-confirmation" number={9} title="Orders & Order Confirmation">
        <p>
          Placing an order on our Website constitutes an offer to purchase. Upon completing checkout, you will receive an automated order confirmation displaying your unique Order ID.
        </p>
        <p>
          <strong>Please note that receiving an automated order receipt does NOT constitute final acceptance of your order by {businessPolicyConfig.tradingName}.</strong> A binding contract is formed only when your order is verified and dispatched by our team.
        </p>
      </PolicySection>

      {/* 10. Right to Accept or Cancel an Order */}
      <PolicySection id="cancellation-rights" number={10} title="Right to Accept or Cancel Orders">
        <p>
          {businessPolicyConfig.tradingName} reserves the absolute right to refuse, limit, or cancel any order at our sole discretion under the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>The ordered item is unavailable or out of stock.</li>
          <li>A clear pricing, typographical, or technical error occurred in the product listing.</li>
          <li>Payment verification or security authorization fails via PayHere.</li>
          <li>Fraudulent, suspicious, or unauthorized activity is identified.</li>
          <li>The delivery address provided is incomplete, unserviceable, or incorrect.</li>
        </ul>
        <p>
          If an order is canceled after online payment has been processed via PayHere, a full refund will be issued to the original card in accordance with our <Link href="/return-policy" className="underline font-bold text-black">Return & Refund Policy</Link>.
        </p>
      </PolicySection>

      {/* 11. Payment Methods */}
      <PolicySection id="payment-methods" number={11} title="Payment Methods Overview">
        <p>
          We offer secure checkout payment options:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>PayHere Online Credit & Debit Card Payments (Visa, Mastercard, AMEX, Discover)</li>
          <li>Cash on Delivery (COD) for eligible locations across Sri Lanka</li>
          <li>Direct Bank Transfer / WhatsApp Guided Orders</li>
        </ul>
      </PolicySection>

      {/* 12. PayHere Online Payments */}
      <PolicySection id="payhere-payments" number={12} title="PayHere Online Payments">
        <p>
          Online payments are processed through <strong>PayHere.lk</strong> (PayHere Private Limited), a Central Bank-approved Sri Lankan payment gateway.
        </p>
        <p>
          When paying via PayHere, your financial transactions are encrypted under bank-grade security protocols. <strong>{businessPolicyConfig.tradingName} does NOT directly receive or store your complete card credentials.</strong> You are responsible for ensuring that your card account has sufficient funds to complete transactions.
        </p>
      </PolicySection>

      {/* 13. Cash on Delivery (COD) */}
      <PolicySection id="cod-policy" number={13} title="Cash on Delivery (COD)">
        <p>
          For orders placed via Cash on Delivery, full payment in Sri Lankan Rupees (LKR) must be handed to the courier representative upon package arrival before parcel handover. Refusing COD delivery without valid cause may result in suspension of future COD privileges.
        </p>
      </PolicySection>

      {/* 14. Delivery Coverage and Estimated Delivery */}
      <PolicySection id="delivery-coverage" number={14} title="Delivery Coverage & Estimates">
        <p>
          We provide island-wide delivery across all 25 districts in Sri Lanka.
        </p>
        <p>
          Estimated delivery times generally range from <strong>1 to 3 business days for Northern Province</strong> and <strong>2 to 5 business days for other provinces</strong>. Delivery timelines commence following order verification and dispatch.
        </p>
      </PolicySection>

      {/* 15. Delivery Delays */}
      <PolicySection id="delivery-delays" number={15} title="Delivery Delays & External Factors">
        <p>
          Delivery dates provided during checkout are estimates. {businessPolicyConfig.tradingName} is not liable for minor delivery delays caused by courier operational backlogs, severe weather conditions, public holidays, fuel shortages, or events beyond our reasonable control.
        </p>
      </PolicySection>

      {/* 16. Customer Responsibility for Correct Delivery Details */}
      <PolicySection id="delivery-responsibility" number={16} title="Customer Delivery Responsibilities">
        <p>
          Customers are responsible for providing an accurate delivery address, postal code, and active mobile phone number during checkout. Additional re-delivery fees resulting from incorrect addresses or uncontactable recipients will be charged to the customer.
        </p>
      </PolicySection>

      {/* 17. Order Inspection and Acceptance */}
      <PolicySection id="inspection-acceptance" number={17} title="Order Inspection & Acceptance">
        <p>
          Upon receiving your courier delivery, please inspect the outer packaging for signs of physical tampering. If the parcel appears severely damaged or opened, please reject the delivery and notify our team immediately at <strong>{businessPolicyConfig.phone}</strong>.
        </p>
      </PolicySection>

      {/* 18. Returns and Refunds */}
      <PolicySection id="returns-refunds" number={18} title="Returns & Refunds Cross-Reference">
        <p>
          All returns, exchanges, order cancellations, and PayHere refunds are governed by our official <Link href="/return-policy" className="underline font-bold text-black">Return, Refund & Warranty Policy</Link>, which forms an integral part of these Terms.
        </p>
      </PolicySection>

      {/* 19. Product and Warranty Conditions */}
      <PolicySection id="product-warranty" number={19} title="Product & Warranty Conditions">
        <p>
          Warranty terms applicable to each product (Manufacturer Warranty vs. Shop Warranty) are specified on individual product listings and printed on your final invoice. Warranty excludes physical damage, liquid exposure, power surges, and unauthorized repairs.
        </p>
      </PolicySection>

      {/* 20. Promotions, Discounts, and Coupon Codes */}
      <PolicySection id="promotions-coupons" number={20} title="Promotions, Discounts & Coupons">
        <p>
          Promotional discount codes, seasonal offers, and coupon codes published by {businessPolicyConfig.tradingName} are subject to specific validity periods, minimum spend requirements, and usage limits. Coupons cannot be redeemed for cash or combined with non-eligible offers.
        </p>
      </PolicySection>

      {/* 21. Website Usage Restrictions */}
      <PolicySection id="usage-restrictions" number={21} title="Website Usage Restrictions">
        <p>
          You agree to use our Website solely for lawful personal shopping purposes. You must not use our site to transmit malicious code, attempt unauthorized database access, or interfere with security controls.
        </p>
      </PolicySection>

      {/* 22. Intellectual Property */}
      <PolicySection id="intellectual-property" number={22} title="Intellectual Property Rights">
        <p>
          All content published on this Website—including logos, product graphics, UI layouts, text, code, and trademarks—is the property of {businessPolicyConfig.legalName} or its brand licensors. Unauthorized reproduction or scraping is strictly prohibited.
        </p>
      </PolicySection>

      {/* 23. Prohibited and Fraudulent Activity */}
      <PolicySection id="prohibited-activity" number={23} title="Prohibited & Fraudulent Activity">
        <p>
          Any fraudulent transactions, identity theft, credit card fraud, or false return claims will be reported immediately to law enforcement authorities in Sri Lanka, including the Cyber Crime Division.
        </p>
      </PolicySection>

      {/* 24. Third-Party Services and Links */}
      <PolicySection id="third-party-services" number={24} title="Third-Party Services & Links">
        <p>
          Our Website integrates third-party services (such as PayHere payment processing and Google Firebase data hosting). Your use of these services is subject to their respective terms and privacy policies.
        </p>
      </PolicySection>

      {/* 25. Limitation of Liability */}
      <PolicySection id="limitation-liability" number={25} title="Limitation of Liability">
        <p>
          To the maximum extent permitted under Sri Lankan law, {businessPolicyConfig.legalName} shall not be liable for indirect, incidental, or consequential damages arising from the use or inability to use our Website or products. Our total liability for any claim shall not exceed the amount paid for the specific product giving rise to the claim.
        </p>
      </PolicySection>

      {/* 26. Governing Law */}
      <PolicySection id="governing-law" number={26} title="Governing Law (Sri Lanka)">
        <p>
          These Terms & Conditions are governed by and construed in accordance with the <strong>laws of the Democratic Socialist Republic of Sri Lanka</strong>. Any legal disputes arising out of these Terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
        </p>
      </PolicySection>

      {/* 27. Changes to the Terms */}
      <PolicySection id="changes-terms" number={27} title="Changes to Terms">
        <p>
          {businessPolicyConfig.tradingName} reserves the right to amend these Terms at any time. Updated terms will be posted on this page with an updated "Last Updated" date. Continued use of our Website constitutes acceptance of revised terms.
        </p>
      </PolicySection>

      {/* 28. Contact Information */}
      <PolicySection id="contact-info" number={28} title="Contact Information">
        <p>
          For any inquiries regarding these Business Terms & Conditions, please contact us:
        </p>
        <ul className="list-none space-y-1 text-gray-800 font-semibold">
          <li><strong>Store Name:</strong> {businessPolicyConfig.legalName}</li>
          <li><strong>Address:</strong> {businessPolicyConfig.address}</li>
          <li><strong>Hotline:</strong> {businessPolicyConfig.phone}</li>
          <li><strong>Email:</strong> {businessPolicyConfig.email}</li>
        </ul>
      </PolicySection>
    </PolicyPageLayout>
  );
}
