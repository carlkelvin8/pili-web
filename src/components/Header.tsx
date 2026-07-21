"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Products", href: "#products" },
    { label: "News", href: "#news" },
    { label: "Contacts", href: "#contact" },
    { label: "Messages", href: "/messages" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2">
            <Image
              src="https://drive.google.com/uc?export=view&id=1zvZ75GUdFWmuKp0Ci0dhMxWUh17gOxkf"
              alt="Pili AdheSeal Inc."
              width={48}
              height={48}
              className="w-11 h-11 md:w-12 md:h-12 object-contain"
            />
            <span className="text-lg md:text-xl font-bold text-[var(--color-primary)]">
              Pili AdheSeal Inc.
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[var(--color-accent)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 px-2 text-sm font-medium text-gray-700 hover:text-[var(--color-accent)] hover:bg-gray-50 rounded"
                onClick={() => setMenuOpen(false)}
                target={link.href.startsWith("/") ? "_self" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}