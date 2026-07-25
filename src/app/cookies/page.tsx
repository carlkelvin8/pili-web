import Link from "next/link";

export const metadata = {
  title: "Cookies Policy | Pili AdheSeal",
  description: "Information about how Pili AdheSeal uses cookies and similar technologies on our website.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-[#0a2e2e]">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-[#0a2e2e] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400">Cookies Policy</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="bg-[#0a2e2e] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#3ecbac]/[0.04] rounded-full blur-[200px]" />
        </div>
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-16 sm:py-24 relative z-10">
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/25 font-medium">Legal</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 tracking-tight leading-[0.95]">
            Cookies Policy
          </h1>
          <p className="mt-6 text-white/35 text-sm tracking-wide">
            Last updated July 25, 2026
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="space-y-16">
          {/* What Are Cookies */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-4">What Are Cookies</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-4">How We Use Cookies</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Pili AdheSeal uses cookies to enhance your experience on our website. We use cookies for the following purposes:
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-px bg-black/[0.04]">
              <CookieType
                title="Essential"
                desc="Necessary for the website to function properly. They enable core features like shopping cart, authentication, and security."
              />
              <CookieType
                title="Preference"
                desc="Remember your settings and preferences to provide a more personalized experience."
              />
              <CookieType
                title="Analytics"
                desc="Help us understand how visitors interact with our website by collecting anonymous data about page views and behavior."
              />
            </div>
          </section>

          {/* Specific Cookies */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-6">Specific Cookies We Use</h2>
            <div className="border border-black/[0.06]">
              <div className="grid grid-cols-[1fr_2fr_1fr] text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-400 border-b border-black/[0.06]">
                <div className="px-5 py-3">Cookie</div>
                <div className="px-5 py-3">Purpose</div>
                <div className="px-5 py-3">Duration</div>
              </div>
              {[
                { name: "sb-*", purpose: "Supabase authentication session", duration: "Session" },
                { name: "pili-cart", purpose: "Shopping cart contents (localStorage)", duration: "Persistent" },
                { name: "next-*", purpose: "Next.js framework cookies", duration: "Session" },
              ].map((row, i) => (
                <div key={row.name} className={`grid grid-cols-[1fr_2fr_1fr] text-[13px] ${i < 2 ? "border-b border-black/[0.06]" : ""}`}>
                  <div className="px-5 py-4 font-mono text-[12px] text-gray-400">{row.name}</div>
                  <div className="px-5 py-4 text-gray-500">{row.purpose}</div>
                  <div className="px-5 py-4 text-gray-400">{row.duration}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Third-Party */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-4">Third-Party Cookies</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              We may use third-party services that place cookies on your device. These services include:
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-px bg-black/[0.04]">
              <ThirdPartyService
                name="Supabase"
                desc="Authentication and database services."
                href="https://supabase.com/privacy"
              />
              <ThirdPartyService
                name="Vercel"
                desc="Hosting and analytics."
                href="https://vercel.com/legal/privacy-policy"
              />
            </div>
          </section>

          {/* Managing */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-4">Managing Cookies</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="mt-4 space-y-2 text-[14px] text-gray-500">
              <li className="flex items-start gap-3">
                <span className="w-1 h-1 rounded-full bg-[#0a2e2e] mt-2.5 shrink-0" />
                View and delete cookies
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1 h-1 rounded-full bg-[#0a2e2e] mt-2.5 shrink-0" />
                Block all cookies or block third-party cookies
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1 h-1 rounded-full bg-[#0a2e2e] mt-2.5 shrink-0" />
                Accept all cookies or accept only certain cookies
              </li>
            </ul>
            <p className="text-[14px] text-gray-400 leading-relaxed mt-4">
              Please note that disabling cookies may affect the functionality of our website. Certain features, such as the shopping cart and user authentication, require essential cookies to work properly.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-4">Changes to This Policy</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              We may update this Cookies Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight mb-4">Contact Us</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="mt-4 space-y-1.5">
              <p>
                <a href="mailto:info@pili-adheseal.com" className="text-[#3ecbac] hover:underline font-medium text-[14px]">info@pili-adheseal.com</a>
              </p>
              <p className="text-gray-400 text-[13px]">Ventures Hub BatStateU KIST Park, Alangilan, Batangas City, PH, 4200</p>
            </div>
          </section>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-black/5">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-[11px] tracking-wide uppercase font-medium text-gray-400 hover:text-[#0a2e2e] transition-colors">
            Back to Home
          </Link>
          <div className="flex items-center gap-6 text-[11px] tracking-wide text-gray-400">
            <Link href="/terms" className="hover:text-[#0a2e2e] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[#0a2e2e] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieType({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white p-6">
      <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-[#0a2e2e] mb-3">{title}</h3>
      <p className="text-[13px] text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function ThirdPartyService({ name, desc, href }: { name: string; desc: string; href: string }) {
  return (
    <div className="bg-white p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-[15px] font-bold text-[#0a2e2e] mb-1">{name}</h3>
        <p className="text-[13px] text-gray-400">{desc}</p>
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="mt-4 text-[11px] tracking-wide uppercase font-medium text-[#3ecbac] hover:underline inline-flex items-center gap-1.5">
        Privacy Policy
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>
  );
}
