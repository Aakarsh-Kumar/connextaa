"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "../api/authApi";
import { CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import toast from "react-hot-toast";

export const useGoogleAuth = (options?: { from?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google authentication failed. No token received.");
      return;
    }

    // Preserve the `from` query param (set by middleware when accessing protected routes unauthenticated)
    const from = options?.from || searchParams.get("from") || "/dashboard";

    setLoading(true);
    try {
      const response = await authApi.googleLogin(idToken);
      setUser(response.user);

      toast.success("Logged in successfully!");

      if (response.user.onboardingCompleted) {
        // Redirect directly to the intended page
        router.push(from);
      } else {
        // Pass `from` through onboarding so after completion we still land on the right page
        router.push(`/onboarding?from=${encodeURIComponent(from)}`);
      }
    } catch (error: unknown) {
      console.error("Google login error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    loading,
  };
};
