"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isRequestsActive = pathname.includes("/requests");

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col">
      
      {/* Header Section */}
      <header className="mb-stack-lg">
        <h1 className={isMobile 
          ? "font-headline-lg-mobile text-headline-lg-mobile text-on-surface" 
          : "font-headline-lg text-headline-lg text-on-surface"}
        >
          Chats
        </h1>
        <p className="text-on-surface-variant font-body-md mt-1">
          Stay connected with your activity groups.
        </p>
      </header>

      {/* Segmented Control */}
      <div className="flex justify-center mb-10">
        <div className="bg-surface-container-high p-1 rounded-2xl flex w-full max-w-md">
          <Link
            id="tab-requests"
            href="/dashboard/chats/requests"
            className={`flex-1 py-2.5 rounded-xl font-label-md transition-all text-center ${
              isRequestsActive
                ? "ios-tab-active text-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Requests
          </Link>
          <Link
            id="tab-chats"
            href="/dashboard/chats"
            className={`flex-1 py-2.5 rounded-xl font-label-md transition-all text-center ${
              !isRequestsActive
                ? "ios-tab-active text-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Chats
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 w-full">
        {children}
      </div>
      </div>
  );
}
