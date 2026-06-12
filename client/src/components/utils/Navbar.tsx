"use client";

import * as React from "react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Features");

  // Automatically close mobile menu if screen resizes to desktop
  React.useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Categories", href: "#categories" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40 shadow-[0px_4px_20px_rgba(31,41,55,0.05)] transition-all duration-300">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-5 md:px-10 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            alt="Connectify Logo"
            className="h-10 w-10 transition-transform duration-300 group-hover:scale-105"
            src='data:image/png;base64,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'
          />
          <span className="text-2xl font-semibold text-primary tracking-tight">Connectify</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeTab === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setActiveTab(link.name)}
                className={`text-sm tracking-[0.05em] py-1 border-b-2 transition-all duration-200 ${
                  isActive
                    ? "text-popover border-popover font-bold"
                    : "text-foreground/80 font-semibold border-transparent hover:text-popover hover:border-popover/30"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button className={`bg-popover text-primary-foreground py-2.5 rounded-[999px] ${isMobile ? "text-xs px-2.5" : "text-sm px-6"} font-semibold tracking-[0.05em] active:scale-95 hover:bg-primary/90 transition-all cursor-pointer shadow-sm`}>
            Continue with Google
          </button>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary p-2 hover:bg-muted rounded-full transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 stroke-[2.5]" />
            ) : (
              <Menu className="h-6 w-6 stroke-[2.5]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col px-5 py-6 gap-4">
            {navLinks.map((link) => {
              const isActive = activeTab === link.name;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveTab(link.name);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-base tracking-[0.05em] py-2 px-3 rounded-xl transition-all duration-150 ${
                    isActive
                      ? "text-popover bg-primary/5 font-bold"
                      : "text-foreground/80 font-semibold hover:text-popover hover:bg-popover/5"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
