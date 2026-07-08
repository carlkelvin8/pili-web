"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 150);

    // Hide loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`loading-screen ${!isLoading ? "hidden" : ""}`}>
      {/* Logo animation */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="w-28 h-28 rounded-full border-2 border-white/20 flex items-center justify-center animate-logo-spin">
          <div className="w-24 h-24 rounded-full border border-[var(--color-primary-light)]/40" />
        </div>
        {/* Center logo text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-logo-pulse">
            <img
              src="/logo.png"
              alt="Pili AdheSeal"
              className="w-14 h-14 object-contain"
              onError={(e) => {
                // Fallback if logo.png doesn't exist yet
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML =
                  '<span class="text-2xl font-bold text-[var(--color-primary-light)]">PA</span>';
              }}
            />
          </div>
        </div>
      </div>

      {/* Company name */}
      <h2 className="text-white text-xl font-semibold tracking-wide mb-6 font-[var(--font-poppins)]">
        Pili AdheSeal Inc.
      </h2>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-primary-light)] to-white rounded-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Loading text */}
      <p className="mt-4 text-white/50 text-sm tracking-widest uppercase">
        Loading
      </p>
    </div>
  );
}
