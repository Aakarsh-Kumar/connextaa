"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Plus, Compass, Users, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "Collaborator"}!
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-md">
            Check out who is looking to collaborate nearby or start a new project group today.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/collaborations/create"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-slate-50 font-semibold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            New Collaboration
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-950 dark:text-slate-50">Explore Feed</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse public collaborations happening in your area.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-950 dark:text-slate-50">My Groups</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage collaborations you have joined or created.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-violet-100 dark:bg-violet-950/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-950 dark:text-slate-50">Active Chats</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Talk and plan with your collaboration partners in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
