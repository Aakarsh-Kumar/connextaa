import type { Metadata } from "next";
import {
  ScrollText,
  Users,
  Handshake,
  Star,
  ShieldAlert,
  Zap,
  UserX,
  Layers,
  Scale,
  RefreshCw,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Connextaa",
  description:
    "Connextaa Terms of Service covering account use, collaborations, safety, and liability.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | Connextaa",
    description:
      "Connextaa Terms of Service covering account use, collaborations, safety, and liability.",
    url: "https://www.connextaa.in/terms",
  },
  twitter: {
    title: "Terms of Service | Connextaa",
    description:
      "Connextaa Terms of Service covering account use, collaborations, safety, and liability.",
  },
};

const prohibitedActions = [
  "Harass, threaten, bully, or intimidate other users.",
  "Create fake accounts or impersonate another person.",
  "Share illegal, harmful, abusive, or offensive content.",
  "Use Connextaa for fraud, scams, or deceptive activities.",
  "Attempt to gain unauthorized access to accounts or systems.",
  "Reverse engineer, exploit bugs, or abuse vulnerabilities within the platform.",
  "Use automated tools, bots, or scripts to misuse the service.",
  "Interfere with the normal operation of Connextaa.",
];

const notGuaranteed = [
  "That collaborations will take place.",
  "That participants will attend.",
  "The accuracy of information shared by users.",
  "The conduct or identity of other users.",
];

const notLiableFor = [
  "Fraud or scams between users.",
  "Harassment or abusive behavior.",
  "Theft or property damage.",
  "Personal injury.",
  "Financial losses.",
  "Disputes arising from collaborations.",
  "Any incidents occurring before, during, or after an in-person meeting.",
];

const suspensionReasons = [
  "Violate these Terms.",
  "Abuse the platform.",
  "Exploit security vulnerabilities.",
  "Engage in fraudulent or harmful activities.",
  "Repeatedly receive verified reports of misconduct.",
];

const categories = [
  "Study sessions",
  "Sports",
  "Events",
  "Trips",
  "Carpooling",
  "Professional networking",
  "Other community activities",
];

const sections = [
  {
    id: "about-connextaa",
    icon: Layers,
    title: "About Connextaa",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          Connextaa is a community platform that helps users discover and
          collaborate with nearby people for activities such as:
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/15 text-primary font-label-md text-label-md"
            >
              {cat}
            </span>
          ))}
        </div>
        <p className="text-on-surface-variant font-body-md text-body-md pt-2">
          Connextaa only facilitates connections between users. We do not
          organize, supervise, or guarantee any collaboration.
        </p>
      </div>
    ),
  },
  {
    id: "user-responsibilities",
    icon: Users,
    title: "User Responsibilities",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          You agree to use Connextaa responsibly and respectfully. You must
          not:
        </p>
        <ul className="space-y-2">
          {prohibitedActions.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              <span className="text-on-surface-variant font-body-md text-body-md">
                {item}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-start gap-3 p-4 rounded-[16px] bg-destructive/5 border border-destructive/10">
          <ShieldAlert className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-on-surface font-body-md text-body-md">
            Any misuse of the platform may result in account suspension or
            permanent removal.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "collaborations",
    icon: Handshake,
    title: "Collaborations",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          Creators are responsible for the collaborations they create.
          Participants are responsible for deciding whether to join a
          collaboration.
        </p>
        <p className="text-on-surface font-body-md text-body-md font-medium">
          Connextaa does not guarantee:
        </p>
        <ul className="space-y-2">
          {notGuaranteed.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span className="text-on-surface-variant font-body-md text-body-md">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "ratings-reviews",
    icon: Star,
    title: "Ratings and Reviews",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          After a collaboration is completed, participants may rate one another.
          Ratings should be:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {["Honest", "Fair", "Based on actual participation"].map((item) => (
            <div
              key={item}
              className="px-4 py-3 rounded-[12px] bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md text-center"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="text-on-surface-variant font-body-md text-body-md">
          Attempts to manipulate, abuse, or spam the rating system may result
          in moderation actions.
        </p>
      </div>
    ),
  },
  {
    id: "safety-disclaimer",
    icon: ShieldAlert,
    title: "Safety Disclaimer",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          While Connextaa aims to build a trusted community,{" "}
          <strong className="text-on-surface">
            we cannot verify or guarantee the identity, intentions, or conduct
            of every user.
          </strong>
        </p>
        <p className="text-on-surface-variant font-body-md text-body-md">
          Users are solely responsible for exercising good judgment when
          interacting with others, both online and offline.
        </p>
        <div className="p-5 rounded-[16px] bg-destructive/5 border border-destructive/10 space-y-3">
          <p className="text-on-surface font-body-md text-body-md font-semibold">
            Connextaa is not responsible or liable for:
          </p>
          <ul className="space-y-2">
            {notLiableFor.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                <span className="text-on-surface-variant font-body-md text-body-md">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-[16px] bg-secondary/5 border border-secondary/10">
          <ShieldAlert className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <p className="text-on-surface font-body-md text-body-md">
            If you choose to meet another user, you do so{" "}
            <strong>entirely at your own risk</strong>.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "platform-availability",
    icon: Zap,
    title: "Platform Availability",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        We strive to keep Connextaa available and reliable, but we do not
        guarantee uninterrupted access. Features may be modified, suspended, or
        discontinued at any time without prior notice.
      </p>
    ),
  },
  {
    id: "account-suspension",
    icon: UserX,
    title: "Account Suspension",
    content: (
      <div className="space-y-4">
        <p className="text-on-surface-variant font-body-md text-body-md">
          We reserve the right to suspend or permanently terminate accounts
          that:
        </p>
        <ul className="space-y-2">
          {suspensionReasons.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              <span className="text-on-surface-variant font-body-md text-body-md">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "intellectual-property",
    icon: Layers,
    title: "Intellectual Property",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        The Connextaa platform, branding, design, and software are owned by
        Connextaa. Users retain ownership of the content they create but grant
        Connextaa permission to display and process that content for operating
        the platform.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    icon: Scale,
    title: "Limitation of Liability",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        To the fullest extent permitted by applicable law, Connextaa and its
        developers shall not be liable for any direct, indirect, incidental,
        consequential, or special damages arising from the use of the platform.
        Your use of Connextaa and participation in collaborations is entirely
        at your own discretion and risk.
      </p>
    ),
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to These Terms",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        We may revise these Terms periodically. Continued use of Connextaa
        after updates constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact",
    content: (
      <p className="text-on-surface-variant font-body-md text-body-md">
        If you have questions regarding these Terms, please contact the
        Connextaa development team.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-background border-b border-outline-variant/20 pt-16 pb-16 px-5 md:px-10">
        {/* Decorative gradient orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-0 w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-on-background mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            By using Connextaa, you agree to these Terms. Please read them
            carefully before creating an account or using our services.
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
              Welcome to <strong className="text-on-surface">Connextaa</strong>
              . These Terms govern your use of the Connextaa platform. By
              creating an account or using our services, you agree to these
              Terms.
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
                    <div className="w-11 h-11 rounded-[14px] bg-secondary/10 flex items-center justify-center shrink-0">
                      <Icon
                        className="w-5 h-5 text-secondary"
                        strokeWidth={1.75}
                      />
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

          {/* Footer note
          <p className="mt-12 text-center font-label-md text-label-md text-on-surface-variant/60 max-w-2xl mx-auto">
            Welcome to connextaa guys!
          </p> */}
        </div>
      </section>
    </main>
  );
}
