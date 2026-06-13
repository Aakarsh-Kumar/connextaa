import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-600/10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-400/10 blur-[120px] dark:bg-violet-600/10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl p-8 space-y-8 relative z-10 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            Connectify
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Find people for anything and collaborate.
          </p>
        </div>

        <div className="py-2">
          <GoogleLoginButton />
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed px-4">
          By signing in, you agree to our{" "}
          <Link href="#" className="underline hover:text-slate-600 dark:hover:text-slate-400">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-slate-600 dark:hover:text-slate-400">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
