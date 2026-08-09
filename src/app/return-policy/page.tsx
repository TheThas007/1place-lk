import { Metadata } from "next";
import PolicyPageLayout from "@/components/policies/PolicyPageLayout";
import PolicySection from "@/components/policies/PolicySection";
import { businessPolicyConfig } from "@/config/business-policy";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Return, Refund & Warranty Policy | STREET MOBILE",
  description:
    "Official Return, Refund, Order Cancellation and Warranty Policy of Street Mobile Sri Lanka. Review return eligibility, PayHere refund processes, and warranty claims.",
  alternates: {
    canonical: "https://www.streetmobile.lk/return-policy",
  },
  openGraph: {
    title: "Return, Refund & Warranty Policy | STREET MOBILE",
    description:
      "Review the official return eligibility, warranty claims, and PayHere refund policies of Street Mobile.",
    url: "https://www.streetmobile.lk/return-policy",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const TOC_ITEMS = [
  { id: "overview", title: "Policy Overview" },
  { id: "eligibility", title: "Eligibility for Returns" },
  { id: "time-period", title: "Return Request Time Period" },
  { id: "return-conditions", title: "Accepted Return Conditions" },
  { id: "non-returnable", title: "Products That Cannot Be Returned" },
  { id: "damaged-defective", title: "Incorrect, Damaged, or Defective Products" },
  { id: "inspection", title: "Inspection & Approval Process" },
  { id: "refund-process", title: "Refund Process" },
  { id: "refund-time", title: "Refund Processing Time" },
  { id: "refund-method", title: "Refund Method" },
  { id: "shipping-charges", title: "Delivery & Return-Shipping Charges" },
  { id: "cancellation", title: "Order Cancellation Policy" },
  { id: "warranty-coverage", title: "Warranty Coverage Overview" },
  { id: "manufacturer-warranty", title: "Manufacturer Warranty" },
  { id: "shop-warranty", title: "Shop Warranty" },
  { id: "extended-warranty", title: "Extended & Custom Warranty Plans" },
  { id: "warranty-exclusions", title: "Warranty Exclusions" },
  { id: "make-claim", title: "How to Make a Warranty Claim" },
  { id: "required-docs", title: "Required Invoice & Documents" },
  { id: "contact-info", title: "Contact Information" },
];

export default function ReturnPolicyPage() {
  const { constants } = businessPolicyConfig;

  return (
    <PolicyPageLayout
      title="Return, Refund & Warranty Policy"
      subtitle="Complete guidelines on product returns, order cancellations, PayHere refund processing, and comprehensive warranty coverage at Street Mobile."
      badge="PayHere & Customer Terms"
      tocItems={TOC_ITEMS}
    >
      {/* ── Business Policy Confirmation Bar ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 text-xs space-y-2.5 font-mono">
        <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Core Policy Parameters (Business Confirmation)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          <div>
            <span className="text-gray-400">Return Window: </span>
            <strong className="text-black">{constants.RETURN_REQUEST_DAYS}</strong>
          </div>
          <div>
            <span className="text-gray-400">Refund Processing: </span>
            <strong className="text-black">{constants.REFUND_PROCESSING_DAYS}</strong>
          </div>
          <div>
            <span className="text-gray-400">Cancellation Cutoff: </span>
            <strong className="text-black">{constants.CANCELLATION_CUTOFF}</strong>
          </div>
          <div>
            <span className="text-gray-400">Return Delivery Fee: </span>
            <strong className="text-black">{constants.RETURN_DELIVERY_FEE_POLICY}</strong>
          </div>
        </div>
      </div>

      {/* 1. Policy Overview */}
      <PolicySection id="overview" number={1} title="Policy Overview">
        <p>
          At <strong>{businessPolicyConfig.tradingName}</strong> ({businessPolicyConfig.legalName}), customer satisfaction, product authenticity, and compliance with Sri Lankan electronic consumer guidelines are our highest priorities. This Return, Refund & Warranty Policy governs all product purchases made online at <strong>https://www.streetmobile.lk</strong>, via our mobile checkout, or directly at our physical store in Vavuniya.
        </p>
        <p>
          Please read this policy carefully before making a purchase. By placing an order with {businessPolicyConfig.tradingName}, you agree to the terms outlined below regarding returns, order cancellations, PayHere refund processing, and warranty servicing.
        </p>
      </PolicySection>

      {/* 2. Eligibility for Returns */}
      <PolicySection id="eligibility" number={2} title="Eligibility for Returns">
        <p>
          A product purchased from {businessPolicyConfig.tradingName} may be eligible for return or exchange under the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li>The product received is physically damaged upon unboxing or courier handover.</li>
          <li>The product received is incorrect or does not match the product name/model specified in your order invoice.</li>
          <li>The product exhibits a manufacturing defect covered under our initial inspection guarantee.</li>
        </ul>
        <p>
          To be eligible for an accepted return, the customer must present valid proof of purchase (such as an original order invoice, digital receipt, or official order ID number).
        </p>
      </PolicySection>

      {/* 3. Return Request Time Period */}
      <PolicySection id="time-period" number={3} title="Return Request Time Period">
        <p>
          All return requests must be formally submitted to {businessPolicyConfig.tradingName} within <strong>{constants.RETURN_REQUEST_DAYS}</strong>.
        </p>
        <p>
          For courier deliveries, the return window commences on the date of successful delivery as verified by our delivery partner’s tracking status. For in-store pickups, the window commences on the date of collection. Return requests submitted after this timeframe will be handled under applicable product warranty guidelines rather than an immediate return or exchange.
        </p>
      </PolicySection>

      {/* 4. Conditions Required for an Accepted Return */}
      <PolicySection id="return-conditions" number={4} title="Conditions Required for an Accepted Return">
        <p>
          To ensure an accepted return request, all returned products must strictly satisfy the following criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li><strong>Original Packaging:</strong> The product must be returned inside its original manufacturer retail box in pristine condition.</li>
          <li><strong>Complete Accessories:</strong> All original bundled items—including chargers, data cables, headphones, SIM ejector pins, user manuals, warranty booklets, and promotional free gifts—must be complete and intact.</li>
          <li><strong>Intact Security Seals:</strong> All manufacturer security stickers, IMEI barcode labels, and brand seal stickers must be unbroken and un-tampered with.</li>
          <li><strong>Account & Passcode Removal:</strong> For smartphones, tablets, and smartwatches, all user accounts (such as Apple ID, iCloud, Google Account, Samsung Account, Xiaomi Cloud) and screen passcodes MUST be signed out and completely removed prior to return.</li>
        </ul>
      </PolicySection>

      {/* 5. Products That Cannot Be Returned */}
      <PolicySection id="non-returnable" number={5} title="Products That Cannot Be Returned">
        <p>
          Due to hygiene, electronic security, and software licensing regulations, the following items are strictly non-returnable once opened or unsealed unless verified as dead-on-arrival (DOA):
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li>In-ear headphones, earbuds, and audio accessories whose hygienic seals have been broken.</li>
          <li>Screen protectors, tempered glass, or protective cases that have been applied or used.</li>
          <li>Digital gift cards, prepaid reload cards, or activated software licenses.</li>
          <li>Items with broken manufacturer security seals or missing original packaging.</li>
          <li>Products with user-inflicted physical damage, liquid exposure, or unauthorized repair attempts.</li>
        </ul>
      </PolicySection>

      {/* 6. Incorrect, Damaged, or Defective Products */}
      <PolicySection id="damaged-defective" number={6} title="Incorrect, Damaged, or Defective Products">
        <p>
          In the rare event that your package arrives damaged, incomplete, or contains an incorrect item, please notify our customer support team immediately within <strong>24 hours of delivery</strong> via phone or WhatsApp at <strong>{businessPolicyConfig.phone}</strong>.
        </p>
        <p className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 text-xs">
          <strong>Important Recommendation:</strong> We strongly advise customers to record an unboxing video when opening courier packages. Clear video evidence accelerates the verification and replacement process for damaged or missing items.
        </p>
      </PolicySection>

      {/* 7. Inspection and Approval Process */}
      <PolicySection id="inspection" number={7} title="Inspection & Approval Process">
        <p>
          Upon receiving a returned product at our physical store ({businessPolicyConfig.address}), our technical team will inspect the item within <strong>1 to 3 business days</strong>.
        </p>
        <p>
          During inspection, technicians will verify the IMEI/serial number against our sales record, check for account sign-outs, test for hardware or software defects, and evaluate physical condition. If the return is approved, we will proceed with an immediate replacement or issue a refund as per your preference. If the item is found to be non-defective or damaged due to customer misuse, it will be returned to the customer.
        </p>
      </PolicySection>

      {/* 8. Refund Process */}
      <PolicySection id="refund-process" number={8} title="Refund Process">
        <p>
          Once a return request is approved following technical inspection, {businessPolicyConfig.tradingName} will initiate the refund process promptly.
        </p>
        <p>
          Customers will receive an official notification via email, SMS, or WhatsApp confirming the approval and initiation of their refund.
        </p>
      </PolicySection>

      {/* 9. Refund Processing Time */}
      <PolicySection id="refund-time" number={9} title="Refund Processing Time">
        <p>
          Refund processing timelines depend on the payment method used during checkout:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li><strong>PayHere Credit / Debit Card Payments:</strong> <strong>{constants.REFUND_PROCESSING_DAYS}</strong>. Please note that exact posting dates depend on your card-issuing bank's billing cycle.</li>
          <li><strong>Bank Transfer / Cash Payments:</strong> <strong>1 to 3 business days</strong> following approval.</li>
        </ul>
      </PolicySection>

      {/* 10. Refund Method */}
      <PolicySection id="refund-method" number={10} title="Refund Method">
        <p>
          In accordance with financial compliance rules, approved refunds will be processed through the <strong>original payment method</strong> used when placing the order wherever operationally possible.
        </p>
        <p>
          For orders paid online via <strong>PayHere.lk</strong>, the refund amount will be credited back to the exact credit or debit card used during purchase. For Cash on Delivery (COD) or direct bank transfer orders, refunds will be issued via direct electronic bank transfer to a validated Sri Lankan bank account provided by the registered customer.
        </p>
      </PolicySection>

      {/* 11. Delivery and Return-Shipping Charges */}
      <PolicySection id="shipping-charges" number={11} title="Delivery & Return-Shipping Charges">
        <p>
          {constants.RETURN_DELIVERY_FEE_POLICY}.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li>If a return is due to an error by {businessPolicyConfig.tradingName} (such as delivering an incorrect or defective item), {businessPolicyConfig.tradingName} will bear the full cost of return courier collection.</li>
          <li>Initial delivery fees paid on the original order are non-refundable unless the entire order is canceled prior to courier dispatch.</li>
        </ul>
      </PolicySection>

      {/* 12. Order Cancellation Policy */}
      <PolicySection id="cancellation" number={12} title="Order Cancellation Policy">
        <p>
          Customers may request order cancellation <strong>{constants.CANCELLATION_CUTOFF}</strong>.
        </p>
        <p>
          To request an immediate cancellation, please call our hotline at <strong>{businessPolicyConfig.phone}</strong> as soon as possible. If the order has already been handed over to our courier partner, the delivery process cannot be intercepted in transit and must be handled via our return procedure upon arrival.
        </p>
      </PolicySection>

      {/* 13. Warranty Coverage Overview */}
      <PolicySection id="warranty-coverage" number={13} title="Warranty Coverage Overview">
        <p>
          All smartphones, tablets, and electronic gadgets sold by {businessPolicyConfig.tradingName} come with authentic warranty backing as specified on the product page and customer invoice.
        </p>
        <p>
          Warranty terms vary depending on the product brand, model, and chosen warranty option during checkout (e.g., Manufacturer Warranty vs. Shop Warranty). The specific warranty applicable to your item will always be clearly printed on your official purchase receipt.
        </p>
      </PolicySection>

      {/* 14. Manufacturer Warranty */}
      <PolicySection id="manufacturer-warranty" number={14} title="Manufacturer Warranty">
        <p>
          Products covered by official Manufacturer Warranty (such as Apple Authorized Warranty, Samsung Company Warranty, Xiaomi Official Warranty) are serviced directly through the respective brand's authorized service centers in Sri Lanka.
        </p>
        <p>
          {businessPolicyConfig.tradingName} will assist customers in lodging devices at official service centers upon request; however, repair timelines and claim approvals are determined strictly by the manufacturer's official warranty policies.
        </p>
      </PolicySection>

      {/* 15. Shop Warranty */}
      <PolicySection id="shop-warranty" number={15} title="Shop Warranty">
        <p>
          Products designated with <strong>Shop Warranty</strong> are serviced directly by {businessPolicyConfig.tradingName}'s in-house technical department in Vavuniya.
        </p>
        <p>
          Shop Warranty covers internal hardware defects and component failures under normal operating conditions. Repairs or replacements under Shop Warranty are fulfilled using high-grade, genuine parts by experienced technicians.
        </p>
      </PolicySection>

      {/* 16. Optional Extended & Custom Warranty Plans */}
      <PolicySection id="extended-warranty" number={16} title="Optional Extended & Custom Warranty Plans">
        <p>
          For selected devices, {businessPolicyConfig.tradingName} offers optional extended warranty or comprehensive protection add-ons during purchase.
        </p>
        <p>
          These plans provide additional peace of mind beyond standard terms. Details regarding duration, coverage limits, and additional fees for extended plans are displayed on the product page prior to adding items to your bag.
        </p>
      </PolicySection>

      {/* 17. Warranty Exclusions */}
      <PolicySection id="warranty-exclusions" number={17} title="Warranty Exclusions">
        <p>
          The following conditions are <strong>strictly excluded</strong> from warranty coverage under both Shop and Manufacturer warranties:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li><strong>Physical Damage:</strong> Cracked screens, broken bodies, bent frames, or damaged ports caused by drops or impacts.</li>
          <li><strong>Liquid & Moisture Damage:</strong> Internal corrosion, water ingress, or liquid indicator activation (even for devices advertised with IP water resistance).</li>
          <li><strong>Power Surges & Misuse:</strong> Damage resulting from voltage spikes, uncertified third-party chargers, or improper power inputs.</li>
          <li><strong>Unauthorized Modification:</strong> Devices subjected to third-party repairs, software rooting, custom ROM flashing, or broken security seals.</li>
          <li><strong>Normal Wear & Tear:</strong> Natural battery capacity degradation over time, minor cosmetic scratches, or casing discoloration.</li>
        </ul>
      </PolicySection>

      {/* 18. How to Make a Warranty Claim */}
      <PolicySection id="make-claim" number={18} title="How to Make a Warranty Claim">
        <p>
          To initiate a warranty claim for a product purchased from {businessPolicyConfig.tradingName}:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-gray-700">
          <li>Contact our support hotline at <strong>{businessPolicyConfig.phone}</strong> or email <strong>{businessPolicyConfig.email}</strong>.</li>
          <li>Provide your Order ID, device IMEI / Serial Number, and a clear description of the issue.</li>
          <li>Deliver or courier the device to our store address: <strong>{businessPolicyConfig.address}</strong>.</li>
          <li>Our technicians will diagnose the device and provide an estimated resolution timeframe.</li>
        </ol>
      </PolicySection>

      {/* 19. Required Invoice & Documents */}
      <PolicySection id="required-docs" number={19} title="Required Invoice & Documents">
        <p>
          When submitting a device for warranty servicing or return inspection, customers MUST present the following:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li>Original printed invoice or valid digital receipt showing order details and date.</li>
          <li>Device with matching IMEI / Serial number as recorded on the invoice.</li>
          <li>Original warranty card (where applicable).</li>
        </ul>
      </PolicySection>

      {/* 20. Contact Information */}
      <PolicySection id="contact-info" number={20} title="Contact Information">
        <p>
          For any clarifications regarding our Return, Refund & Warranty Policy, please contact our team:
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
