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
  MapPin,
  Bell,
  BellOff,
  Check,
  AlertCircle
} from "lucide-react";
import { isValidUsername } from "@/constants/validators";
import { useRef, useCallback } from "react";

type Step = "interests" | "profile" | "permissions" | "complete";



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
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const value = username.trim();

    if (!value) {
      setUsernameStatus("idle");
      return;
    }

    const validation = isValidUsername(value);

    if (!validation.success) {
      setUsernameStatus("invalid");
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setUsernameStatus("checking");

        const res = await authApi.checkUsername(value);
        setUsernameStatus(res.success ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 600);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [username]);

  // Permissions state
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<PermissionState | "default" | "granted" | "denied">("default");

  // Prepopulate username on mount/auth load
  useEffect(() => {
    if (!initializedRef.current && user?.username) {
      initializedRef.current = true;

      setUsername(
        user.username
      );
    }
  }, [user?.username]);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Check current permission states
  const checkPermissions = useCallback(async () => {
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      try {
        const geoStatus = await navigator.permissions.query({ name: "geolocation" });
        setLocationGranted(geoStatus.state === "granted");
        geoStatus.onchange = () => {
          setLocationGranted(geoStatus.state === "granted");
        };

        if ("Notification" in window) {
          setNotificationStatus(Notification.permission);
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (step === "permissions") {
      checkPermissions();
    }
  }, [step, checkPermissions]);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationGranted(true);
        toast.success("Location permission granted!");
      },
      (error) => {
        setLocationGranted(false);
        toast.error("Location access is required to use Connextaa.");
      }
    );
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported by this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === "granted") {
        toast.success("Notification permission granted!");
      } else if (permission === "denied") {
        toast.error("Notification permission denied.");
      }
    } catch (err) {
      console.error("Error requesting notifications:", err);
    }
  };

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

  const handleNextToPermissions = async () => {
    const res = isValidUsername(username);
    if (!res.success) {
      toast.error(res.message as string);
      return;
    }
    setStep("permissions");
  };

  const handleNextToComplete = () => {
    if (!locationGranted) {
      toast.error("Location permission is mandatory to proceed.");
      return;
    }
    setStep("complete");
  };

  const handleSubmit = async () => {
    const res = isValidUsername(username);
    if (!res.success) {
      toast.error(res.message as string);
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
            Connextaa
          </div> */}
          <Link
            href="/"
            className="relative h-12 w-10 md:w-40 flex-shrink-0 flex items-center group"
          >
            <Image
              alt="Connextaa Logo"
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
                if (selectedCategories.length > 0 && username.trim()) setStep("permissions");
                else toast.error("Complete previous steps correctly first.");
              }} 
              className={navLinkStyle(step, "permissions")}
            >
              Permissions
            </button>
            <button 
              onClick={() => {
                if (selectedCategories.length > 0 && username.trim() && locationGranted) setStep("complete");
                else toast.error("Please grant location permission to proceed.");
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
                Step {step === "interests" ? "1" : step === "profile" ? "2" : step === "permissions" ? "3" : "4"} of 4
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
                      <div className="mt-2 text-xs min-h-[20px]">
                        {usernameStatus === "checking" && (
                          <p className="text-muted-foreground">
                            Checking username...
                          </p>
                        )}

                        {usernameStatus === "available" && (
                          <p className="text-green-600">
                            ✓ Username available
                          </p>
                        )}

                        {usernameStatus === "taken" && (
                          <p className="text-red-500">
                            Username already taken
                          </p>
                        )}

                        {usernameStatus === "invalid" && (
                          <p className="text-red-500">
                            {isValidUsername(username).message}
                          </p>
                        )}

                        {usernameStatus === "idle" && (
                          <p className="text-muted-foreground">
                            Letters, numbers and underscores only.
                          </p>
                        )}
                      </div>
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
                      onClick={handleNextToPermissions}
                      disabled={
                        !username.trim() ||
                        usernameStatus === "checking" ||
                        usernameStatus === "taken" ||
                        usernameStatus === "invalid"
                      }
                      className="bg-primary hover:bg-primary/95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      Continue to Permissions
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: PERMISSIONS */}
              {step === "permissions" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="font-headline-lg text-headline-lg text-foreground">
                      App Permissions
                    </h1>
                    <p className="font-body-lg text-body-lg text-muted-foreground max-w-lg mx-auto">
                      Connextaa needs a few permissions to function correctly.
                    </p>
                  </div>

                  <div className="space-y-4 mt-6">
                    {/* Location Permission (Mandatory) */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      locationGranted
                        ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
                        : "border-border bg-card"
                    }`}>
                      <div className={`p-3 rounded-xl shrink-0 ${
                        locationGranted 
                          ? "bg-green-500 text-white" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-base tracking-tight">Location Services</h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive uppercase tracking-wider">
                            Mandatory
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-normal">
                          For iOS devices, do <span className="font-bold text-foreground">Add to Home Screen!</span> from browser.
                          We use your location to find nearby activities, show you neighborhood collaborations, and compute distances.
                        </p>
                        <div className="pt-1">
                          {locationGranted ? (
                            <div className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm">
                              <Check className="w-4 h-4" />
                              <span>Location Access Granted</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={requestLocation}
                              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                            >
                              Grant Location Access
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notification Permission (Optional) */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      notificationStatus === "granted"
                        ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
                        : notificationStatus === "denied"
                        ? "border-destructive/30 bg-destructive/5 dark:bg-destructive/10"
                        : "border-border bg-card"
                    }`}>
                      <div className={`p-3 rounded-xl shrink-0 ${
                        notificationStatus === "granted"
                          ? "bg-green-500 text-white"
                          : notificationStatus === "denied"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {notificationStatus === "denied" ? (
                          <BellOff className="w-6 h-6" />
                        ) : (
                          <Bell className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-base tracking-tight">Real-time Notifications</h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wider">
                            Optional
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-normal">
                          Get notified when neighbors request to join your activities, approve your requests, or message you.
                        </p>
                        <div className="pt-1">
                          {notificationStatus === "granted" ? (
                            <div className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm">
                              <Check className="w-4 h-4" />
                              <span>Notifications Enabled</span>
                            </div>
                          ) : notificationStatus === "denied" ? (
                            <div className="inline-flex items-center gap-1.5 text-destructive font-semibold text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>Notifications Blocked (Enable in browser settings to receive alerts)</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={requestNotifications}
                              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                            >
                              Enable Notifications
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <button
                      onClick={() => setStep("profile")}
                      className="flex items-center gap-1.5 font-label-md text-label-md text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Profile</span>
                    </button>
                    <button
                      onClick={handleNextToComplete}
                      disabled={!locationGranted}
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
                      onClick={() => setStep("permissions")}
                      disabled={submitting}
                      className="flex items-center gap-1.5 font-label-md text-label-md text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Permissions</span>
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
