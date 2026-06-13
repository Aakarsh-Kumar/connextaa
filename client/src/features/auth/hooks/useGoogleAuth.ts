"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "../api/authApi";
import { CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import toast from "react-hot-toast";

export const useGoogleAuth = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google authentication failed. No token received.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.googleLogin(idToken);
      setUser(response.user);
      
      toast.success("Logged in successfully!");
      if (response.user.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.response.message || "Login failed. Please try again.");
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
