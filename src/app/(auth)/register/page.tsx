"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

function fieldError(msg: string) {
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "w-1/5" };
    if (score <= 2) return { label: "Fair", color: "bg-yellow-400", width: "w-2/5" };
    if (score <= 3) return { label: "Good", color: "bg-blue-400", width: "w-3/5" };
    if (score <= 4) return { label: "Strong", color: "bg-green-400", width: "w-4/5" };
    return { label: "Very Strong", color: "bg-green-600", width: "w-full" };
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your full name";
    else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!email.trim()) errs.email = "Please enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address";
    if (!password) errs.password = "Please create a password";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (password.length > 128) errs.password = "Password must be less than 128 characters";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function friendlyError(msg: string): string {
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("User already registered"))
      return "This email is already registered. Please sign in instead.";
    if (msg.includes("invalid email") || msg.includes("Invalid email"))
      return "Please enter a valid email address.";
    if (msg.includes("network") || msg.includes("fetch"))
      return "Unable to connect. Please check your internet connection.";
    if (msg.includes("rate limit") || msg.includes("Too many"))
      return "Too many attempts. Please wait a moment and try again.";
    return "Something went wrong while creating your account. Please try again.";
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });

    if (signUpError) {
      setError(friendlyError(signUpError.message));
      setLoading(false);
      return;
    }

    if (data.user) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, email: email.trim(), name: name.trim() }),
      });

      if (!res.ok) {
        setError("Account was created but setup encountered an issue. Please try signing in.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
      router.refresh();
    }
  }

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#041e1e] via-[#0a2e2e] to-[#0d4d4d] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary-light)]/20 mb-4">
            <span className="text-2xl font-bold text-[var(--color-primary-light)]">PA</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)]">
            Admin Registration
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            Create an admin account for Pili AdheSeal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })); setError(""); }}
                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.name ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none transition-all text-[#0a2e2e]`}
                placeholder="Juan Dela Cruz"
              />
              {fieldErrors.name && fieldError(fieldErrors.name)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); setError(""); }}
                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.email ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none transition-all text-[#0a2e2e]`}
                placeholder="admin@piliadheseal.com"
              />
              {fieldErrors.email && fieldError(fieldErrors.email)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); setError(""); }}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border ${fieldErrors.password ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none transition-all text-[#0a2e2e]`}
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />}
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              {fieldErrors.password && fieldError(fieldErrors.password)}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-3">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-16 text-right">{strength.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Use 8+ characters with uppercase, numbers, and symbols</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); setError(""); }}
                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.confirmPassword ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none transition-all text-[#0a2e2e]`}
                placeholder="Re-enter your password"
              />
              {fieldErrors.confirmPassword && fieldError(fieldErrors.confirmPassword)}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Passwords match
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-200">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
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
                  Creating account...
                </>
              ) : "Create Admin Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link href="/login" className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
