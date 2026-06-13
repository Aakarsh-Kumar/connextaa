"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setSubmitting(true);
    try {
      // In a real application, you'd call an API endpoint:
      // await api.post("/auth/onboard", { username });
      // Here, we simulate a successful onboarding:
      if (user) {
        const updatedUser = {
          ...user,
          username: username.toLowerCase().trim(),
          onboardingCompleted: true,
        };
        setUser(updatedUser);
        toast.success("Profile set up successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Onboarding failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.onboardingCompleted) {
    return null; // Let the redirect effect run
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Set up your profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose a unique username to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">
                @
              </span>
              <input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-50 font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
