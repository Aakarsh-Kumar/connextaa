"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function GoogleLoginButton({ compactOnMobile, from }: { compactOnMobile?: boolean; from?: string }) {
  const { handleGoogleSuccess, handleGoogleError, loading } = useGoogleAuth({ from });
  const isMobile = useIsMobile();
  
  if (compactOnMobile && isMobile) {
    return (
      <div className="transition-transform duration-200 hover:scale-[1.02]">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="filled_blue"
          shape="circle"
          size="medium"
          text="signin"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {loading ? (
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      ) : (
        <div className="transition-transform duration-200 hover:scale-[1.02]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            shape="circle"
            size={"large"}
            text={"signin_with"}
          />
        </div>
      )}
    </div>
  );
}
