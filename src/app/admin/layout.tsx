"use client";

import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide the main site header, footer, mobile nav, and whatsapp fab for admin pages
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const main = document.querySelector("main");
    // Hide elements from the parent layout
    const body = document.body;

    // Store original styles
    const originals: { el: HTMLElement; display: string }[] = [];

    // Hide all top-level siblings except our admin content
    if (header) {
      originals.push({ el: header, display: header.style.display });
      header.style.display = "none";
    }
    if (footer) {
      originals.push({ el: footer, display: footer.style.display });
      footer.style.display = "none";
    }

    // Hide mobile nav and whatsapp fab (they are direct children of body)
    const allBodyChildren = Array.from(body.children);
    allBodyChildren.forEach((child) => {
      const el = child as HTMLElement;
      // Hide fixed position elements (MobileNav, WhatsAppFab)
      if (el.tagName !== "MAIN" && el.tagName !== "HEADER" && el.tagName !== "FOOTER" && el.tagName !== "HTML" && el.tagName !== "SCRIPT" && el.tagName !== "NEXT-ROUTE-ANNOUNCER") {
        const computed = window.getComputedStyle(el);
        if (computed.position === "fixed") {
          originals.push({ el, display: el.style.display });
          el.style.display = "none";
        }
      }
    });

    // Remove flex column from main so admin dashboard takes full width/height
    if (main) {
      main.style.flex = "1";
      main.style.display = "flex";
      main.style.flexDirection = "column";
    }

    return () => {
      // Restore everything on unmount
      originals.forEach(({ el, display }) => {
        el.style.display = display;
      });
      if (main) {
        main.style.flex = "";
        main.style.display = "";
        main.style.flexDirection = "";
      }
    };
  }, []);

  return <>{children}</>;
}
