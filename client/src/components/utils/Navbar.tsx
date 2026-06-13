"use client";

import * as React from "react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "@/../public/logo.png"
import LogoIcon from "@/../public/logo-icon.png"
import { useAuthStore } from "@/store/authStore";
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("");

  // Adjust state during render if screen size switches to desktop
  if (!isMobile && isMobileMenuOpen) {
    setIsMobileMenuOpen(false);
  }

  React.useEffect(() => {
    const sections = ["features", "categories", "how-it-works"];
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px", // Trigger when section occupies the middle part of the screen
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id === "features") setActiveTab("Features");
          if (id === "categories") setActiveTab("Categories");
          if (id === "how-it-works") setActiveTab("How It Works");
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Categories", href: "#categories" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40 shadow-[0px_4px_20px_rgba(31,41,55,0.05)] transition-all duration-300">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-5 md:px-10 py-4 h-16"> {/* 💡 Fixed height ensures clean vertical alignment */}
        
        {/* Logo Wrapper Container */}
        {/* 💡 h-full sets constraints, max-w prevents stretching, flex-shrink-0 keeps it from collapsing */}
        <Link 
          href="/" 
          className="relative h-full w-32 md:w-40 flex-shrink-0 flex items-center group"
        >
          <Image
            alt="Connectify Logo"
            fill
            sizes="(max-width: 768px) 128px, 160px"
            priority
            className="object-contain object-left transition-transform duration-300 group-hover:scale-105"
            src={isMobile ? LogoIcon : Logo}
          />
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
        <div className="flex items-center gap-4 flex-shrink-0">
            {useAuthStore((state) => state.isAuthenticated) ? (
                <Link
                href="/dashboard"
                className={`bg-popover text-primary-foreground py-2.5 rounded-[999px] ${isMobile ? "text-xs px-2.5" : "text-sm px-6"} font-semibold tracking-[0.05em] active:scale-95 hover:bg-primary/90 transition-all cursor-pointer shadow-sm`}
                >
                Go to Dashboard
                </Link>
                ) : (
                    <GoogleLoginButton />
            )}
          
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
