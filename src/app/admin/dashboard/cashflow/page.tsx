"use client";

import { Suspense } from "react";
import CashFlowTab from "@/components/admin/tabs/CashFlowTab";

export default function CashFlowPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/50">Loading Cash Flow...</div>}>
      <CashFlowTab />
    </Suspense>
  );
}
