"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { profileApi } from "@/features/profile/api/profileApi";
import { authApi } from "@/features/auth/api/authApi";
import { CATEGORIES, getCategoryStyles } from "@/constants";
import { type Category, type ProfileResponse } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidUsername } from "@/constants/validators";
import {
  Star,
  User,
  AtSign,
  ChevronRight,
  LogOut,
  Sparkles,
  Loader2,
  Lock,
  Bell,
} from "lucide-react";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBdjOVVpPF_CyFFwM0PKq5gTHLZoabu_iQdSTAzkNY_nO2fQ3rSoj41BnCu-QDkvsVKGYrd3kGXkUaOPB5NUlV3hiufvfd9X_3vZv7mIZTjfpNxNjVROiEL_YRmXIRYE1VE-kCJ7kNqzSC2Z6gjKDW43MCXJv1ije7ub3Ckpt-w8E4obDbQ6wL7buu2VtMaDkTHEGxhTRT_l-QRgPS_J3VP3ynNS1SOM17PZq67q04cMlIVR0wc45HnV0esb17f9mBpuanGFrrLMjet";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const isMobile = useIsMobile();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Dialog States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getMeProfile();
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const openEditDialog = () => {
    if (profile) {
      setEditUsername(profile.user.username);
      setEditBio(profile.user.bio || "");
      setEditCategories(profile.user.categories);
      setIsEditDialogOpen(true);
    }
  };

  const toggleCategoryInEdit = (id: Category) => {
    setEditCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = await isValidUsername(editUsername);
    if (!validation.success) {
      toast.error(validation.message);
      return;
    }

    if (editCategories.length === 0) {
      toast.error("Please select at least one interest.");
      return;
    }

    setUpdating(true);
    try {
      const updatedProfile = await profileApi.updateMeProfile({
        username: editUsername.toLowerCase().trim(),
        bio: editBio.trim() || undefined,
        categories: editCategories,
      });

      setProfile(updatedProfile);

      if (user) {
        setUser({
          ...user,
          username: updatedProfile.user.username,
          bio: updatedProfile.user.bio,
        });
      }
      toast.success("Profile updated successfully!");
      setIsEditDialogOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  /* ─── Loading skeleton ──────────────────────────────────────── */
  if (loading || !profile) {
    return (
      <div
        className={`max-w-[800px] mx-auto py-8 space-y-6 ${
          isMobile ? "px-4" : "px-0"
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-md" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const feedbackMetrics = [
    { label: "Showed Up", score: profile.rating.showUpRating },
    { label: "Friendly", score: profile.rating.friendlyRating },
    { label: "Safe", score: profile.rating.safeRating },
    { label: "Collaborative", score: profile.rating.collaborativeRating },
  ];

  /* ─── Page ──────────────────────────────────────────────────── */
  return (
    <div
      className={`max-w-[800px] mx-auto py-8 space-y-6 ${
        isMobile ? "px-4" : "px-0"
      }`}
    >

      {/* ── Profile Header: centered, no banner ── */}
      <section className="flex flex-col items-center text-center pt-6 pb-8 space-y-4">

        {/* Avatar */}
        <div className="relative w-32 h-32">
          <img
            alt="User Avatar"
            src={profile.user.avatarUrl || DEFAULT_AVATAR}
            className="w-full h-full rounded-full object-cover border-4 border-[var(--card)] shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
        </div>

        {/* Name & username */}
        <div className="space-y-1">
          <h1 className="font-headline-lg text-headline-lg text-[var(--foreground)] tracking-tight">
            {profile.user.name}
          </h1>
          <p className="font-body-md text-body-md text-[var(--outline)]">
            @{profile.user.username}
          </p>
        </div>

        {/* Bio */}
        <p className="font-body-md text-body-md text-[var(--on-surface-variant)] max-w-md leading-relaxed">
          {profile.user.bio ||
            "No bio added yet. Write something friendly about yourself!"}
        </p>

        {/* Edit button */}
        <button
          onClick={openEditDialog}
          className="px-6 py-2 border border-[var(--outline-variant)] rounded-full font-label-md text-label-md text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-colors duration-200 active:scale-95"
        >
          Edit Profile
        </button>
      </section>

      {/* ── Trust Score ── */}
      <section className="bg-[var(--card)] border border-[var(--surface-container-high)] rounded-2xl p-8 card-shadow text-center">
        <h2 className="font-label-md text-label-md uppercase tracking-widest text-[var(--outline)] mb-4">
          Trust Score
        </h2>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display-lg text-display-lg text-[var(--primary)]">
              {profile.rating.overall > 0
                ? profile.rating.overall.toFixed(1)
                : "N/A"}
            </span>
            {profile.rating.overall > 0 && (
              <Star className="text-[var(--primary)] fill-[var(--primary)] w-9 h-9" />
            )}
          </div>
          <p className="font-label-md text-label-md text-[var(--primary-container)] font-semibold">
            Based on {profile.rating.totalReviews} community reviews
          </p>
        </div>
      </section>

      {/* ── Activity Stats ── */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: "Created", count: profile.stats.created },
          { label: "Joined", count: profile.stats.joined },
          { label: "Completed", count: profile.stats.completed },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card)] border border-[var(--surface-container-high)] p-6 rounded-2xl text-center card-shadow"
          >
            <p className="font-headline-md text-headline-md text-[var(--on-surface)] mb-1">
              {stat.count}
            </p>
            <p className="font-label-sm text-label-sm text-[var(--outline)]">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Interests ── */}
      <section className="space-y-4">
        <h3 className="font-headline-md text-headline-md text-[var(--foreground)] px-1 tracking-tight">
          Interests
        </h3>

        {profile.user.categories.length > 0 ? (
          <div className="flex flex-wrap gap-3 px-1">
            {profile.user.categories.map((catId) => {
              const matched = CATEGORIES.find((c) => c.id === catId);
              if (!matched) return null;
              const Icon = matched.icon;
              return (
                <div
                  key={catId}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full font-label-md text-label-md ${getCategoryStyles(
                    catId
                  )}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{matched.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)] px-1 italic">
            No interests added yet. Click &quot;Edit Profile&quot; to add some!
          </p>
        )}
      </section>

      {/* ── Community Feedback ── */}
      <section className="space-y-4">
        <h3 className="font-headline-md text-headline-md text-[var(--foreground)] px-1 tracking-tight">
          Community Feedback
        </h3>
        <div
          className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {feedbackMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-[var(--card)] px-6 py-4 rounded-2xl flex justify-between items-center border border-[var(--surface-container-high)] shadow-sm"
            >
              <span className="font-body-md text-body-md text-[var(--on-surface-variant)]">
                {metric.label}
              </span>
              <div className="flex items-center gap-1">
                <Star className="text-[var(--primary)] fill-[var(--primary)] w-[18px] h-[18px]" />
                <span className="font-label-md text-label-md font-bold text-[var(--foreground)]">
                  {metric.score > 0 ? metric.score.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Account Settings ── */}
      <section className="space-y-4">
        <h3 className="font-headline-md text-headline-md text-[var(--foreground)] px-1 tracking-tight">
          Account Settings
        </h3>
        <div className="space-y-2">

          {[
            {
              icon: <User className="w-5 h-5 text-[var(--on-surface-variant)]" />,
              label: "Edit Profile",
              onClick: openEditDialog,
              variant: "default" as const,
            },
            // {
            //   icon: <Sparkles className="w-5 h-5 text-[var(--on-surface-variant)]" />,
            //   label: "Manage Interests",
            //   onClick: openEditDialog,
            //   variant: "default" as const,
            // },
            {
              icon: <Bell className="w-5 h-5 text-[var(--on-surface-variant)]" />,
              label: "Notification Preferences",
              onClick: () => toast("Notification settings coming soon!"),
              variant: "default" as const,
            },
            {
              icon: <Lock className="w-5 h-5 text-[var(--on-surface-variant)]" />,
              label: "Privacy",
              onClick: () => toast("Privacy configurations coming soon!"),
              variant: "default" as const,
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full bg-[var(--card)] px-6 py-4 rounded-2xl flex justify-between items-center border border-[var(--surface-container-high)] hover:bg-[var(--surface-container-low)] transition-colors shadow-sm group"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-body-md text-body-md text-[var(--on-surface)]">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="text-[var(--outline)] group-hover:translate-x-1 transition-transform w-5 h-5" />
            </button>
          ))}

          {/* Logout — destructive */}
          <button
            onClick={handleLogout}
            className="w-full bg-[var(--card)] px-6 py-4 rounded-2xl flex justify-between items-center border border-[var(--surface-container-high)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-[var(--destructive)]" />
              <span className="font-body-md text-body-md text-[var(--destructive)]">
                Logout
              </span>
            </div>
            <ChevronRight className="text-[var(--destructive)] opacity-50 group-hover:translate-x-1 transition-transform w-5 h-5" />
          </button>

        </div>
      </section>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl">

          <DialogHeader>
            <DialogTitle className="font-headline-md text-headline-md text-[var(--foreground)]">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-[var(--muted-foreground)]">
              Update your username, biography, and interests.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile} className="space-y-4 mt-2">

            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="edit-username"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  id="edit-username"
                  type="text"
                  value={editUsername}
                  onChange={(e) =>
                    setEditUsername(
                      e.target.value.toLowerCase().replace(/\s+/g, "")
                    )
                  }
                  className="pl-9 h-10 border border-[var(--border)] rounded-xl"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label
                htmlFor="edit-bio"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Bio
              </label>
              <textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] focus:outline-none transition-all bg-transparent text-sm h-24 resize-none text-[var(--foreground)]"
                placeholder="Say something about yourself..."
                maxLength={160}
              />
              <div className="text-right text-xs text-[var(--muted-foreground)]">
                {editBio.length}/160
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--foreground)] block">
                Chosen Interests
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = editCategories.includes(cat.id);
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategoryInEdit(cat.id)}
                      className={`flex items-center gap-2 p-2.5 border rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? getCategoryStyles(cat.id)
                          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--surface-container-low)]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updating}
                className="h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updating}
                className="h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold hover:opacity-90 flex items-center justify-center min-w-[110px]"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-1" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}