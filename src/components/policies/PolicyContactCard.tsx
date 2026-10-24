import React from "react";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { businessPolicyConfig } from "@/config/business-policy";
import { generateWhatsAppUrl } from "@/lib/utils";

export default function PolicyContactCard() {
  const whatsappUrl = generateWhatsAppUrl("Hi 1PLACE.LK, I have an inquiry regarding your store policies.");

  return (
    <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 space-y-6 my-10">
      <div className="border-b border-[#EAEAEA] pb-4">
        <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
          Customer Support & Official Contact
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          For any questions, warranty claims, or return assistance, please reach out to our team:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        {/* Store Address */}
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAEAEA]">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-black">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              Store Address
            </span>
            <span className="font-semibold text-black leading-snug">
              {businessPolicyConfig.legalName}
            </span>
            <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">
              {businessPolicyConfig.address}
            </p>
          </div>
        </div>

        {/* Telephone & WhatsApp */}
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAEAEA]">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-black">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              Phone & WhatsApp
            </span>
            <a
              href={`tel:${businessPolicyConfig.phone.split("/")[0].trim()}`}
              className="font-bold text-black hover:underline block"
            >
              {businessPolicyConfig.phone}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Support (+{businessPolicyConfig.whatsapp})
            </a>
          </div>
        </div>

        {/* Email Support */}
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAEAEA]">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-black">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              Email Support
            </span>
            <a
              href={`mailto:${businessPolicyConfig.email}`}
              className="font-bold text-black hover:underline break-all"
            >
              {businessPolicyConfig.email}
            </a>
            <span className="block text-gray-400 text-xs mt-0.5">
              Response within 24 business hours
            </span>
          </div>
        </div>

        {/* Store Hours */}
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAEAEA]">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-black">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              Opening Hours
            </span>
            <span className="block text-xs text-gray-800 font-semibold">
              Mon – Sat: {businessPolicyConfig.businessHours.weekdays}
            </span>
            <span className="block text-xs text-gray-800 font-semibold mt-0.5">
              Sunday: {businessPolicyConfig.businessHours.sunday}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
