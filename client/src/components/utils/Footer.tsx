"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Globe, AtSign } from "lucide-react";
import Image from "next/image";
import Logo from "@/../public/logo-icon.png";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Categories", href: "#categories" },
    { label: "Safety", href: "#safety" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Community Guidelines", href: "#" },
    { label: "Contact Support", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  const isMobile = useIsMobile();

  return (
    <footer className="bg-white border-t border-outline-variant/30 px-5 md:px-10 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Brand + Link Columns */}
        <div className={`flex flex-col md:flex-row justify-between items-start gap-12 ${isMobile ? "mb-10" : "mb-16"}`}>
          {/* Brand Block */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Image
                alt="Connectify Logo"
                src={Logo}
                className="h-8 w-8 object-contain"
                width={32}
                height={32}
              />
              <span className="font-headline-md text-headline-md font-bold text-popover">
                Connectify
              </span>
            </div>
            <p className="text-on-surface-variant font-body-md text-body-md max-w-xs">
              Building bridges between neighbors for a more collaborative world.
            </p>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h5 className="font-bold text-on-surface mb-4">{heading}</h5>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-label-md text-label-md text-on-surface-variant hover:underline decoration-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-outline-variant/10">
          <p className="font-label-md text-label-md text-on-surface-variant">
            © 2026 Connectify. Built for neighbors.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <AtSign className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
