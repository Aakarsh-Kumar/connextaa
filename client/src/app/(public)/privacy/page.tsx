import type { Metadata } from "next";
import { Shield, MapPin, Info, Share2, Lock, Building2, Clock, Baby, RefreshCw, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Connectify",
  description:
    "Learn how Connectify collects, uses, and protects your personal information when you use our collaboration platform.",
};

const sections = [
  {
    id: "information-we-collect",
    icon: Info,
    title: "Information We Collect",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        To provide our services, we may collect your Google account information
        (name, email address, and profile picture) when you sign in, your chosen
        username and bio, your collaboration preferences and interests,
        collaborations you create or join, messages sent within collaboration
        chat rooms, ratings and reviews submitted after completed collaborations,
        and device information required for notifications and app functionality.
      </p>
    ),
  },
  {
    id: "location-information",
    icon: MapPin,
    title: "Location Information",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          Connectify requests access to your location{" "}
          <strong className="text-on-surface">
            only to recommend nearby collaborations and calculate approximate
            distances between you and activities.
          </strong>
        </p>
        <div className="flex items-start gap-3 p-4 rounded-[16px] bg-primary/5 border border-primary/10">
          <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-on-surface font-body-md text-body-md">
            <strong>We do not permanently store or track your live location.</strong>{" "}
            Your location is processed only when required to provide
            location-based recommendations and improve your experience.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    icon: Building2,
    title: "How We Use Your Information",
    content: (
      <ul className="space-y-2">
        {[
          "Authenticate your account.",
          "Personalize your experience.",
          "Recommend nearby collaborations.",
          "Display your public profile to other users.",
          "Enable collaboration chat.",
          "Build trust through ratings and reviews.",
          "Send notifications related to your collaborations.",
          "Improve the reliability and security of the platform.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-on-surface-variant font-body-md text-body-md">
              {item}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "shared-information",
    icon: Share2,
    title: "Information Shared With Other Users",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          Some profile information is visible to other Connectify users,
          including:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            "Name",
            "Username",
            "Profile picture",
            "Bio",
            "Public ratings",
            "Collaborations (where applicable)",
          ].map((item) => (
            <div
              key={item}
              className="px-4 py-3 rounded-[12px] bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md text-center"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3 p-4 rounded-[16px] bg-destructive/5 border border-destructive/10">
          <Lock className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-on-surface font-body-md text-body-md">
            Your email address is <strong>never displayed publicly</strong>.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Data Security",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        We implement reasonable security measures to protect your information.
        However, no internet service can guarantee absolute security. You are
        responsible for keeping your account secure and protecting your own
        devices.
      </p>
    ),
  },
  {
    id: "third-party",
    icon: Building2,
    title: "Third-Party Services",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        Connectify uses third-party services such as Google Sign-In for
        authentication. These services are governed by their own privacy
        policies.
      </p>
    ),
  },
  {
    id: "data-retention",
    icon: Clock,
    title: "Data Retention",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        We retain your account information for as long as your account exists.
        Certain collaboration-related information, ratings, and messages may be
        retained for operational, security, or moderation purposes.
      </p>
    ),
  },
  {
    id: "childrens-privacy",
    icon: Baby,
    title: "Children's Privacy",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        Connectify is intended for users who are at least{" "}
        <strong className="text-on-surface">13 years of age</strong>.
      </p>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to This Policy",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        We may update this Privacy Policy from time to time. Continued use of
        Connectify after changes become effective constitutes acceptance of the
        updated policy.
      </p>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        If you have any questions regarding this Privacy Policy, please contact
        the Connectify development team.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-background border-b border-outline-variant/20 pt-16 pb-16 px-5 md:px-10">
        {/* Decorative gradient orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-0 w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-on-background mb-4 leading-tight">
            Your Privacy Matters
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            We believe in full transparency. Here&rsquo;s exactly how
            Connectify collects, uses, and protects your information.
          </p>
          <p className="mt-6 font-label-md text-label-md text-on-surface-variant/60">
            Last Updated: July 10, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Intro card */}
          <div className="p-8 rounded-[24px] bg-white card-shadow mb-12 border border-outline-variant/10">
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Welcome to <strong className="text-on-surface">Connectify</strong>
              . Your privacy is important to us. This Privacy Policy explains
              what information we collect, how we use it, and the choices you
              have when using our platform.
            </p>
            <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
              By using Connectify, you agree to the practices described in this
              Privacy Policy.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="p-8 rounded-[24px] bg-white card-shadow border border-outline-variant/10"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-11 h-11 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      {section.title}
                    </h2>
                  </div>
                  {section.content}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
