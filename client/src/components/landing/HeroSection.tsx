"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock } from "lucide-react";
import Image from "next/image";
import { PwaAwareAuthButton } from "@/components/utils/PwaAwareAuthButton";

export default function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden pt-12 md:pt-24 pb-16 md:pb-32 px-5 md:px-10 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left column: Text content */}
        <div className="z-10 text-center lg:text-left">
          <h1 className="font-display-lg text-[42px] leading-tight md:text-display-lg text-on-background mb-6">
            Find People For Anything.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto lg:mx-0">
            Need a ride, a study buddy, a travel companion, or someone attending the same event? Connect with people nearby instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <PwaAwareAuthButton size={isMobile ? "md" : "lg"} />

            <a
              href="#features"
              className={`bg-transparent border border-outline-variant text-on-surface-variant ${isMobile ? "px-6 py-3 text-base" : "px-8 py-4 text-lg"} rounded-[9999px] font-bold hover:bg-muted transition-all cursor-pointer flex items-center justify-center`}
            >
              Explore Activities
            </a>
          </div>

          {/* Stats Sub-section */}
          <div className="mt-16 flex flex-wrap justify-center lg:justify-start gap-12">
            <div>
              <div className="text-3xl font-extrabold text-popover">12k+</div>
              <div className="text-on-surface-variant font-label-md text-label-md">Activities Created</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-popover">50k+</div>
              <div className="text-on-surface-variant font-label-md text-label-md">Connections Made</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-popover">98%</div>
              <div className="text-on-surface-variant font-label-md text-label-md">Happy Meetups</div>
            </div>
          </div>
        </div>

        {/* Right column: Floating Visual Cards — hidden on mobile */}
        {!isMobile && (
          <div className="relative h-[500px] hidden lg:block">
            {/* Card 1: Carpool to Coachella */}
            <div
              className="absolute top-0 right-10 w-72 bg-white p-6 rounded-[24px] card-shadow activity-card-float"
              style={{ animationDelay: "0s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Carpool to Coachella</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">2 seats left</p>
                </div>
              </div>
              <Image
                className="w-full h-32 object-cover rounded-md mb-4"
                alt="A sun-drenched wide shot of a festival landscape with colorful tents and distant palm trees against a bright blue sky."
                width={400}
                height={400}
                loading="lazy"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTMvSJvG3VQfehuMQ9HTzbH_TRoBpdZjLxRqlPksAUDLPjDq1HweMVaw7MUDVFvVtQMi3JObdJSyU53kxuXL1eD9Raz19TazExb94rQWqSvZeupKGivqpGdONTcSYSeRsRxab-LFgNaiOrKxVvc5VRM2DKBmx-AcK9ady5J1nvnpXS-Xk_FbZBoO-Z2u_JGVhzovFcxpdyXYgo4NE7856lHvINzJqvJI-woM8uBnNe53BhhyOIg9DXe8OlaSXjAMhT8GKfAnWaE1Yz"
              />
              <button className="w-full py-2 bg-primary-container/20 text-on-primary-container rounded-md font-bold transition-colors hover:bg-primary-container/30 cursor-pointer">
                Join Ride
              </button>
            </div>

            {/* Card 2: Study at Joe's Coffee */}
            <div
              className="absolute top-48 left-0 w-72 bg-white p-6 rounded-[24px] card-shadow activity-card-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-popover flex items-center justify-center text-white font-bold">
                  AL
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Study at Joe&rsquo;s Coffee</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Focus: Midterms</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 text-on-surface-variant">
                <Clock className="w-4 h-4 text-secondary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Tomorrow, 9:00 AM</span>
              </div>
              <button className="w-full py-2 bg-primary-container/20 text-on-primary-container rounded-md font-bold transition-colors hover:bg-primary-container/30 cursor-pointer">
                Let&rsquo;s Study
              </button>
            </div>

            {/* Card 3: Hiking Trip Yosemite */}
            <div
              className="absolute bottom-4 right-0 w-72 bg-white p-6 rounded-[24px] card-shadow activity-card-float"
              style={{ animationDelay: "3s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-on-secondary-fixed-variant flex items-center justify-center text-white font-bold">
                  MK
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Hiking Trip Yosemite</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Intermediate Skill</p>
                </div>
              </div>
              <Image
                className="w-full h-32 object-cover rounded-md mb-4"
                alt="A panoramic view of a majestic mountain valley with towering granite cliffs and lush green forests under soft morning light."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk_c82F4WA8aqGIlAgPWxUSiTFGwpu53f4T3E_r_QQNKBKTm97wtXiNC7axEpKItvCQ7di7vIJQL5cR6a6e07kM4SDoAynTb5IYmcvRQ-sSQdOpBy_TnFwXoz_wFWWz7O250C4D7kVYo5Mc7L4JZ6-TMi4rW6jy5BRF2Nj4g4PbJVUKuI4jZNZ7bzqp3FDweyC8cVftMchyHbGZFt_q0XLgqpXwEJO7Fshjiw6ZEh-wgQdwN1u2i9P22fmdpBpBVeZai-wTsY5k_i3"
                width={400}
                height={400}
                loading="lazy"
              />
              <button className="w-full py-2 bg-primary-container/20 text-on-primary-container rounded-md font-bold transition-colors hover:bg-primary-container/30 cursor-pointer">
                Join Hike
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
