import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
