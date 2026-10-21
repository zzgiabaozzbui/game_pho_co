"use client";

import Link from "next/link";
import { Sparkles, ArrowUp } from "lucide-react";
import type { LandingData } from "../landing.data";

interface FooterProps {
  footer: LandingData["footer"];
}

export function Footer({ footer }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#f4efe6] py-16 text-[#1e1a17] border-t border-[#e5dfd3]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 pb-12 border-b border-[#e5dfd3]">
          {/* Brand Col */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9c6d1d] text-white shadow-xs">
                <Sparkles className="h-5 w-5 fill-white" />
              </div>
              <span className="font-sans text-lg font-extrabold text-[#1e1a17]">
                {footer.brand}
              </span>
            </div>
            <p className="max-w-md text-sm text-[#5a534b] leading-relaxed mb-4">
              {footer.tagline}
            </p>
            <p className="font-mono text-xs text-[#9c6d1d] font-semibold">
              ✦ {footer.heritageAttribution}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#9c6d1d] mb-4">
              ✦ {footer.linksTitle} ✦
            </h4>
            <ul className="space-y-2.5">
              {footer.links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#5a534b] hover:text-[#9c6d1d] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Back to top */}
          <div className="lg:col-span-2 flex sm:justify-end items-start">
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 rounded-full border border-[#dcd4c5] bg-white px-4 py-2.5 text-xs font-mono font-semibold text-[#1e1a17] shadow-2xs transition-all hover:border-[#9c6d1d] hover:text-[#9c6d1d] active:scale-[0.98]"
            >
              <span>✦ {footer.backToTop}</span>
              <ArrowUp className="h-3.5 w-3.5 text-[#9c6d1d] transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#7a7266]">
          <div>{footer.copyright}</div>
          <div className="flex items-center gap-4 text-[#9c6d1d] font-medium">
            <span>✦ DI SẢN THĂNG LONG</span>
            <span>·</span>
            <span>KHÔNG GIAN KẺ CHỢ ✦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
