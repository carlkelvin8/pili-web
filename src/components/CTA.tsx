export default function CTA() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[var(--color-dark)] via-[var(--color-primary)] to-[var(--color-accent)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[var(--color-primary-light)]/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Ready to Find Your
          <br />
          <span className="text-[var(--color-primary-light)]">Perfect Bonding Solution?</span>
        </h2>
        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Whether you need an off-the-shelf product or a fully custom formulation,
          our team is ready to engineer the right solution for your application.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--color-primary)] font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-lg"
          >
            Start a Project
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white hover:bg-white/10 transition-all duration-300 text-lg"
          >
            Explore Products
          </a>
        </div>
      </div>
    </section>
  );
}
