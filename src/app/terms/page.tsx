import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Pili AdheSeal",
  description: "Terms and conditions governing the use of Pili AdheSeal products, services, and website.",
};

export default function TermsPage() {
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
          <h1 className="text-sm font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a2e2e] mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 25, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using the Pili AdheSeal website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">2. Products and Services</h2>
              <p className="text-gray-600 leading-relaxed">
                Pili AdheSeal Inc. manufactures and supplies bio-based adhesives, sealants, glues, and related industrial products. All product specifications, descriptions, and images on this website are for informational purposes only. We reserve the right to modify product specifications without prior notice.
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1 ml-4">
                <li>Custom formulations are subject to separate agreements and technical consultations.</li>
                <li>Product availability may vary by region and order volume.</li>
                <li>Pricing is subject to change without prior notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">3. Orders and Payment</h2>
              <p className="text-gray-600 leading-relaxed">
                By placing an order through our website, you agree to provide accurate and complete information. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraudulent activity.
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1 ml-4">
                <li>Payment must be received before order processing begins.</li>
                <li>Shipping fees are calculated separately and may vary by location.</li>
                <li>Order confirmation does not guarantee product availability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">4. Shipping and Delivery</h2>
              <p className="text-gray-600 leading-relaxed">
                We aim to process and ship orders promptly. Delivery times are estimates and may vary based on location, courier service, and other factors. Pili AdheSeal is not responsible for delays caused by shipping carriers or customs processing.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">5. Returns and Refunds</h2>
              <p className="text-gray-600 leading-relaxed">
                Due to the nature of our products, returns may be subject to specific conditions. Custom-formulated products are generally non-returnable. For standard products, please contact our team within 7 days of delivery to discuss return options. Refunds will be processed to the original payment method within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">6. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of Pili AdheSeal Inc. and is protected by Philippine and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                Pili AdheSeal Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service in question.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">8. Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your use of our website is also governed by our Privacy Policy. Please review our{" "}
                <Link href="/cookies" className="text-[var(--color-accent)] hover:underline font-medium">Cookies Policy</Link>{" "}
                for information on how we collect and use data.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">9. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Batangas City, Philippines.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0a2e2e] mb-3">10. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
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
