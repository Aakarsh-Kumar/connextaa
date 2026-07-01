"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/utils/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { onboardingApi } from "@/features/onboarding/api/onboardingApi";
import { authApi } from "@/features/auth/api/authApi";
import { CATEGORIES } from "@/constants";
import { type Category } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/../public/logo.png"
import LogoIcon from "@/../public/logo-icon.png"
import { 
  User, 
  Camera, 
  AtSign, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  LogOut,
} from "lucide-react";
import { isValidUsername } from "@/constants/validators";
import { useRef } from "react";

type Step = "interests" | "profile" | "complete";



export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const isMobile = useIsMobile();

  const [step, setStep] = useState<Step>("interests");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [username, setUsername] = useState("");
  const initializedRef = useRef(false);

  // Prepopulate username on mount/auth load
  useEffect(() => {
    if (!initializedRef.current && user?.name) {
      initializedRef.current = true;

      setUsername(
        user.name.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
    }
  }, [user?.name]);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authApi.logout();
      logout();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  const handleCategoryToggle = (id: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((catId) => catId !== id)
        : [...prev, id]
    );
  };


  const handleNextToProfile = () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one interest to continue.");
      return;
    }
    setStep("profile");
  };

  const handleNextToComplete = async () => {
    const res = await isValidUsername(username);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setStep("complete");
  };

  const handleSubmit = async () => {
    const res = await isValidUsername(username);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      setStep("interests");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit to server API
      const result = await onboardingApi.completeOnboarding({
        username: username.toLowerCase().trim(),
        bio: bio.trim() || undefined,
        categories: selectedCategories,
      });

      if (result.success && user) {
        // 2. Sync local Zustand state
        const updatedUser = {
          ...user,
          username: username.toLowerCase().trim(),
          bio: bio.trim() || null,
          onboardingCompleted: true,
        };
        setUser(updatedUser);
        toast.success("Profile set up successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.message || "Failed to complete onboarding");
      }
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      toast.error(error.response?.data?.message || "Onboarding failed. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.onboardingCompleted) {
    return null; // Let redirect effect run
  }

  // Styles for the navigation links in the multi-step flow
  const navLinkStyle = (currentStep: Step, targetStep: Step) => {
    const isActive = currentStep === targetStep;
    return `font-label-md text-label-md pb-1 transition-all duration-200 ${
      isActive
        ? "text-primary font-bold border-b-2 border-primary"
        : "text-on-surface-variant font-medium hover:text-primary"
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <header className="bg-card dark:bg-slate-900 border-b border-border shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <nav className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-7xl mx-auto h-16">
          {/* <div className="text-headline-md font-headline-md font-bold text-primary">
            Connectify
          </div> */}
          <Link
            href="/"
            className="relative h-12 w-10 md:w-40 flex-shrink-0 flex items-center group"
          >
            <Image
              alt="Connectify Logo"
              fill
              sizes="(max-width: 768px) 128px, 160px"
              priority
              className="object-contain object-left transition-transform duration-300 group-hover:scale-105"
              src={isMobile ? LogoIcon : Logo}
            />
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setStep("interests")} 
              className={navLinkStyle(step, "interests")}
            >
              Interests
            </button>
            <button 
              onClick={() => {
                if (selectedCategories.length > 0) setStep("profile");
                else toast.error("Select at least one interest first.");
              }} 
              className={navLinkStyle(step, "profile")}
            >
              Profile
            </button>
            <button 
              onClick={() => {
                if (selectedCategories.length > 0 && !isValidUsername(username).then((res) => res.success)) setStep("complete");
                else toast.error("Complete previous steps correctly first.");
              }} 
              className={navLinkStyle(step, "complete")}
            >
              Complete
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                Step {step === "interests" ? "1" : step === "profile" ? "2" : "3"} of 3
              </span>
            )}
            <button 
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 font-label-md text-label-md text-primary font-bold hover:text-secondary transition-colors duration-200 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 md:px-8">
        <div className="w-full max-w-2xl">
          
          {/* Stepper Card */}
          <div className="bg-card dark:bg-slate-900 rounded-3xl shadow-xl border border-border overflow-hidden transition-all duration-300">
            
            {/* Visual Hero Header Image */}
            <div className="h-44 relative overflow-hidden bg-primary/5">
              <Image
                alt="Community Connection" 
                className="w-full h-full object-cover select-none" 
                fill
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl7vDCBin_VDXoTy-dSZJnPwJ4_w6ZiPfz4JC02Q1DjPVFPJi6s8X8JPuCoNICbmEY1bFogzSazkhk3PATSCpUkBGZIOYn-JvQTeRcU8FDS3MNshpveVSfAUBWmXQfaAtKAccnVjI7BQhjuIeZ3gNwty6vkDevTU1EBs1-FA1czBXHtQhRzEMalAsHG83lBTCGINDycNLHaYRtedXPYk6kFdK5mISmEpyRNW-Y9u-uM2jDOaD9WPo6tW5qQp2_VBe97JvrmmxJOz1Q"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card dark:from-slate-900 via-transparent to-transparent"></div>
            </div>

            <div className="px-6 md:px-12 py-8 flex flex-col gap-8">
              
              {/* STEP 1: INTERESTS SELECTION */}
              {step === "interests" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="font-headline-lg text-headline-lg text-foreground">
                      What are you interested in?
                    </h1>
                    <p className="font-body-lg text-body-lg text-muted-foreground max-w-lg mx-auto">
                      Select collaboration categories that you would like to explore or host.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={`flex items-start gap-4 p-4 text-left rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md translate-y-[-1px]"
                              : "border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-y-[-1px] hover:shadow-sm"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground text-sm tracking-tight">{cat.name}</h3>
                            <p className="text-xs text-muted-foreground leading-normal">{cat.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-border flex justify-end">
                    <button
                      onClick={handleNextToProfile}
                      disabled={selectedCategories.length === 0}
                      className="bg-primary hover:bg-primary/95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      Continue to Profile
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFILE SETUP */}
              {step === "profile" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="font-headline-lg text-headline-lg text-foreground">
                      Tell the community about yourself
                    </h1>
                    <p className="font-body-lg text-body-lg text-muted-foreground max-w-lg mx-auto">
                      A friendly profile helps others feel comfortable joining your activities.
                    </p>
                  </div>

                  <div className="space-y-6 mt-6">
                    {/* Visual Avatar */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary transition-colors overflow-hidden">
                          {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt="Avatar" width={20} height={20} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full shadow-md text-white">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-muted-foreground">Profile photo synced from Google</span>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-foreground block font-semibold" htmlFor="username">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                          <AtSign className="w-4 h-4" />
                        </div>
                        <input
                          className="w-full pl-11 pr-4 py-3.5 bg-card dark:bg-slate-900 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground/50"
                          id="username"
                          name="username"
                          placeholder="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Letters, numbers, and underscores only. Min 3 characters.
                      </p>
                    </div>

                    {/* Bio Input */}
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-foreground block font-semibold" htmlFor="bio">
                        Bio
                      </label>
                      <textarea
                        className="w-full px-4 py-3.5 bg-card dark:bg-slate-900 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground/50"
                        id="bio"
                        name="bio"
                        placeholder="Say a bit about yourself, your hobbies, or what you're looking to collaborate on!"
                        rows={4}
                        maxLength={160}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Be authentic and friendly</span>
                        <span className={bio.length > 160 ? "text-destructive" : ""}>
                          {bio.length}/160
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between">
                    <button
                      onClick={() => setStep("interests")}
                      className="flex items-center gap-1.5 font-label-md text-label-md text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Interests</span>
                    </button>
                    <button
                      onClick={handleNextToComplete}
                      disabled={!username.trim()}
                      className="bg-primary hover:bg-primary/95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      Review & Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: COMPLETE SETUP */}
              {step === "complete" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="font-headline-lg text-headline-lg text-foreground">
                      Ready to join the community?
                    </h1>
                    <p className="font-body-lg text-body-lg text-muted-foreground max-w-lg mx-auto">
                      Please review your profile details before completing setup.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-border rounded-2xl p-6 space-y-6 mt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-border">
                        {user?.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="Avatar" width={20} height={20} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 m-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-tight">{user?.name}</h3>
                        <p className="text-sm text-primary font-semibold">@{username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    {bio.trim() && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</span>
                        <p className="text-sm text-foreground bg-card dark:bg-slate-900 border border-border/80 px-4 py-3 rounded-xl leading-relaxed italic">
                          &quot;{bio.trim()}&quot;
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Chosen Interests</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((catId) => {
                          const categoryObj = CATEGORIES.find(
                            (c) => c.id === catId
                          );

                          if (!categoryObj) return null;
                          return (
                            <span
                              key={catId}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                            >
                              <categoryObj.icon className="w-3.5 h-3.5" />
                              <span>{categoryObj.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <button
                      onClick={() => setStep("profile")}
                      disabled={submitting}
                      className="flex items-center gap-1.5 font-label-md text-label-md text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Profile</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer min-w-[180px]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Completing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete Setup</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
