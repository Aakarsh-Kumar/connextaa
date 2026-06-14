"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants";
import { ArrowLeft } from "lucide-react";
import type { Category } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CreateCollaborationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [submitting, setSubmitting] = useState(false);
  

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      // Mocking collaboration API request
      toast.success("Collaboration created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create collaboration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/55 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Create Collaboration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Post an opportunity and find people to work with.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Need a guitarist for a local gig"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-50 font-medium"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-50 font-medium cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Describe what you want to achieve, who you are looking for, and what resources are available."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-50 font-medium resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Creating..." : "Publish Collaboration"}
        </button>
      </form>
    </div>
  );
}
