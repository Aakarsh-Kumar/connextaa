import type { Metadata } from "next";
import DashboardClientLayout from "./dashboard-client-layout";

export const metadata: Metadata = {
  title: "Dashboard | Connectify",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}