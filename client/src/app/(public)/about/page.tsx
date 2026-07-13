import type { Metadata } from "next";
import {
  Users,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Linkedin,
  Github,
  User,
} from "lucide-react";
import Link from "next/link";
import AakarshImage from "../../../../public/developers/aakarsh.jpg"
import AarohiImage from "../../../../public/developers/aarohi.jpg"
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | Connectify",
  description:
    "Learn about the story, mission, and team behind Connectify, the platform helping people connect for real-world collaborations.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Connectify",
    description:
      "Learn about the story, mission, and team behind Connectify, the platform helping people connect for real-world collaborations.",
    url: "https://connectify.aakarsh.xyz/about",
  },
  twitter: {
    title: "About Us | Connectify",
    description:
      "Learn about the story, mission, and team behind Connectify, the platform helping people connect for real-world collaborations.",
  },
};

const values = [
  {
    icon: Users,
    title: "Community First",
    desc: "Technology should help people build genuine connections.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Matters",
    desc: "Trust is earned through respectful interactions, transparency, and accountability.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    desc: "Great products feel effortless. We focus on making collaboration easy.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    desc: "We are always listening, learning, and improving Connectify based on community feedback.",
  },
];

const whyReasons = [
  "Need a ride from the airport back to college.",
  "Going to a concert or party and want company.",
  "Looking for people to play football, basketball, or cricket with.",
  "Planning a weekend trip and want travel buddies.",
  "Heading to an event and don't want to go alone.",
  "Want to build connections beyond your existing circles.",
];

const developers = [
  {
    initials: "AK",
    name: "Aakarsh Kumar",
    pic: AakarshImage,
    role: "Developer",
    tagline: '"Normal is Boring."',
    bio: "Aakarsh enjoys building thoughtful products that solve real-world problems with clean engineering and intuitive user experiences.",
    color: "bg-popover",
    links: {
    //   portfolio: "https://aakarsh.is-a.dev",
      linkedin: "https://www.linkedin.com/in/aakarsh-kumar25",
      github: "https://github.com/Aakarsh-Kumar",
    },
  },
  {
    initials: "AS",
    name: "Aarohi Sahu",
    pic: AarohiImage,
    role: "Developer",
    tagline: '"Building Cool Stuff."',
    bio: "Aarohi is passionate about designing and developing products that are simple to use, visually appealing, and impactful for everyday users.",
    color: "bg-secondary-container",
    links: {
      linkedin: "https://www.linkedin.com/in/aarohi-sahu-5a0013327",
      github: "https://github.com/aarohi-dev",
    },
  },
];

export default function AboutUsPage() {
  return (
    <main className="bg-background min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-background border-b border-outline-variant/20 pt-12 md:pt-24 pb-16 md:pb-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-on-background mb-6 leading-tight">
            Built for Rides, Sports,{" "}
            <span className="text-popover">Trips</span> &amp; Everything In Between.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Airport to college. Concert to afterparty. Weekend trek with strangers who become friends.
            Connectify was built for the moments when you just need the right people around.
          </p>
        </div>
      </section>

      {/* ── Why We Built It ──────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: heading + body */}
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              Why We Built Connectify
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              We have all experienced moments where we wanted to:
            </p>
            <ul className="space-y-3">
              {whyReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: callout card */}
          <div className="p-8 rounded-[24px] bg-white card-shadow border border-outline-variant/10">
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6">
              Existing platforms were not designed for these everyday
              collaborations.
            </p>
            <div className="h-px bg-outline-variant/30 mb-6" />
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Connectify was created to fill that gap, a platform focused on
              helping people connect{" "}
              <strong className="text-on-surface">with purpose</strong>, not
              just communicate.
            </p>
          </div>
        </div>
      </section>

      {/* ── Meet the Developers ──────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-20 bg-surface-container-low/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
              Meet the Developers
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Two people who believed connecting people could be done better.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {developers.map((dev) => (
              <div
                key={dev.name}
                className="p-8 rounded-[24px] bg-white card-shadow border border-outline-variant/10 flex flex-col"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-5 mb-6">
                  <Image
                    className={`w-16 h-16 rounded-full ${dev.color} flex items-center justify-center text-white text-xl font-bold shrink-0`} src={dev.pic} alt={dev.initials}
                  /> 
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">
                      {dev.name}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary font-label-md text-label-md">
                      {dev.role}
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                <p className="font-body-md text-body-md text-primary italic mb-4">
                  {dev.tagline}
                </p>

                {/* Bio */}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6 flex-1">
                  {dev.bio}
                </p>

                {/* Social links */}
                <div className="pt-5 border-t border-outline-variant/20">
                  <p className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">
                    Connect
                  </p>
                  <div className="flex items-center gap-3">
                    {/* <Link
                      href={dev.links.portfolio}
                      aria-label={`${dev.name} Portfolio`}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-label-md text-label-md"
                    >
                      <Globe className="w-4 h-4" />
                      Portfolio
                    </Link> */}
                    <Link
                      href={dev.links.linkedin}
                      aria-label={`${dev.name} LinkedIn`}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-label-md text-label-md"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Link>
                    <Link
                      href={dev.links.github}
                      aria-label={`${dev.name} GitHub`}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-label-md text-label-md"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Message From Us ──────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-10 rounded-[28px] bg-white border border-primary/20 card-shadow overflow-hidden">
            {/* Subtle teal accent bar */}
            <div
              className="absolute top-0 left-0 w-full h-1.5 rounded-t-[28px]"
              style={{
                background:
                  "linear-gradient(90deg, #14B8A6 0%, #006B5F 50%, #F97316 100%)",
              }}
            />

            {/* Decorative orb inside card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-12 -right-12 w-48 h-48 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
              }}
            />

            <div className="relative">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
                A Message From Us
              </h2>

              <div className="space-y-4">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Connectify started as an idea during conversations about how
                  difficult it can be to find the right people for everyday
                  activities.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  We wanted to create something that encourages real-world
                  interactions while keeping trust, simplicity, and community at
                  its core.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Every feature, from nearby collaboration discovery to
                  temporary group chats and community ratings, has been designed
                  with the intention of making it easier for people to connect
                  with confidence.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  We&rsquo;re continuously learning, improving, and building
                  Connectify, and we truly appreciate everyone who joins us on
                  this journey.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Thank you for being a part of our community.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <User className="w-5 h-5 text-primary" strokeWidth={1.75} />
                <p className="font-headline-md text-headline-md text-on-surface">
                  Aakarsh &amp; Aarohi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ───────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-20 bg-surface-container-low/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
              Our Values
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              The principles that guide every decision we make at Connectify.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="p-7 rounded-[24px] bg-white card-shadow border border-outline-variant/10 flex flex-col gap-4"
                >
                  <div className="text-3xl"><val.icon/></div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-2">
                      {val.title}
                    </h3>
                    <p className="font-label-md text-label-md text-on-surface-variant leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Feedback CTA ─────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Have Feedback?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            We&rsquo;re always excited to hear your ideas, suggestions, and bug
            reports. If you have feedback or simply want to say hello, feel free
            to reach out through our LinkedIn profiles or portfolios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={developers[0].links.linkedin}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-[999px] bg-popover text-primary-foreground font-semibold text-sm tracking-wide hover:bg-primary/90 active:scale-95 transition-all card-shadow"
            >
              <Linkedin className="w-4 h-4" />
              Aakarsh on LinkedIn
            </Link>
            <Link
              href={developers[1].links.linkedin}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-[999px] border border-outline-variant text-on-surface-variant font-semibold text-sm tracking-wide hover:bg-muted hover:text-on-surface active:scale-95 transition-all"
            >
              <Linkedin className="w-4 h-4" />
              Aarohi on LinkedIn
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
