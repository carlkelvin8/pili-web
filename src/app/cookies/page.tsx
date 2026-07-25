import Link from "next/link";

export const metadata = {
  title: "Cookies Policy | Pili AdheSeal",
  description: "Information about how Pili AdheSeal uses cookies and similar technologies on our website.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      <div className="bg-gradient-to-r from-[#0a2e2e] to-[#0d4d4d] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <h1 className="text-sm font-bold">Cookies Policy</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a2e2e] mb-2">Cookies Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 25, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">What Are Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">How We Use Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Pili AdheSeal uses cookies to enhance your experience on our website. We use cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1 ml-4">
                <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly. They enable core features like shopping cart functionality, user authentication, and security.</li>
                <li><strong>Preference Cookies:</strong> These remember your settings and preferences to provide a more personalized experience.</li>
                <li><strong>Analytics Cookies:</strong> These help us understand how visitors interact with our website by collecting anonymous data about page views, traffic sources, and user behavior.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left mt-4 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 font-semibold text-[#0a2e2e]">Cookie</th>
                      <th className="py-3 px-4 font-semibold text-[#0a2e2e]">Purpose</th>
                      <th className="py-3 px-4 font-semibold text-[#0a2e2e]">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-xs">sb-*</td>
                      <td className="py-3 px-4">Supabase authentication session</td>
                      <td className="py-3 px-4">Session</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-xs">pili-cart</td>
                      <td className="py-3 px-4">Shopping cart contents (localStorage)</td>
                      <td className="py-3 px-4">Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-xs">next-* </td>
                      <td className="py-3 px-4">Next.js framework cookies</td>
                      <td className="py-3 px-4">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We may use third-party services that place cookies on your device. These services include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1 ml-4">
                <li><strong>Supabase:</strong> For authentication and database services. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Supabase Privacy Policy</a>.</li>
                <li><strong>Vercel:</strong> For hosting and analytics. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Vercel Privacy Policy</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">Managing Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1 ml-4">
                <li>View and delete cookies</li>
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Accept all cookies</li>
                <li>Accept only certain cookies</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-3">
                Please note that disabling cookies may affect the functionality of our website. Certain features, such as the shopping cart and user authentication, require essential cookies to work properly.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookies Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="mt-3 text-gray-600 space-y-1">
                <p>Email: <a href="mailto:info@pili-adheseal.com" className="text-[var(--color-accent)] hover:underline">info@pili-adheseal.com</a></p>
                <p>Address: Ventures Hub BatStateU KIST Park, Alangilan, Batangas City, PH, 4200</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
