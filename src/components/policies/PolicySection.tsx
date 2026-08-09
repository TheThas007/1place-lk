import React from "react";

interface PolicySectionProps {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}

export default function PolicySection({ id, number, title, children }: PolicySectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-32 pt-6 pb-6 border-b border-[#EAEAEA] last:border-b-0 space-y-4"
    >
      <div className="flex items-baseline gap-2.5">
        <span className="text-xs font-mono font-bold text-gray-400">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-black tracking-tight">
          {title}
        </h2>
      </div>

      <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3 font-normal">
        {children}
      </div>
    </section>
  );
}
