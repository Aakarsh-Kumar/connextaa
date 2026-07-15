import Navbar from "@/components/utils/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import CollaborationStepSection from "@/components/landing/CollaborationStepSection";
import SafetySection from "@/components/landing/SafetySection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/utils/Footer";
import TrendingSection from "@/components/landing/TrendingSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connextaa | Find People For Anything",
  description: "Discover nearby activities, collaborate with people around you, and build meaningful real-world connections. Find people for study sessions, trips, sports, events, carpooling, and more.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Connextaa | Find People For Anything",
    description: "Discover nearby activities, collaborate with people around you, and build meaningful real-world connections.",
    url: "https://www.connextaa.in",
  },
  twitter: {
    title: "Connextaa | Find People For Anything",
    description: "Discover nearby activities, collaborate with people around you, and build meaningful real-world connections.",
  },
};

export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      <HeroSection />
      <CategoriesSection />
      <CollaborationStepSection />
      <TrendingSection />
      <SafetySection />
      <CtaSection />
      {/* <Footer /> */}
    </>
  );
}
