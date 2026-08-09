import { Metadata } from "next";
import PolicyPageLayout from "@/components/policies/PolicyPageLayout";
import PolicySection from "@/components/policies/PolicySection";
import { businessPolicyConfig } from "@/config/business-policy";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | STREET MOBILE",
  description:
    "Official Privacy Policy of Street Mobile Sri Lanka. Learn how we handle customer data, Firebase infrastructure, cookies, and secure PayHere payment processing.",
  alternates: {
    canonical: "https://www.streetmobile.lk/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | STREET MOBILE",
    description:
      "Learn how Street Mobile protects your personal data, secure PayHere payment processing, and customer privacy rights.",
    url: "https://www.streetmobile.lk/privacy-policy",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const TOC_ITEMS = [
  { id: "introduction", title: "Introduction" },
  { id: "information-collected", title: "Information Collected from Customers" },
  { id: "account-contact", title: "Account & Contact Information" },
  { id: "order-delivery", title: "Order & Delivery Information" },
  { id: "payment-info", title: "Payment Information Handling" },
  { id: "device-cookie-info", title: "Device, Cookie & Usage Information" },
  { id: "how-used", title: "How Customer Information Is Used" },
  { id: "order-fulfilment", title: "Order Processing & Fulfilment" },
  { id: "support-communication", title: "Customer Support & Communication" },
  { id: "fraud-security", title: "Fraud Prevention & Website Security" },
  { id: "payhere-processing", title: "PayHere & Third-Party Payment Processing" },
  { id: "firebase-providers", title: "Firebase & Infrastructure Providers" },
  { id: "cookies-notice", title: "Cookies & Similar Technologies" },
  { id: "info-sharing", title: "Information Sharing Practices" },
  { id: "data-retention", title: "Data Retention" },
  { id: "data-protection", title: "Data Protection & Security Controls" },
  { id: "customer-rights", title: "Customer Privacy Rights" },
  { id: "marketing-choices", title: "Marketing Communication Choices" },
  { id: "children-privacy", title: "Children’s Privacy" },
  { id: "external-links", title: "External Links" },
  { id: "policy-updates", title: "Policy Updates" },
  { id: "contact-info", title: "Contact Information" },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      subtitle="How Street Mobile collects, protects, processes, and respects your personal information in compliance with Sri Lankan e-commerce privacy practices and PayHere payment security guidelines."
      badge="Data Security & Privacy"
      tocItems={TOC_ITEMS}
    >
      {/* ── Key Protection Guarantee Banner ── */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-6 text-xs space-y-2 text-emerald-950 font-normal">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>PayHere Security & Zero Card Storage Commitment</span>
        </div>
        <p className="leading-relaxed">
          <strong>Street Mobile does NOT directly store, process, or record full credit or debit card numbers, CVV codes, or sensitive bank credentials on our servers.</strong> All online card transactions are processed securely through <strong>PayHere.lk</strong> using end-to-end PCI-DSS compliant tokenization.
        </p>
      </div>

      {/* 1. Introduction */}
      <PolicySection id="introduction" number={1} title="Introduction">
        <p>
          Welcome to <strong>{businessPolicyConfig.tradingName}</strong> ({businessPolicyConfig.legalName}). We respect your privacy and are committed to protecting the personal data of our customers and visitors who access our website at <strong>https://www.streetmobile.lk</strong>.
        </p>
        <p>
          This Privacy Policy explains what personal information we collect, how it is used, stored, and shared, and what choices and rights you have regarding your personal data when using our e-commerce platform, mobile interface, or customer support channels.
        </p>
      </PolicySection>

      {/* 2. Information Collected from Customers */}
      <PolicySection id="information-collected" number={2} title="Information Collected from Customers">
        <p>
          We collect personal information necessary to deliver our products and services, process transactions, communicate with you, and ensure a secure shopping environment. Information is collected directly when you interact with our website, create an account, place an order, or contact our team.
        </p>
      </PolicySection>

      {/* 3. Account and Contact Information */}
      <PolicySection id="account-contact" number={3} title="Account & Contact Information">
        <p>
          When you register on our website or contact us, we may collect personal details such as:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Full name and preferred greeting</li>
          <li>Telephone number and active WhatsApp number</li>
          <li>Email address</li>
          <li>User account login credentials (managed securely via Firebase Authentication)</li>
        </ul>
      </PolicySection>

      {/* 4. Order and Delivery Information */}
      <PolicySection id="order-delivery" number={4} title="Order & Delivery Information">
        <p>
          To fulfill orders and deliver products across Sri Lanka, we collect:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Physical delivery address (street, city, district, province, and postal code)</li>
          <li>Recipient name and primary contact telephone number for courier drop-off</li>
          <li>Delivery instructions or landmark notes</li>
          <li>Order history, purchased items, chosen warranty plans, and invoice numbers</li>
        </ul>
      </PolicySection>

      {/* 5. Payment Information */}
      <PolicySection id="payment-info" number={5} title="Payment Information Handling">
        <p>
          We offer convenient payment options including Cash on Delivery (COD), Direct Bank Transfer, and PayHere Online Credit/Debit Card Payments.
        </p>
        <p>
          When you select online card payment, your payment details (card numbers, expiration dates, CVV security codes) are entered directly into <strong>PayHere.lk</strong>’s secure, encrypted payment portal. {businessPolicyConfig.tradingName} receives only a transaction verification token, status code, and order confirmation ID from PayHere. We never store or handle your full card numbers.
        </p>
      </PolicySection>

      {/* 6. Device, Cookie, and Usage Information */}
      <PolicySection id="device-cookie-info" number={6} title="Device, Cookie & Usage Information">
        <p>
          When you browse our website, we automatically collect certain technical data, including your IP address, device type, browser model, operating system, pages visited, referring URLs, and session timestamps to optimize site responsiveness and prevent security abuse.
        </p>
      </PolicySection>

      {/* 7. How Customer Information Is Used */}
      <PolicySection id="how-used" number={7} title="How Customer Information Is Used">
        <p>
          {businessPolicyConfig.tradingName} uses collected information strictly for legitimate e-commerce business operations:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Processing, confirming, dispatching, and tracking your orders.</li>
          <li>Verifying payment status via PayHere or cash collection logs.</li>
          <li>Providing warranty service, repairs, and customer support.</li>
          <li>Improving website speed, mobile responsiveness, and layout navigation.</li>
          <li>Protecting our store and customers against fraudulent transactions.</li>
        </ul>
      </PolicySection>

      {/* 8. Order Processing and Fulfilment */}
      <PolicySection id="order-fulfilment" number={8} title="Order Processing & Fulfilment">
        <p>
          Your delivery address and contact phone number are shared with our trusted island-wide courier partners solely for the purpose of dispatching your package and coordinating delivery drop-off.
        </p>
      </PolicySection>

      {/* 9. Customer Support and Communication */}
      <PolicySection id="support-communication" number={9} title="Customer Support & Communication">
        <p>
          We use your email address, phone number, or WhatsApp number to send transactional updates, such as order receipts, dispatch tracking details, warranty receipts, and customer service replies. We do not engage in spam or excessive messaging.
        </p>
      </PolicySection>

      {/* 10. Fraud Prevention and Website Security */}
      <PolicySection id="fraud-security" number={10} title="Fraud Prevention & Website Security">
        <p>
          To protect our platform and customers, we monitor transaction patterns for potential fraud, unauthorized logins, or system abuse. We reserve the right to verify suspicious orders prior to processing.
        </p>
      </PolicySection>

      {/* 11. PayHere and Third-Party Payment Processing */}
      <PolicySection id="payhere-processing" number={11} title="PayHere & Third-Party Payment Processing">
        <p>
          Online card transactions are powered by <strong>PayHere.lk</strong> (PayHere Private Limited), Sri Lanka’s premier Central Bank-approved payment gateway aggregator.
        </p>
        <p>
          PayHere processes customer payment information under its own stringent security protocols and privacy policy. PayHere is fully certified under PCI-DSS standards. For more information regarding PayHere’s security measures, please visit <a href="https://www.payhere.lk" target="_blank" rel="noopener noreferrer" className="underline font-bold text-black">https://www.payhere.lk</a>.
        </p>
      </PolicySection>

      {/* 12. Firebase and Service Providers */}
      <PolicySection id="firebase-providers" number={12} title="Firebase & Service Providers">
        <p>
          Our application infrastructure utilizes <strong>Google Firebase</strong> (Firebase Authentication, Firestore database, and Cloud Hosting) to securely manage user authentication and product database records.
        </p>
        <p>
          Firebase complies with industry-standard data encryption at rest and in transit. Service providers operating on our behalf are contractually restricted from using your data for any unauthorized purpose.
        </p>
      </PolicySection>

      {/* 13. Cookies and Similar Technologies */}
      <PolicySection id="cookies-notice" number={13} title="Cookies & Similar Technologies">
        <p>
          Our website uses essential cookies, local storage, and session storage tokens to remember items in your shopping bag, manage user login states, and maintain your wishlist preferences across browser sessions.
        </p>
        <p>
          Essential cookies are necessary for the website to function correctly (e.g. maintaining your active cart session during checkout). You may choose to disable cookies through your browser settings; however, doing so may impact shopping bag features.
        </p>
      </PolicySection>

      {/* 14. Information Sharing */}
      <PolicySection id="info-sharing" number={14} title="Information Sharing Practices">
        <p>
          <strong>{businessPolicyConfig.tradingName} DOES NOT sell, rent, trade, or monetize your personal information to any third parties for advertising or commercial purposes.</strong>
        </p>
        <p>
          Personal information is disclosed only to essential service partners (such as PayHere payment gateway, courier delivery companies, Firebase cloud hosting, and legal or law-enforcement authorities when mandated by Sri Lankan law).
        </p>
      </PolicySection>

      {/* 15. Data Retention */}
      <PolicySection id="data-retention" number={15} title="Data Retention">
        <p>
          We retain customer order records, invoices, and transaction histories for as long as necessary to fulfill warranty obligations, comply with tax and accounting laws, resolve disputes, and enforce our terms. Unused guest cart tokens expire automatically.
        </p>
      </PolicySection>

      {/* 16. Data Protection and Security */}
      <PolicySection id="data-protection" number={16} title="Data Protection & Security Controls">
        <p>
          We enforce administrative, technical, and physical security measures—including SSL/TLS encryption, HTTPS protocols, restricted database access roles, and continuous security monitoring—to safeguard customer data against unauthorized access or alteration.
        </p>
        <p>
          While we maintain strict security controls, no internet transmission or electronic storage architecture can be guaranteed as 100% immune from all external security threats.
        </p>
      </PolicySection>

      {/* 17. Customer Rights */}
      <PolicySection id="customer-rights" number={17} title="Customer Privacy Rights">
        <p>
          Under applicable Sri Lankan privacy practices, customers have the right to request access to the personal data we hold about them, request corrections to inaccurate contact information, or request account deletion where operationally and legally feasible.
        </p>
        <p>
          To exercise your privacy rights, please contact our support team at <strong>{businessPolicyConfig.email}</strong>.
        </p>
      </PolicySection>

      {/* 18. Marketing Communication Choices */}
      <PolicySection id="marketing-choices" number={18} title="Marketing Communication Choices">
        <p>
          Customers may receive occasional order notifications or major store announcements. You may opt out of non-essential promotional updates at any time by contacting support or using the unsubscribe options in our messages.
        </p>
      </PolicySection>

      {/* 19. Children’s Privacy */}
      <PolicySection id="children-privacy" number={19} title="Children’s Privacy">
        <p>
          Our website and products are intended for general audiences aged 18 and older. We do not knowingly collect personal data from children under 18 years of age without parental consent.
        </p>
      </PolicySection>

      {/* 20. External Links */}
      <PolicySection id="external-links" number={20} title="External Links">
        <p>
          Our website may contain links to external sites (such as brand manufacturer websites, Google Maps, or payment gateways). {businessPolicyConfig.tradingName} is not responsible for the privacy practices or content of third-party external websites.
        </p>
      </PolicySection>

      {/* 21. Policy Updates */}
      <PolicySection id="policy-updates" number={21} title="Policy Updates">
        <p>
          We may update this Privacy Policy periodically to reflect changes in legal requirements, payment gateway rules, or operational enhancements. The "Last Updated" date at the top of this document indicates when changes were made.
        </p>
      </PolicySection>

      {/* 22. Contact Information */}
      <PolicySection id="contact-info" number={22} title="Contact Information">
        <p>
          If you have questions regarding this Privacy Policy or data handling at {businessPolicyConfig.tradingName}, please contact us:
        </p>
        <ul className="list-none space-y-1 text-gray-800 font-semibold">
          <li><strong>Entity Name:</strong> {businessPolicyConfig.legalName}</li>
          <li><strong>Address:</strong> {businessPolicyConfig.address}</li>
          <li><strong>Phone:</strong> {businessPolicyConfig.phone}</li>
          <li><strong>Email:</strong> {businessPolicyConfig.email}</li>
        </ul>
      </PolicySection>
    </PolicyPageLayout>
  );
}
