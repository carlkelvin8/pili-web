export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-gray-400">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="Pili AdheSeal Inc." className="w-10 h-10 object-contain" />
              <h3 className="text-xl font-bold text-white">Pili AdheSeal Inc.</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              High-performance sealants, adhesives, and bonding solutions customized for every industry. Proudly Filipino-engineered.
            </p>
            {/* Social icons placeholder */}
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Email"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Products</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#products" className="hover:text-[var(--color-primary-light)] transition-colors">Pili Seal</a></li>
              <li><a href="#products" className="hover:text-[var(--color-primary-light)] transition-colors">Pili Adhesive</a></li>
              <li><a href="#products" className="hover:text-[var(--color-primary-light)] transition-colors">Pili Hybrid Sealant</a></li>
              <li><a href="#products" className="hover:text-[var(--color-primary-light)] transition-colors">Pili Glue</a></li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Industries</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#industries" className="hover:text-[var(--color-primary-light)] transition-colors">Defense & Military</a></li>
              <li><a href="#industries" className="hover:text-[var(--color-primary-light)] transition-colors">Construction</a></li>
              <li><a href="#industries" className="hover:text-[var(--color-primary-light)] transition-colors">Automotive</a></li>
              <li><a href="#industries" className="hover:text-[var(--color-primary-light)] transition-colors">Marine</a></li>
              <li><a href="#industries" className="hover:text-[var(--color-primary-light)] transition-colors">Aerospace</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#about" className="hover:text-[var(--color-primary-light)] transition-colors">About Us</a></li>
              <li><a href="#why-us" className="hover:text-[var(--color-primary-light)] transition-colors">Why Choose Us</a></li>
              <li><a href="#contact" className="hover:text-[var(--color-primary-light)] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-lg font-semibold text-white">Visit Us</h4>
              <p className="mt-2 text-sm leading-relaxed">
                Located at BatStateU STEER Hub — Science, Technology, Engineering and Environment Research.
              </p>
              <div className="mt-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--color-primary-light)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">
                  BatStateU STEER Hub, Batangas State University, Batangas, Philippines
                </span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4536.041736891112!2d121.07167841228846!3d13.784558809360943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd0f3a2014be09%3A0x19a47167a4f63785!2sBatStateU%20Science%2C%20Technology%2C%20Engineering%20and%20Environment%20Research%20-%20STEER%20Hub!5e0!3m2!1sen!2sph!4v1783496595495!5m2!1sen!2sph"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pili AdheSeal Inc. Location - BatStateU STEER Hub"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Pili AdheSeal Inc. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Engineered with pride in the Philippines 🇵🇭
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
