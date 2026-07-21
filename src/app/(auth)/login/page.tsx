"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function fieldError(msg: string) {
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [registeredMessage] = useState(() =>
    searchParams.get("registered") === "true"
      ? "Account created successfully! Please sign in."
      : ""
  );

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Please enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address";
    if (!password) errs.password = "Please enter your password";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function friendlyError(msg: string): string {
    if (msg.includes("Invalid login credentials")) return "The email or password you entered is incorrect. Please try again.";
    if (msg.includes("Email not confirmed")) return "Your email has not been verified yet. Please check your inbox.";
    if (msg.includes("Too many requests")) return "Too many login attempts. Please wait a moment and try again.";
    if (msg.includes("network") || msg.includes("fetch")) return "Unable to connect. Please check your internet connection.";
    return "Something went wrong while signing in. Please try again.";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }

    router.push("/admin/analytics");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#041e1e] via-[#0a2e2e] to-[#0d4d4d] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary-light)]/20 mb-4">
            <span className="text-2xl font-bold text-[var(--color-primary-light)]">PA</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)]">
            Admin Login
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            Sign in to manage Pili AdheSeal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); setError(""); }}
                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.email ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-[#3ecbac]"} focus:ring-2 focus:border-transparent outline-none transition-all text-[#0a2e2e]`}
                placeholder="admin@piliadheseal.com"
              />
              {fieldErrors.email && fieldError(fieldErrors.email)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); setError(""); }}
                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.password ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-[#3ecbac]"} focus:ring-2 focus:border-transparent outline-none transition-all text-[#0a2e2e]`}
                placeholder="Enter your password"
              />
              {fieldErrors.password && fieldError(fieldErrors.password)}
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-200">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {registeredMessage && (
              <div className="flex items-start gap-3 bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 border border-green-200">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{registeredMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
            <Link href="/messages" className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] transition-colors block">
              Customer? Go to Messages
            </Link>
            <Link href="/register" className="text-sm text-gray-400 hover:text-[#3ecbac] transition-colors block">
              Don&apos;t have an admin account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
