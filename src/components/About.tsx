export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="scroll-reveal-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
              About Pili AdheSeal Inc.
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                Pili AdheSeal Inc. is a Philippine-based manufacturer of high-performance
                sealants, adhesives, and bonding solutions. We specialize in developing
                products that meet the demanding requirements of diverse industries.
              </p>
              <p>
                Our core strength lies in <strong className="text-[var(--color-primary)]">customization</strong>.
                We engineer each product formulation to match the specific needs of your
                industry — whether it&apos;s extreme temperature resistance for defense
                applications or weatherproofing durability for construction.
              </p>
              <p>
                With a commitment to quality, innovation, and Filipino craftsmanship,
                we deliver bonding solutions that perform where it matters most.
              </p>
            </div>
          </div>

          {/* Stats / Highlights */}
          <div className="grid grid-cols-2 gap-6 stagger-children">
            {[
              { number: "4", label: "Core Product Lines" },
              { number: "10+", label: "Industry Applications" },
              { number: "100%", label: "Customizable Formulations" },
              { number: "PH", label: "Proudly Filipino" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[var(--color-light)] rounded-xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl sm:text-4xl font-bold text-[var(--color-accent)]">
                  {stat.number}
                </div>
                <div className="mt-2 text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
