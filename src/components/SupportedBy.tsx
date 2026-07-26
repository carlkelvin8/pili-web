const supporters = [
  "DOST",
  "DND",
  "DEP",
  "POPH",
  "DEVNIC",
  "PFAI",
  "GABAY",
  "K Asia Pacific",
  "ChaseChem",
];

export default function SupportedBy() {
  return (
    <section className="py-16 md:py-20 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            Partners & Supporters
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
            Supported By
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {supporters.map((name) => (
            <div
              key={name}
              className="px-6 py-4 bg-white border border-[var(--color-primary)]/10 rounded-xl hover:border-[var(--color-accent)]/40 hover:shadow-md transition-all duration-300"
            >
              <span className="text-sm sm:text-base font-bold text-[var(--color-primary)] tracking-wide">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
