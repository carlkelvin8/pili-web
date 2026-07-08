const industries = [
  {
    name: "Defense & Military",
    description:
      "Specialized sealants and adhesives meeting stringent military specifications. Engineered for extreme conditions — temperature resistance, chemical exposure, and structural integrity.",
    products: ["Pili Seal for Defense", "Pili Adhesive for Defense"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: "Construction",
    description:
      "Durable, weather-resistant bonding solutions for structural joints, curtain walls, flooring, and roofing. Formulated for long-term outdoor performance.",
    products: ["Pili Seal for Construction", "Pili Hybrid Sealant for Construction"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Automotive",
    description:
      "Vibration-dampening adhesives and flexible sealants for body panels, windshields, and engine components. Resistant to oils, fuels, and temperature cycling.",
    products: ["Pili Hybrid Sealant for Automotive", "Pili Adhesive for Automotive"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m-8 4h4m-2 8H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-3m-6 0v-4m0 4h6m-6 0H9" />
      </svg>
    ),
  },
  {
    name: "Marine",
    description:
      "Saltwater-resistant, anti-corrosion sealants for hulls, decks, and fittings. Engineered to withstand constant water immersion and UV exposure.",
    products: ["Pili Seal for Marine", "Pili Glue for Marine"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    name: "Electronics & Manufacturing",
    description:
      "Precision adhesives for PCB assembly, component encapsulation, and device sealing. Clean application with controlled cure profiles.",
    products: ["Pili Glue for Electronics", "Pili Adhesive for Manufacturing"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    name: "Aerospace",
    description:
      "Lightweight, high-strength bonding solutions for airframe assembly, fuel tank sealing, and composite joining. Meets aerospace-grade performance standards.",
    products: ["Pili Seal for Aerospace", "Pili Hybrid Sealant for Aerospace"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
];

export default function Industries() {
  return (
    <section id="industries" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto scroll-reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
            Industries We Serve
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We customize every product to match the unique demands of your sector.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {industries.map((industry) => (
            <div
              key={industry.name}
              className="group border border-gray-200 rounded-2xl p-6 hover:border-[var(--color-accent)] hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--color-light)] flex items-center justify-center text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                {industry.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--color-primary)]">
                {industry.name}
              </h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                {industry.description}
              </p>
              <div className="mt-4 space-y-1">
                {industry.products.map((p) => (
                  <div key={p} className="text-xs text-[var(--color-accent)] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)]" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
