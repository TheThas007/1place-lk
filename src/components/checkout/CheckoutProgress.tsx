"use client";

import React from "react";
import { Check } from "lucide-react";

export type CheckoutStep = "delivery" | "payment" | "confirmation";

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps: { id: CheckoutStep; label: string; number: number }[] = [
    { id: "delivery", label: "Delivery Details", number: 1 },
    { id: "payment", label: "Payment", number: 2 },
    { id: "confirmation", label: "Confirmation", number: 3 },
  ];

  const getStepStatus = (stepId: CheckoutStep) => {
    if (stepId === currentStep) return "current";
    if (currentStep === "payment" && stepId === "delivery") return "completed";
    if (currentStep === "confirmation" && (stepId === "delivery" || stepId === "payment")) return "completed";
    return "upcoming";
  };

  return (
    <div className="w-full bg-white border-b border-[#EAEAEA]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-center gap-2 sm:gap-8">
          {steps.map((s, idx) => {
            const status = getStepStatus(s.id);
            const isCompleted = status === "completed";
            const isCurrent = status === "current";

            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <div
                    className={`h-[2px] w-6 sm:w-12 transition-colors duration-300 ${
                      isCompleted || isCurrent ? "bg-black" : "bg-[#EAEAEA]"
                    }`}
                  />
                )}

                <div className="flex items-center gap-2 select-none">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-black text-white"
                        : isCurrent
                        ? "bg-black text-white ring-4 ring-neutral-100"
                        : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.number}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden xs:inline ${
                      isCurrent
                        ? "text-black font-bold"
                        : isCompleted
                        ? "text-neutral-800"
                        : "text-neutral-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
