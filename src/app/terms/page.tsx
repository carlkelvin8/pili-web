import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Pili AdheSeal",
  description: "Terms and conditions governing the use of Pili AdheSeal products, services, and website.",
};

export default function TermsPage() {
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
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400">Terms of Service</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="bg-[#0a2e2e] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3ecbac]/[0.04] rounded-full blur-[200px]" />
        </div>
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-16 sm:py-24 relative z-10">
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/25 font-medium">Legal</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 tracking-tight leading-[0.95]">
            Terms of Service
          </h1>
          <p className="mt-6 text-white/35 text-sm tracking-wide">
            Last updated July 25, 2026
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="space-y-12">
          <Section num="01" title="Acceptance of Terms">
            By accessing and using the Pili AdheSeal website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
          </Section>

          <Section num="02" title="Products and Services">
            <p>Pili AdheSeal Inc. manufactures and supplies bio-based adhesives, sealants, glues, and related industrial products. All product specifications, descriptions, and images on this website are for informational purposes only. We reserve the right to modify product specifications without prior notice.</p>
            <ul className="mt-4 space-y-2">
              <li>Custom formulations are subject to separate agreements and technical consultations.</li>
              <li>Product availability may vary by region and order volume.</li>
              <li>Pricing is subject to change without prior notice.</li>
            </ul>
          </Section>

          <Section num="03" title="Orders and Payment">
            <p>By placing an order through our website, you agree to provide accurate and complete information. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraudulent activity.</p>
            <ul className="mt-4 space-y-2">
              <li>Payment must be received before order processing begins.</li>
              <li>Shipping fees are calculated separately and may vary by location.</li>
              <li>Order confirmation does not guarantee product availability.</li>
            </ul>
          </Section>

          <Section num="04" title="Shipping and Delivery">
            We aim to process and ship orders promptly. Delivery times are estimates and may vary based on location, courier service, and other factors. Pili AdheSeal is not responsible for delays caused by shipping carriers or customs processing.
          </Section>

          <Section num="05" title="Returns and Refunds">
            Due to the nature of our products, returns may be subject to specific conditions. Custom-formulated products are generally non-returnable. For standard products, please contact our team within 7 days of delivery to discuss return options. Refunds will be processed to the original payment method within a reasonable timeframe.
          </Section>

          <Section num="06" title="Intellectual Property">
            All content on this website, including text, graphics, logos, images, and software, is the property of Pili AdheSeal Inc. and is protected by Philippine and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </Section>

          <Section num="07" title="Limitation of Liability">
            Pili AdheSeal Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service in question.
          </Section>

          <Section num="08" title="Privacy">
            Your use of our website is also governed by our Privacy Policy. Please review our{" "}
            <Link href="/cookies" className="text-[#3ecbac] hover:underline font-medium">Cookies Policy</Link>{" "}
            for information on how we collect and use data.
          </Section>

          <Section num="09" title="Governing Law">
            These Terms of Service are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Batangas City, Philippines.
          </Section>

          <Section num="10" title="Contact Us">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <div className="mt-4 space-y-1.5">
              <p>
                <a href="mailto:info@pili-adheseal.com" className="text-[#3ecbac] hover:underline font-medium">info@pili-adheseal.com</a>
              </p>
              <p className="text-gray-400 text-[13px]">Ventures Hub BatStateU KIST Park, Alangilan, Batangas City, PH, 4200</p>
            </div>
          </Section>
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

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-[11px] font-mono text-gray-300 tracking-wider">{num}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0a2e2e] tracking-tight">{title}</h2>
      </div>
      <div className="pl-0 sm:pl-12 text-[14px] text-gray-500 leading-relaxed space-y-1">
        {typeof children === "string" ? <p>{children}</p> : children}
      </div>
    </section>
  );
}
