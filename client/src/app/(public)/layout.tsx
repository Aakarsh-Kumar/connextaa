"use client";
import Navbar from "@/components/utils/Navbar";
import Footer from "@/components/utils/Footer";
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return <><Navbar/>{children}<Footer/></>;
}