"use client";

import { useEffect, useRef } from "react";

interface HeroData {
  badge?: string;
  heading?: string;
  highlight?: string;
  subheading?: string;
  ctaPrimary?: string;
  ctaPrimaryLink?: string;
  ctaSecondary?: string;
  ctaSecondaryLink?: string;
  productTags?: string[];
}

const defaults: HeroData = {
  badge: "Proudly Filipino-Engineered",
  heading: "Pili AdheSeal",
  highlight: "Sustainable Solutions",
  subheading: "Transforming agricultural waste into innovative yet high-performance solutions that create value for industries, empower farming communities, and protect the environment.",
  ctaPrimary: "View Our Products",
  ctaPrimaryLink: "#products",
  ctaSecondary: "Get in Touch",
  ctaSecondaryLink: "#contact",
  productTags: ["Pili Adhesive", "Pili Glue", "Pili Glue Stick", "Pili Seal", "Pili Hybrid Sealant"],
};

export default function Hero({ data }: { data?: HeroData | null }) {
  const d = { ...defaults, ...data };
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const scrolled = window.scrollY;
      const parallaxElements = sectionRef.current.querySelectorAll("[data-parallax]");
      parallaxElements.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.5");
        (el as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#041e1e] via-[#0d4d4d] to-[#1a8a6e] animate-gradient-shift" />
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(62,203,172,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(13,77,77,0.5) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(26,138,110,0.3) 0%, transparent 50%)",
          }}
        />
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div data-parallax="0.3" className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full border border-white/10 animate-float" />
        <div data-parallax="0.5" className="absolute bottom-[25%] left-[8%] w-20 h-20 rounded-full bg-[var(--color-primary-light)]/10 animate-float-delayed" />
        <div data-parallax="0.2" className="absolute top-[35%] left-[15%] w-16 h-16 border border-white/10 rotate-45 animate-float" />
        <div data-parallax="0.4" className="absolute bottom-[35%] right-[15%] w-32 h-32 rounded-full border-2 border-[var(--color-primary-light)]/15 animate-pulse-glow" />
        <div data-parallax="0.1" className="absolute top-[20%] left-[40%] w-40 h-40 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(62,203,172,0.8) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute top-[60%] right-[25%] w-48 h-48 rounded-full animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(62,203,172,0.15) 0%, transparent 70%)" }} />
        <div className="absolute top-[10%] left-[30%] w-72 h-72 rounded-full animate-float-delayed" style={{ background: "radial-gradient(circle, rgba(62,203,172,0.08) 0%, transparent 60%)" }} />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-[var(--color-primary-light)]/40 animate-particle" style={{ left: `${15 + i * 15}%`, top: `${60 + (i % 3) * 10}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${3 + i * 0.5}s` }} />
        ))}
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-scale inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary-light)] animate-pulse" />
          <span className="text-sm text-gray-200 font-medium">{d.badge}</span>
        </div>
        <h1 className="animate-slide-up text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight">
          {d.heading}
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-[var(--color-primary-light)] via-[#7edbbe] to-[var(--color-primary-light)] bg-clip-text text-transparent">
              {d.highlight}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </span>
        </h1>
        <p className="animate-slide-up-delayed mt-8 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {d.subheading}
        </p>
        <div className="animate-slide-up-more-delayed mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <a href={d.ctaPrimaryLink} className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary-light)] text-[var(--color-dark)] font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--color-primary-light)]/25 transition-all duration-300 hover:-translate-y-0.5 text-lg overflow-hidden">
            <span className="relative z-10">{d.ctaPrimary}</span>
            <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
          <a href={d.ctaSecondaryLink} className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 text-lg">
            <span>{d.ctaSecondary}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </a>
        </div>
        <div className="animate-slide-up-more-delayed mt-16 flex flex-wrap justify-center gap-3">
          {(d.productTags || []).map((tag, i) => (
            <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all duration-300" style={{ animationDelay: `${1.8 + i * 0.1}s` }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-slide-up-more-delayed">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-[var(--color-primary-light)] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
